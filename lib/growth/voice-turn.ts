import "server-only";
/**
 * Shared logic for the Twilio voice routes. Twilio waits at most ~15 s for each webhook, and a Claude turn
 * with tools can take longer, so a turn runs in the background: the caller hears a short "one moment",
 * Twilio polls /turn/wait every second, and the reply is spoken as soon as it is ready.
 */
import { after, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { verifyTwilio, signToken } from "./verify";
import { APP_URL, providers } from "./config";
import { sayLang, twimlTurn } from "./channels/voice";
import { runTurn } from "@/lib/ai/agent";
import { loadSettings, loadLead } from "./pipeline";
import { linkSecret } from "./guard";
import type { LeadRecord } from "./send";

export async function twilioParams(req: NextRequest) {
  const form = await req.formData();
  const params = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  const url = `${APP_URL()}${req.nextUrl.pathname}${req.nextUrl.search}`; // Twilio signs the public URL it called
  const valid = verifyTwilio(url, params, req.headers.get("x-twilio-signature"), process.env.TWILIO_AUTH_TOKEN);
  return { params, valid };
}

export const xml = (body: string) => new Response(body, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
export const hangup = () => xml(`<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`);

const GREETING: Record<string, (a: string, co: string) => string> = {
  en: (a, co) => `Hello, this is ${a}, the AI assistant from ${co}. This call may be recorded. How can I help with your property search?`,
  ar: (a, co) => `مرحباً، معك ${a}، المساعد الذكي من ${co}. قد يتم تسجيل هذه المكالمة. كيف يمكنني مساعدتك في البحث عن عقار؟`,
  hi: (a, co) => `नमस्ते, मैं ${co} की AI सहायक ${a} बोल रही हूँ। यह कॉल रिकॉर्ड की जा सकती है। मैं आपकी प्रॉपर्टी खोज में कैसे मदद करूँ?`,
  ur: (a, co) => `السلام علیکم، میں ${co} کی AI اسسٹنٹ ${a} بول رہی ہوں۔ یہ کال ریکارڈ ہو سکتی ہے۔ میں آپ کی کیسے مدد کروں؟`,
  es: (a, co) => `Hola, soy ${a}, la asistente de IA de ${co}. Esta llamada puede ser grabada. ¿En qué puedo ayudarle?`,
  pt: (a, co) => `Olá, aqui é ${a}, a assistente de IA da ${co}. Esta chamada pode ser gravada. Como posso ajudar?`,
  ru: (a, co) => `Здравствуйте, это ${a}, ИИ-ассистент ${co}. Звонок может записываться. Чем могу помочь?`,
  fr: (a, co) => `Bonjour, ici ${a}, l'assistante IA de ${co}. Cet appel peut être enregistré. Comment puis-je vous aider ?`,
  zh: (a, co) => `您好，我是${co}的AI助理${a}。本次通话可能会被录音。请问有什么可以帮您？`,
  fa: (a, co) => `سلام، ${a} هستم، دستیار هوش مصنوعی ${co}. این تماس ممکن است ضبط شود. چطور می‌توانم کمکتان کنم؟`,
};
const ONE_MOMENT: Record<string, string> = {
  en: "One moment.", ar: "لحظة من فضلك.", hi: "एक पल।", ur: "ایک لمحہ۔", es: "Un momento.", pt: "Um momento.", ru: "Одну секунду.", fr: "Un instant.", zh: "请稍等。", fa: "یک لحظه.",
};
const SORRY: Record<string, string> = {
  en: "Sorry, I'm having trouble right now. A colleague will call you back shortly. Goodbye.",
  ar: "عذراً، أواجه مشكلة الآن. سيتصل بك أحد زملائي قريباً. مع السلامة.",
};

/** Can this call speak the language? ElevenLabs speaks all ten; Twilio's voice only those switched on. */
const canSpeak = (lang: string) => lang === "en" || providers.tts() || sayLang(lang) !== "en-US";

const link = (path: string, leadId: string, secret: string, extra = "") => `${APP_URL()}/api/webhooks/twilio/voice${path}?lead=${leadId}&t=${signToken(leadId, secret, 3600)}${extra}`;

/** Speak a stored AI message and listen for the next utterance. */
function speakMessage(lead: LeadRecord, msg: { id: number; body: string; hangup?: boolean }, secret: string) {
  const audioUrl = providers.tts() ? `${APP_URL()}/api/voice/tts?m=${msg.id}&t=${signToken(String(msg.id), secret, 600)}` : undefined;
  return xml(twimlTurn({ audioUrl, text: msg.body, lang: lead.language ?? "en", actionUrl: link("/turn", lead.id, secret), hangup: msg.hangup }));
}

async function store(db: SupabaseClient, lead: LeadRecord, body: string, hang = false) {
  const { data } = await db.from("messages").insert({ workspace_id: lead.workspace_id, lead_id: lead.id, channel: "voice", direction: "out", author: "ai", body: body.slice(0, 8000), status: "sent", media: hang ? { hangup: true } : null }).select("id").single();
  return { id: data!.id as number, body, hangup: hang };
}

/**
 * New callers from UAE numbers choose English or Arabic first: the country code can't tell an Emirati from an
 * expat, and speech recognition listens in one language at a time.
 */
export async function languageMenu(db: SupabaseClient, lead: LeadRecord) {
  const secret = linkSecret();
  if (!secret) return hangup();
  const action = esc(link("/lang", lead.id, secret));
  let arabic = `<Say language="en-US">For Arabic, press 2.</Say>`;
  if (providers.tts()) {
    // ElevenLabs reads the Arabic line; store it so the signed audio link can find it.
    const { data } = await db.from("messages").insert({ workspace_id: lead.workspace_id, lead_id: lead.id, channel: "voice", direction: "out", author: "system", body: "للعربية، اضغط 2.", status: "sent" }).select("id").single();
    if (data) arabic = `<Play>${esc(`${APP_URL()}/api/voice/tts?m=${data.id}&t=${signToken(String(data.id), secret, 600)}`)}</Play>`;
  } else if (sayLang("ar") !== "en-US") arabic = `<Say language="${sayLang("ar")}">للعربية، اضغط 2.</Say>`;
  return xml(`<?xml version="1.0" encoding="UTF-8"?><Response><Gather input="dtmf" numDigits="1" timeout="6" action="${action}" method="POST"><Say language="en-US">For English, press 1.</Say>${arabic}</Gather><Redirect method="POST">${action}</Redirect></Response>`);
}

export async function greeting(db: SupabaseClient, lead: LeadRecord) {
  const secret = linkSecret();
  if (!secret) return hangup();
  const s = await loadSettings(db, lead.workspace_id);
  const { data: ws } = await db.from("workspaces").select("name").eq("id", lead.workspace_id).single();
  const g = (canSpeak(lead.language ?? "en") ? GREETING[lead.language ?? "en"] : GREETING.en) ?? GREETING.en;
  return speakMessage(lead, await store(db, lead, g(s.assistant_name, (ws?.name as string) ?? "our team")), secret);
}

/** The caller finished speaking: save it, start Claude in the background, keep the line warm. */
export async function heard(db: SupabaseClient, lead: LeadRecord, text: string) {
  const secret = linkSecret();
  if (!secret) return hangup();
  const { data: inbound } = await db.from("messages").insert({ workspace_id: lead.workspace_id, lead_id: lead.id, channel: "voice", direction: "in", author: "lead", body: text.slice(0, 8000), status: "received" }).select("id").single();
  await db.from("leads").update({ last_inbound_at: new Date().toISOString() }).eq("id", lead.id);
  after(async () => {
    try {
      const settings = await loadSettings(db, lead.workspace_id);
      const { data: ws } = await db.from("workspaces").select("name").eq("id", lead.workspace_id).single();
      const lang = lead.language ?? "en";
      const instruction = canSpeak(lang) ? undefined : "This phone line can only speak English. Answer in English, and offer to have a colleague who speaks the caller's language call them back.";
      const t = await runTurn({ ctx: { db, settings, lead, channel: "voice", actions: [] }, company: (ws?.name as string) ?? "our team", agentName: null, inbound: text, firstContact: false, mode: "messages", budgetMs: 25_000, instruction });
      const bye = /\b(bye|goodbye)\b|مع السلامة|अलविदा|خدا حافظ|adiós|tchau|до свидания|au revoir|再见/i.test(text) || t.actions.some((a) => a.startsWith("handover"));
      await store(db, lead, t.text, bye);
    } catch {
      await store(db, lead, SORRY[lead.language ?? "en"] ?? SORRY.en, true);
    }
  });
  const lang = canSpeak(lead.language ?? "en") ? lead.language ?? "en" : "en";
  return xml(`<?xml version="1.0" encoding="UTF-8"?><Response><Say language="${sayLang(lang)}">${esc(ONE_MOMENT[lang] ?? ONE_MOMENT.en)}</Say><Redirect method="POST">${esc(link("/turn/wait", lead.id, secret, `&after=${inbound?.id ?? 0}&n=0`))}</Redirect></Response>`);
}

/** Twilio polls here once a second until the reply exists (max ~30 s). */
export async function waitForReply(db: SupabaseClient, leadId: string, afterId: number, n: number) {
  const secret = linkSecret();
  const lead = await loadLead(db, leadId);
  if (!secret || !lead) return hangup();
  const { data } = await db.from("messages").select("id, body, media").eq("lead_id", leadId).eq("channel", "voice").eq("author", "ai").gt("id", afterId).order("id").limit(1);
  const m = data?.[0];
  if (m) return speakMessage(lead, { id: m.id as number, body: m.body as string, hangup: Boolean((m.media as { hangup?: boolean } | null)?.hangup) }, secret);
  if (n >= 30) return speakMessage(lead, await store(db, lead, SORRY[lead.language ?? "en"] ?? SORRY.en, true), secret);
  return xml(`<?xml version="1.0" encoding="UTF-8"?><Response><Pause length="1"/><Redirect method="POST">${esc(link("/turn/wait", lead.id, secret, `&after=${afterId}&n=${n + 1}`))}</Redirect></Response>`);
}
