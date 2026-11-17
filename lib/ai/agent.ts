import "server-only";
/**
 * Runs one turn of the concierge for one lead and returns the text to send.
 *
 * 1. Managed Agent (OBSERVER_AGENT_ID + OBSERVER_ENVIRONMENT_ID set): one session per lead, kept across turns,
 *    so the agent carries the whole conversation itself. Each turn sends fresh context as a system.message.
 * 2. Messages API tool loop (only ANTHROPIC_API_KEY set), also used for voice where latency matters.
 * 3. No key: the deterministic draft from the rules engine, so sandbox demos still work end to end.
 */
import type Anthropic from "@anthropic-ai/sdk";
import { claude, FALLBACK } from "./claude";
import { MODEL, SYSTEM_PROMPT, TOOLS, AGENT_NAME, turnContext } from "./definition";
import { runTool, type ToolCtx } from "./tools";
import { isOfficeOpen, formatLocal, type WeekHours } from "@/lib/growth/hours";
import { LANGUAGES } from "@/lib/growth/language";
import { firstName } from "@/lib/growth/send";

export interface TurnInput { ctx: ToolCtx; company: string; agentName: string | null; inbound: string | null; firstContact: boolean; mode?: "auto" | "messages"; instruction?: string }
export interface TurnResult { text: string; by: "managed-agent" | "messages" | "rules"; actions: string[] }

export async function runTurn(t: TurnInput): Promise<TurnResult> {
  const c = claude();
  const context = await buildContext(t);
  const userText = t.inbound?.trim() || (t.firstContact ? "(The lead submitted an enquiry form without a message.)" : "(No new message from the lead. Follow the instruction in the context.)");
  if (c && t.mode !== "messages" && process.env.OBSERVER_AGENT_ID && process.env.OBSERVER_ENVIRONMENT_ID) {
    try {
      return { text: await managedTurn(c, t, context, userText), by: "managed-agent", actions: t.ctx.actions };
    } catch (e) {
      console.error("managed agent turn failed; using Messages API", (e as Error).message);
    }
  }
  if (c) {
    try {
      return { text: await messagesTurn(c, t, context, userText), by: "messages", actions: t.ctx.actions };
    } catch (e) {
      console.error("messages turn failed; using rules", (e as Error).message);
    }
  }
  return { text: rulesReply(t), by: "rules", actions: t.ctx.actions };
}

async function buildContext(t: TurnInput) {
  const { db, lead, settings, channel } = t.ctx;
  const tz = lead.timezone ?? settings.timezone;
  const { data: recent } = await db.from("messages").select("direction, author, channel, body, created_at")
    .eq("lead_id", lead.id).order("created_at", { ascending: false }).limit(12);
  const lines = (recent ?? []).reverse().map((m) => `[${m.channel} ${m.author}] ${String(m.body).slice(0, 600)}`).join("\n");
  return turnContext({
    assistantName: settings.assistant_name, company: t.company, channel, officeOpen: isOfficeOpen(new Date(), settings.timezone, settings.office_hours as WeekHours, settings.holidays),
    nowLocal: formatLocal(new Date(), tz), leadTz: tz,
    lead: {
      name: lead.name, language: lead.language ? `${lead.language} (${LANGUAGES[lead.language as keyof typeof LANGUAGES] ?? lead.language})` : null,
      source: lead.source, score: lead.score, temp: lead.temp, area: lead.area, budget: lead.budget_aed ? `AED ${lead.budget_aed}` : null,
      intent: lead.intent, stage: lead.stage, assignedAgent: t.agentName,
    },
    firstContact: t.firstContact, instruction: t.instruction,
    // The managed session already holds its own history; only messages written by humans or other channels matter.
    recent: lead.agent_session_id ? lines.split("\n").filter((l) => /\[(\w+) (agent|system)\]/.test(l)).join("\n") : lines,
  });
}

// ── 1. Managed Agents ──────────────────────────────────────────────────────
async function managedTurn(c: Anthropic, t: TurnInput, context: string, userText: string) {
  const { db, lead } = t.ctx;
  let sessionId = lead.agent_session_id;
  if (!sessionId) {
    const s = await c.beta.sessions.create({
      agent: process.env.OBSERVER_AGENT_ID!, environment_id: process.env.OBSERVER_ENVIRONMENT_ID!,
      title: `Lead ${lead.id}`, metadata: { lead_id: lead.id, workspace_id: lead.workspace_id },
    });
    sessionId = s.id;
    await db.from("leads").update({ agent_session_id: sessionId }).eq("id", lead.id);
    lead.agent_session_id = sessionId;
  }
  // Open the stream before sending so no event is missed.
  const stream = await c.beta.sessions.events.stream(sessionId);
  await c.beta.sessions.events.send(sessionId, { events: [
    { type: "system.message", content: [{ type: "text", text: context }] },
    { type: "user.message", content: [{ type: "text", text: userText }] },
  ] });
  const texts: string[] = [];
  const deadline = Date.now() + 120_000;
  for await (const ev of stream) {
    if (Date.now() > deadline) throw new Error("managed agent turn timed out");
    if (ev.type === "agent.message") {
      texts.push(ev.content.map((b) => ("text" in b ? b.text : "")).join(""));
    } else if (ev.type === "agent.custom_tool_use") {
      const r = await runTool(ev.name, ev.input, t.ctx);
      await c.beta.sessions.events.send(sessionId, { events: [
        { type: "user.custom_tool_result", custom_tool_use_id: ev.id, content: [{ type: "text", text: r.text }], is_error: r.isError ?? false },
      ] });
    } else if (ev.type === "session.status_idle") {
      if (ev.stop_reason.type === "requires_action") continue;
      break;
    } else if (ev.type === "session.status_terminated" || ev.type === "session.error") {
      if (ev.type === "session.error") throw new Error(`session error: ${JSON.stringify(ev.error).slice(0, 200)}`);
      break;
    }
  }
  // The final message of the turn is what the lead receives.
  const text = texts.filter(Boolean).at(-1)?.trim();
  if (!text) throw new Error("managed agent produced no reply");
  return text;
}

// ── 2. Messages API tool loop ──────────────────────────────────────────────
async function messagesTurn(c: Anthropic, t: TurnInput, context: string, userText: string) {
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: `${context}\n\nThe lead's latest message:\n${userText}` }];
  const tools = TOOLS.map((x) => ({ name: x.name, description: x.description, input_schema: x.input_schema }));
  for (let step = 0; step < 8; step++) {
    const res = await c.beta.messages.create({
      model: MODEL, max_tokens: 4000, ...FALLBACK,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      output_config: { effort: t.ctx.channel === "voice" ? "low" : "medium" },
      tools, messages,
    });
    if (res.stop_reason === "refusal") throw new Error("refused");
    const uses = res.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (res.stop_reason !== "tool_use" || !uses.length) {
      const text = res.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text").map((b) => b.text).join("\n").trim();
      if (!text) throw new Error("empty reply");
      return text;
    }
    messages.push({ role: "assistant", content: res.content as Anthropic.Beta.BetaContentBlockParam[] });
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const u of uses) {
      const r = await runTool(u.name, u.input as Record<string, unknown>, t.ctx);
      results.push({ type: "tool_result", tool_use_id: u.id, content: r.text, is_error: r.isError });
    }
    messages.push({ role: "user", content: results });
  }
  throw new Error("too many tool steps");
}

// ── 3. Rules fallback ─────────────────────────────────────────────────────
const INTRO: Record<string, (a: string, co: string, n: string) => string> = {
  en: (a, co, n) => `Hi ${n}, I'm ${a}, the AI assistant at ${co}. A colleague can join at any time.`,
  ar: (a, co, n) => `مرحباً ${n}، أنا ${a}، المساعد الذكي في ${co}. يمكن لأحد زملائي الانضمام في أي وقت.`,
  hi: (a, co, n) => `नमस्ते ${n}, मैं ${a} हूँ, ${co} की AI सहायक। हमारी टीम का कोई भी सदस्य कभी भी जुड़ सकता है।`,
  ur: (a, co, n) => `السلام علیکم ${n}، میں ${a} ہوں، ${co} کی AI اسسٹنٹ۔ ہماری ٹیم کا کوئی بھی رکن کسی بھی وقت شامل ہو سکتا ہے۔`,
  es: (a, co, n) => `Hola ${n}, soy ${a}, la asistente de IA de ${co}. Un compañero puede unirse en cualquier momento.`,
  pt: (a, co, n) => `Olá ${n}, sou ${a}, a assistente de IA da ${co}. Um colega pode entrar na conversa a qualquer momento.`,
  ru: (a, co, n) => `Здравствуйте, ${n}! Я ${a}, ИИ-ассистент ${co}. Коллега может подключиться в любой момент.`,
  fr: (a, co, n) => `Bonjour ${n}, je suis ${a}, l'assistante IA de ${co}. Un collègue peut prendre le relais à tout moment.`,
  zh: (a, co, n) => `${n}您好，我是${co}的AI助理${a}。我的同事可以随时加入对话。`,
  fa: (a, co, n) => `سلام ${n}، من ${a} هستم، دستیار هوش مصنوعی ${co}. همکارانم هر زمان می‌توانند به گفتگو بپیوندند.`,
};
const THANKS: Record<string, string> = {
  en: "Thank you for your enquiry.", ar: "شكراً لاستفسارك.", hi: "आपकी पूछताछ के लिए धन्यवाद।", ur: "آپ کی دلچسپی کا شکریہ۔",
  es: "Gracias por su consulta.", pt: "Obrigada pelo seu contato.", ru: "Спасибо за ваш запрос.", fr: "Merci pour votre demande.", zh: "感谢您的咨询。", fa: "از درخواست شما سپاسگزاریم.",
};
const ASK: Record<string, string> = {
  ar: "هل العقار للسكن أم للاستثمار، وما الميزانية التقريبية التي تفكر بها؟",
  en: "Is this for your own home or an investment, and roughly what budget do you have in mind?",
  hi: "क्या यह आपके अपने घर के लिए है या निवेश के लिए, और आपका बजट लगभग कितना है?",
  ur: "کیا یہ آپ کے اپنے گھر کے لیے ہے یا سرمایہ کاری کے لیے، اور آپ کا بجٹ تقریباً کتنا ہے؟",
  es: "¿Es para vivir o como inversión, y qué presupuesto aproximado tiene en mente?",
  pt: "É para morar ou para investir, e qual é o orçamento aproximado?",
  ru: "Это для себя или для инвестиций, и на какой бюджет вы ориентируетесь?",
  fr: "Est-ce pour y vivre ou pour investir, et quel budget avez-vous en tête ?",
  zh: "请问是自住还是投资？大概的预算是多少？",
  fa: "برای سکونت است یا سرمایه‌گذاری، و تقریباً چه بودجه‌ای در نظر دارید؟",
};

export function rulesReply(t: Pick<TurnInput, "ctx" | "company" | "inbound" | "firstContact">) {
  const { lead, settings } = t.ctx;
  const lang = lead.language && INTRO[lead.language] ? lead.language : "en";
  const intro = t.firstContact ? INTRO[lang](settings.assistant_name, t.company, firstName(lead.name)) + "\n\n" : "";
  // The rules fallback never mentions specific homes or prices: it has no inventory to check them against.
  return intro + (t.firstContact ? THANKS[lang] + " " : "") + ASK[lang];
}

export { AGENT_NAME };
