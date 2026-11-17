import "server-only";
/**
 * The growth engine's orchestration: intake → score → route → first contact (2–3 minutes) → follow-ups,
 * inbound replies, escalation and hand-over. Runs with the service client from webhooks and the worker.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedLead } from "./normalize";
import { assessLead } from "@/lib/ai/score";
import { runTurn } from "@/lib/ai/agent";
import { handover, type ToolCtx } from "@/lib/ai/tools";
import { pickAgent, type Candidate } from "./routing";
import { detectLanguage } from "./language";
import { timezoneFromPhone, languageFromPhone } from "./phone";
import { isOfficeOpen, isQuietTime, nextSendTime, type WeekHours } from "./hours";
export { aiShouldReply };
import { deliver, reachable, firstName, type LeadRecord, type Settings, type OutChannel } from "./send";
import { notify } from "./notify";
import { aiShouldReply, STOP, replyChannel } from "./policy";
import { FIRST_CONTACT, FOLLOWUP, TEMPLATE_NAMES, render } from "./templates";
import { placeCall } from "./channels/voice";
import { providers, APP_URL } from "./config";
import { signToken } from "./verify";
import { linkSecret } from "./guard";

type DB = SupabaseClient;

export async function loadSettings(db: DB, workspaceId: string) {
  const { data } = await db.from("workspace_settings").select("*").eq("workspace_id", workspaceId).single();
  const s = data as Settings;
  return { ...s, quiet_start: String(s.quiet_start).slice(0, 5), quiet_end: String(s.quiet_end).slice(0, 5) };
}
export async function loadLead(db: DB, id: string) {
  const { data } = await db.from("leads").select("*").eq("id", id).maybeSingle();
  return data as LeadRecord | null;
}
async function companyName(db: DB, workspaceId: string) {
  const { data } = await db.from("workspaces").select("name").eq("id", workspaceId).single();
  return (data?.name as string) ?? "our team";
}
async function agentName(db: DB, userId: string | null) {
  if (!userId) return null;
  const { data } = await db.from("profiles").select("full_name").eq("id", userId).maybeSingle();
  return (data?.full_name as string) ?? null;
}

// ── Intake ────────────────────────────────────────────────────────────────
export async function ingestLead(db: DB, workspaceId: string, n: NormalizedLead) {
  // Idempotent on the provider's own id (webhooks retry).
  if (n.external_ref) {
    const { data: dup } = await db.from("leads").select("id").eq("workspace_id", workspaceId).eq("channel", n.channel).eq("external_ref", n.external_ref).maybeSingle();
    if (dup) return { id: dup.id as string, duplicate: true };
  }
  // The same person enquiring again within 30 days continues their existing conversation.
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  for (const [col, val] of [["phone", n.phone], ["email", n.email]] as const) {
    if (!val) continue;
    const { data: existing } = await db.from("leads").select("*").eq("workspace_id", workspaceId).eq(col, val).gte("created_at", since).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (existing) {
      if (n.message) await handleInbound(db, existing as LeadRecord, { channel: "web", text: `${n.source}: ${n.message}` });
      return { id: existing.id as string, duplicate: true };
    }
  }

  const settings = await loadSettings(db, workspaceId);
  const a = await assessLead({ name: n.name, message: n.message, source: n.source, area: n.area, budget: n.budget });
  const language = n.message ? a.language : detectLanguage(n.name);
  const { data: ws } = await db.from("workspaces").select("created_by").eq("id", workspaceId).single();
  const assigned = await route(db, workspaceId, { language, area: a.area, score: a.score, temp: a.temp });

  const { data: lead, error } = await db.from("leads").insert({
    workspace_id: workspaceId, created_by: ws!.created_by, assigned_to: assigned?.user_id ?? null,
    name: n.name, phone: n.phone, email: n.email, source: n.source.slice(0, 40), channel: n.channel, campaign: n.campaign, external_ref: n.external_ref,
    type: a.intent === "seller" ? "seller" : "buyer", intent: a.intent, language, score: a.score, temp: a.temp, score_reason: a.reason.slice(0, 600),
    area: a.area?.slice(0, 80) ?? null, budget_aed: a.budget_aed, timeframe: a.timeframe, financing: a.financing,
    consent_whatsapp: n.consent_whatsapp, consent_email: n.consent_email, timezone: timezoneFromPhone(n.phone, settings.timezone),
    serious: a.temp !== "cold", notes: n.message ? null : "Form submitted without a message.",
  }).select("*").single();
  if (error) throw error;

  if (n.message) await db.from("messages").insert({ workspace_id: workspaceId, lead_id: lead.id, channel: "web", direction: "in", author: "lead", body: n.message.slice(0, 8000), status: "received" });
  await db.from("activities").insert({ workspace_id: workspaceId, lead_id: lead.id, kind: "created", body: `From ${n.source}. Scored ${a.score} (${a.temp}) by ${a.by === "claude" ? "Claude" : "rules"}: ${a.reason}`.slice(0, 2000) });
  if (assigned) await db.from("activities").insert({ workspace_id: workspaceId, lead_id: lead.id, kind: "assigned", body: `Auto-routed: ${assigned.reason}` });

  const hot = a.score >= settings.escalate_score;
  const recipients = assigned ? [assigned.user_id] : await managers(db, workspaceId);
  for (const user_id of recipients) {
    await notify(db, { workspace_id: workspaceId, user_id, lead_id: lead.id, kind: hot ? "hot_lead" : "new_lead", urgent: hot,
      body: `${hot ? "Hot lead" : "New lead"}: ${n.name} from ${n.source}, score ${a.score}. ${a.reason}` }, settings);
  }
  if (settings.ai_enabled && reachable(lead as LeadRecord).length) {
    await enqueue(db, workspaceId, lead.id, "first_contact", new Date(Date.now() + settings.first_contact_delay_s * 1000));
  }
  return { id: lead.id as string, duplicate: false, score: a.score, temp: a.temp, assigned_to: assigned?.user_id ?? null };
}

/**
 * A lead who reached us first on WhatsApp or by phone: score, route and announce them like any other lead,
 * without a first-contact job (the conversation is already open).
 */
export async function createInboundLead(db: DB, workspaceId: string, i: { name: string | null; phone: string; text: string; source: string; channel: "whatsapp" | "phone"; campaign?: string | null; language?: string }) {
  const settings = await loadSettings(db, workspaceId);
  const a = await assessLead({ name: i.name ?? i.phone, message: i.text, source: i.source });
  const language = i.language ?? (i.text ? detectLanguage(i.text) : languageFromPhone(i.phone));
  const { data: ws } = await db.from("workspaces").select("created_by").eq("id", workspaceId).single();
  const assigned = await route(db, workspaceId, { language, area: a.area, score: a.score, temp: a.temp });
  const { data: lead, error } = await db.from("leads").insert({
    workspace_id: workspaceId, created_by: ws!.created_by, assigned_to: assigned?.user_id ?? null,
    name: (i.name ?? `+${i.phone}`).slice(0, 120), phone: i.phone, source: i.source.slice(0, 40), channel: i.channel, campaign: i.campaign ?? null,
    consent_whatsapp: i.channel === "whatsapp", language, intent: a.intent, type: a.intent === "seller" ? "seller" : "buyer",
    score: a.score, temp: a.temp, score_reason: a.reason.slice(0, 600), area: a.area?.slice(0, 80) ?? null, budget_aed: a.budget_aed,
    timeframe: a.timeframe, financing: a.financing, timezone: timezoneFromPhone(i.phone, settings.timezone), serious: a.temp !== "cold",
  }).select("*").single();
  if (error) throw error;
  await db.from("activities").insert({ workspace_id: workspaceId, lead_id: lead.id, kind: "created", body: `From ${i.source}. Scored ${a.score} (${a.temp}): ${a.reason}`.slice(0, 2000) });
  if (assigned) await db.from("activities").insert({ workspace_id: workspaceId, lead_id: lead.id, kind: "assigned", body: `Auto-routed: ${assigned.reason}` });
  const hot = a.score >= settings.escalate_score;
  for (const user_id of assigned ? [assigned.user_id] : await managers(db, workspaceId)) {
    await notify(db, { workspace_id: workspaceId, user_id, lead_id: lead.id, kind: hot ? "hot_lead" : "new_lead", urgent: hot,
      body: `${hot ? "Hot lead" : "New lead"} on ${i.channel === "phone" ? "the phone" : "WhatsApp"}: ${lead.name}, score ${a.score}. ${a.reason}` }, settings);
  }
  return lead as LeadRecord;
}

async function managers(db: DB, workspaceId: string) {
  const { data } = await db.from("workspace_members").select("user_id").eq("workspace_id", workspaceId).in("role", ["owner", "manager"]);
  return (data ?? []).map((r) => r.user_id as string);
}

async function route(db: DB, workspaceId: string, lead: { language: string; area: string | null; score: number; temp: "hot" | "warm" | "cold" }) {
  const { data: profiles } = await db.from("member_profiles").select("*").eq("workspace_id", workspaceId);
  if (!profiles?.length) return null;
  const { data: open } = await db.rpc("open_lead_counts", { ws: workspaceId });
  const load = new Map<string, number>((open as { user_id: string; open_leads: number }[] | null ?? []).map((r) => [r.user_id, Number(r.open_leads)]));
  const candidates: Candidate[] = profiles.map((p) => ({ ...p, open_leads: load.get(p.user_id as string) ?? 0 }) as Candidate);
  const picked = pickAgent(lead, candidates);
  if (picked) await db.from("member_profiles").update({ last_assigned_at: new Date().toISOString() }).eq("workspace_id", workspaceId).eq("user_id", picked.user_id);
  return picked;
}

export async function enqueue(db: DB, workspaceId: string, leadId: string | null, kind: string, runAt: Date, payload: Record<string, unknown> = {}) {
  await db.from("jobs").insert({ workspace_id: workspaceId, lead_id: leadId, kind, run_at: runAt.toISOString(), payload });
}

// ── Inbound (WhatsApp, email, web) ─────────────────────────────────────────
export async function handleInbound(db: DB, lead: LeadRecord, m: { channel: "whatsapp" | "email" | "web" | "voice"; text: string; subject?: string; providerId?: string }) {
  const { error } = await db.from("messages").insert({
    workspace_id: lead.workspace_id, lead_id: lead.id, channel: m.channel, direction: "in", author: "lead",
    subject: m.subject?.slice(0, 300) ?? null, body: m.text.slice(0, 8000), status: "received", provider_id: m.providerId ?? null,
  });
  if (error?.code === "23505") return { duplicate: true }; // provider retry
  const now = new Date().toISOString();
  await db.from("leads").update({ last_inbound_at: now, ...(m.channel === "whatsapp" ? { consent_whatsapp: true, last_whatsapp_in_at: now } : m.channel === "email" ? { consent_email: true } : {}) }).eq("id", lead.id);
  lead.last_inbound_at = now;
  if (m.channel === "whatsapp") lead.last_whatsapp_in_at = now;
  // Any reply cancels pending follow-ups.
  await db.from("jobs").update({ status: "cancelled" }).eq("lead_id", lead.id).eq("kind", "followup").eq("status", "pending");

  if (STOP.test(m.text)) {
    await db.from("leads").update({ opted_out: true, ai_mode: "paused" }).eq("id", lead.id);
    await db.from("jobs").update({ status: "cancelled" }).eq("lead_id", lead.id).eq("status", "pending");
    return { optedOut: true };
  }
  const settings = await loadSettings(db, lead.workspace_id);
  if (lead.assigned_to && lead.ai_mode !== "ai") {
    await notify(db, { workspace_id: lead.workspace_id, user_id: lead.assigned_to, lead_id: lead.id, kind: "reply", body: `${lead.name}: ${m.text.slice(0, 300)}` });
  }
  if (aiShouldReply(settings, lead, new Date(), await lastAgentAt(db, lead.id)) && m.channel !== "voice") {
    // Debounce bursts of short messages into one reply.
    const { data: pending } = await db.from("jobs").select("id").eq("lead_id", lead.id).eq("kind", "ai_reply").eq("status", "pending").limit(1);
    if (!pending?.length) await enqueue(db, lead.workspace_id, lead.id, "ai_reply", new Date(Date.now() + 8_000), { channel: m.channel === "email" || m.channel === "whatsapp" ? m.channel : "auto" });
  }
  // Re-score with the conversation (at most every 15 minutes per lead, to bound cost); escalate on a jump.
  const { data: recentRescore } = await db.from("jobs").select("id").eq("lead_id", lead.id).eq("kind", "rescore").gte("created_at", new Date(Date.now() - 15 * 60_000).toISOString()).limit(1);
  if (!recentRescore?.length) await enqueue(db, lead.workspace_id, lead.id, "rescore", new Date(Date.now() + 60_000));
  return { ok: true };
}

// ── Jobs ──────────────────────────────────────────────────────────────────
export interface Job { id: number; workspace_id: string; lead_id: string | null; kind: string; payload: Record<string, unknown>; attempts: number; created_at: string }

export async function processJob(db: DB, job: Job) {
  const lead = job.lead_id ? await loadLead(db, job.lead_id) : null;
  if (job.lead_id && !lead) return "lead gone";
  const settings = await loadSettings(db, job.workspace_id);
  const ctx = (channel: ToolCtx["channel"]): ToolCtx => ({ db, settings, lead: lead!, channel, actions: [] });
  const company = await companyName(db, job.workspace_id);

  switch (job.kind) {
    case "first_contact": {
      if (!lead || lead.opted_out || !settings.ai_enabled || lead.ai_mode === "paused") return "skipped";
      const { count } = await db.from("messages").select("id", { count: "exact", head: true }).eq("lead_id", lead.id).eq("direction", "out");
      if (count) return "already contacted";
      const channels = reachable(lead);
      const lang = lead.language && FIRST_CONTACT[lead.language] ? lead.language : "en";
      const params = [firstName(lead.name), settings.assistant_name, company];
      const sent: string[] = [];
      if (channels.includes("whatsapp")) {
        // Business-initiated: an approved template unless the lead messaged us on WhatsApp first.
        const { data: inWa } = await db.from("messages").select("id").eq("lead_id", lead.id).eq("channel", "whatsapp").eq("direction", "in").limit(1);
        if (inWa?.length) {
          const t = await runTurn({ ctx: ctx("whatsapp"), company, agentName: await agentName(db, lead.assigned_to), inbound: await lastInbound(db, lead.id), firstContact: true });
          await deliver(db, settings, lead, { channel: "whatsapp", author: "ai", body: t.text });
        } else {
          await deliver(db, settings, lead, { channel: "whatsapp", author: "ai", body: render(FIRST_CONTACT[lang], params), template: { name: TEMPLATE_NAMES.first, params } });
        }
        sent.push("whatsapp");
      }
      if (channels.includes("email")) {
        const t = await runTurn({ ctx: ctx("email"), company, agentName: await agentName(db, lead.assigned_to), inbound: await lastInbound(db, lead.id), firstContact: true });
        await deliver(db, settings, lead, { channel: "email", author: "ai", body: t.text, subject: subjectFor(lang, company) });
        sent.push("email");
      }
      await scheduleFollowups(db, settings, lead);
      return `first contact via ${sent.join(" + ") || "nothing"}`;
    }

    case "ai_reply": {
      if (!lead || !aiShouldReply(settings, lead, new Date(), await lastAgentAt(db, lead.id))) return "skipped";
      const choice = replyChannel(lead, (job.payload.channel as string) ?? "auto");
      if (!choice) return "no channel to reply on";
      if (choice === "whatsapp-template") {
        // A web or phone enquiry from someone whose WhatsApp window is closed: re-open it with the template.
        const lang = lead.language && FIRST_CONTACT[lead.language] ? lead.language : "en";
        const params = [firstName(lead.name), settings.assistant_name, company];
        await deliver(db, settings, lead, { channel: "whatsapp", author: "ai", body: render(FIRST_CONTACT[lang], params), template: { name: TEMPLATE_NAMES.first, params } });
        return "re-opened WhatsApp with the template";
      }
      const channel: OutChannel = choice;
      const t = await runTurn({ ctx: ctx(channel), company, agentName: await agentName(db, lead.assigned_to), inbound: await lastInbound(db, lead.id), firstContact: false });
      const fresh = (await loadLead(db, lead.id))!;
      if (fresh.opted_out && !t.actions.includes("opted out")) return "opted out";
      await deliver(db, settings, fresh, { channel, author: "ai", body: t.text, subject: channel === "email" ? `Re: ${subjectFor(fresh.language ?? "en", company)}` : undefined });
      // If the conversation goes quiet again, follow up gently (capped per lead).
      if (!fresh.opted_out && fresh.ai_mode === "ai") await rearmFollowups(db, settings, fresh);
      return `replied (${t.by}; ${t.actions.join(", ") || "no tools"})`;
    }

    case "followup": {
      if (!lead || lead.opted_out || lead.ai_mode !== "ai" || !settings.ai_enabled || ["won", "lost"].includes(lead.stage)) return "skipped";
      if (lead.last_inbound_at && lead.last_inbound_at > job.created_at) return "lead replied";
      const tz = lead.timezone ?? settings.timezone;
      if (isQuietTime(new Date(), tz, settings.quiet_start, settings.quiet_end)) {
        await enqueue(db, job.workspace_id, lead.id, "followup", nextSendTime(new Date(), tz, settings.quiet_start, settings.quiet_end), job.payload);
        return "moved out of quiet hours";
      }
      const n = Number(job.payload.n ?? 1), lang = lead.language && FOLLOWUP[lead.language] ? lead.language : "en";
      const params = [firstName(lead.name), settings.assistant_name, company];
      const channels = reachable(lead);
      const instruction = `This is gentle follow-up ${n} of ${settings.followup_days.length}. The lead hasn't replied. Write one short, warm, useful message (a relevant option, a market note, or an easy question). Never pressure. ${n === settings.followup_days.length ? "This is the last automatic follow-up: let them know you're here whenever they're ready." : ""}`;
      if (channels.includes("whatsapp")) {
        const { data: inWa } = await db.from("messages").select("created_at").eq("lead_id", lead.id).eq("channel", "whatsapp").eq("direction", "in").order("created_at", { ascending: false }).limit(1);
        const open = inWa?.[0] && Date.now() - Date.parse(inWa[0].created_at as string) < 24 * 3600_000;
        if (open) {
          const t = await runTurn({ ctx: ctx("whatsapp"), company, agentName: null, inbound: null, firstContact: false, instruction });
          await deliver(db, settings, lead, { channel: "whatsapp", author: "ai", body: t.text });
        } else {
          await deliver(db, settings, lead, { channel: "whatsapp", author: "ai", body: render(FOLLOWUP[lang], params), template: { name: TEMPLATE_NAMES.followup, params } });
        }
      } else if (channels.includes("email")) {
        const t = await runTurn({ ctx: ctx("email"), company, agentName: null, inbound: null, firstContact: false, instruction });
        await deliver(db, settings, lead, { channel: "email", author: "ai", body: t.text, subject: `Re: ${subjectFor(lang, company)}` });
      }
      return `follow-up ${n}`;
    }

    case "rescore": {
      if (!lead) return "no lead";
      if ((lead as LeadRecord & { score_locked?: boolean }).score_locked) return "score set by hand";
      const { data: msgs } = await db.from("messages").select("author, body").eq("lead_id", lead.id).order("created_at").limit(30);
      const transcript = (msgs ?? []).map((m) => `${m.author}: ${String(m.body).slice(0, 400)}`).join("\n");
      const a = await assessLead({ name: lead.name, message: "", source: lead.source, area: lead.area, transcript });
      await db.from("leads").update({ score: a.score, temp: a.temp, score_reason: a.reason.slice(0, 600), language: lead.language ?? a.language }).eq("id", lead.id);
      if (a.score >= settings.escalate_score && lead.score < settings.escalate_score) {
        const office = isOfficeOpen(new Date(), settings.timezone, settings.office_hours as WeekHours, settings.holidays);
        if (office && lead.ai_mode === "ai") await handover({ db, lead, settings, actions: [] }, "hot", a.reason);
        else for (const user_id of lead.assigned_to ? [lead.assigned_to] : await managers(db, lead.workspace_id))
          await notify(db, { workspace_id: lead.workspace_id, user_id, lead_id: lead.id, kind: "hot_lead", urgent: true, body: `${lead.name} is now hot (${a.score}). ${a.reason}` }, settings);
      }
      return `rescored ${lead.score} → ${a.score}`;
    }

    case "alert": {
      if (job.payload.action === "call" && lead) return startCall(db, settings, lead);
      return "noop";
    }
  }
  return `unknown job ${job.kind}`;
}

const MAX_FOLLOWUPS = 6;
async function rearmFollowups(db: DB, s: Settings, lead: LeadRecord) {
  await db.from("jobs").update({ status: "cancelled" }).eq("lead_id", lead.id).eq("kind", "followup").eq("status", "pending");
  const { count } = await db.from("jobs").select("id", { count: "exact", head: true }).eq("lead_id", lead.id).eq("kind", "followup").eq("status", "done");
  const left = MAX_FOLLOWUPS - (count ?? 0);
  if (left > 0) await scheduleFollowups(db, s, lead, left);
}

async function lastAgentAt(db: DB, leadId: string) {
  const { data } = await db.from("messages").select("created_at").eq("lead_id", leadId).eq("author", "agent").order("created_at", { ascending: false }).limit(1);
  return (data?.[0]?.created_at as string) ?? null;
}

async function lastInbound(db: DB, leadId: string) {
  const { data } = await db.from("messages").select("body").eq("lead_id", leadId).eq("direction", "in").order("created_at", { ascending: false }).limit(1);
  return (data?.[0]?.body as string) ?? null;
}

async function scheduleFollowups(db: DB, s: Settings, lead: LeadRecord, max = 99) {
  const tz = lead.timezone ?? s.timezone;
  for (const [i, d] of s.followup_days.slice(0, max).entries()) {
    const at = nextSendTime(new Date(Date.now() + d * 86_400_000), tz, s.quiet_start, s.quiet_end);
    await enqueue(db, lead.workspace_id, lead.id, "followup", at, { n: i + 1 });
  }
}

const SUBJECT: Record<string, string> = {
  en: "Your property enquiry with {co}", ar: "استفسارك العقاري لدى {co}", hi: "{co} के साथ आपकी प्रॉपर्टी पूछताछ", ur: "{co} کے ساتھ آپ کی پراپرٹی انکوائری",
  es: "Su consulta inmobiliaria con {co}", pt: "Sua consulta de imóveis com a {co}", ru: "Ваш запрос о недвижимости в {co}", fr: "Votre demande immobilière auprès de {co}",
  zh: "您在{co}的房产咨询", fa: "درخواست ملک شما در {co}",
};
const subjectFor = (lang: string, co: string) => (SUBJECT[lang] ?? SUBJECT.en).replace("{co}", co);

// ── Voice ─────────────────────────────────────────────────────────────────
export async function startCall(db: DB, s: Settings, lead: LeadRecord) {
  if (!lead.phone || lead.opted_out) return "no phone";
  const tz = lead.timezone ?? s.timezone;
  if (isQuietTime(new Date(), tz, s.quiet_start, s.quiet_end)) {
    await enqueue(db, lead.workspace_id, lead.id, "alert", nextSendTime(new Date(), tz, s.quiet_start, s.quiet_end), { action: "call" });
    return "call moved out of quiet hours";
  }
  if (s.sandbox_mode || !providers.voice() || !s.voice_from) {
    await db.from("messages").insert({ workspace_id: lead.workspace_id, lead_id: lead.id, channel: "voice", direction: "out", author: "system", body: "AI call requested (sandbox: not dialled).", status: "sandbox" });
    return "sandbox call";
  }
  const secret = linkSecret();
  if (!secret) return "voice needs WORKER_SECRET";
  const tok = signToken(lead.id, secret, 3600);
  const base = `${APP_URL()}/api/webhooks/twilio/voice`;
  const r = await placeCall({ to: `+${lead.phone}`, from: s.voice_from, twimlUrl: `${base}?lead=${lead.id}&t=${tok}`, statusUrl: `${base}/status?lead=${lead.id}&t=${tok}` });
  await db.from("messages").insert({ workspace_id: lead.workspace_id, lead_id: lead.id, channel: "voice", direction: "out", author: "system", body: "AI call started.", status: "sent", provider_id: r.sid });
  return "calling";
}
