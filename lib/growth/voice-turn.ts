import "server-only";
/** Shared logic for the Twilio voice routes: one speech turn of the AI concierge. */
import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { verifyTwilio, signToken } from "./verify";
import { APP_URL, providers } from "./config";
import { twimlTurn } from "./channels/voice";
import { runTurn } from "@/lib/ai/agent";
import { loadSettings } from "./pipeline";
import type { LeadRecord } from "./send";

export async function twilioParams(req: NextRequest) {
  const form = await req.formData();
  const params = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  // Twilio signs the public URL it called.
  const url = `${APP_URL()}${req.nextUrl.pathname}${req.nextUrl.search}`;
  const valid = verifyTwilio(url, params, req.headers.get("x-twilio-signature"), process.env.TWILIO_AUTH_TOKEN);
  return { params, valid };
}

export const xml = (body: string) => new Response(body, { headers: { "Content-Type": "text/xml; charset=utf-8" } });

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

/** Speak `text` (ElevenLabs when configured, Twilio's voice otherwise) and listen for the next utterance. */
export async function speak(db: SupabaseClient, lead: LeadRecord, text: string, opts: { hangup?: boolean } = {}) {
  const { data: msg } = await db.from("messages").insert({ workspace_id: lead.workspace_id, lead_id: lead.id, channel: "voice", direction: "out", author: "ai", body: text.slice(0, 8000), status: "sent" }).select("id").single();
  const secret = process.env.WORKER_SECRET ?? "";
  const lang = lead.language ?? "en";
  const audioUrl = providers.tts() && msg ? `${APP_URL()}/api/voice/tts?m=${msg.id}&t=${signToken(String(msg.id), secret, 600)}` : undefined;
  const actionUrl = `${APP_URL()}/api/webhooks/twilio/voice/turn?lead=${lead.id}&t=${signToken(lead.id, secret, 3600)}`;
  return xml(twimlTurn({ audioUrl, text, lang, actionUrl, hangup: opts.hangup }));
}

export async function greeting(db: SupabaseClient, lead: LeadRecord) {
  const s = await loadSettings(db, lead.workspace_id);
  const { data: ws } = await db.from("workspaces").select("name").eq("id", lead.workspace_id).single();
  const g = GREETING[lead.language ?? "en"] ?? GREETING.en;
  return speak(db, lead, g(s.assistant_name, (ws?.name as string) ?? "our team"));
}

export async function answer(db: SupabaseClient, lead: LeadRecord, heard: string) {
  const settings = await loadSettings(db, lead.workspace_id);
  const { data: ws } = await db.from("workspaces").select("name").eq("id", lead.workspace_id).single();
  await db.from("messages").insert({ workspace_id: lead.workspace_id, lead_id: lead.id, channel: "voice", direction: "in", author: "lead", body: heard.slice(0, 8000), status: "received" });
  await db.from("leads").update({ last_inbound_at: new Date().toISOString() }).eq("id", lead.id);
  const t = await runTurn({ ctx: { db, settings, lead, channel: "voice", actions: [] }, company: (ws?.name as string) ?? "our team", agentName: null, inbound: heard, firstContact: false, mode: "messages" });
  const bye = /\b(bye|goodbye|thank you, bye)\b|مع السلامة|अलविदा|خدا حافظ|adiós|tchau|до свидания|au revoir|再见/i.test(heard) || t.actions.some((a) => a.startsWith("handover"));
  return speak(db, lead, t.text, { hangup: bye });
}
