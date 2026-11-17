/** Pure decisions about when the AI may speak. Kept free of I/O so they are unit-tested. */
import { isOfficeOpen, type WeekHours } from "./hours";

export interface PolicySettings { ai_enabled: boolean; timezone: string; office_hours: WeekHours | Record<string, [string, string][]>; holidays: string[] }
export interface PolicyLead { opted_out: boolean; ai_mode: "ai" | "human" | "paused" }

/** How long an agent's last message keeps the AI quiet on a handed-over lead, even after hours. */
export const AGENT_QUIET_MS = 30 * 60_000;

/**
 * In office hours a handed-over lead belongs to the agent. After hours the AI keeps the conversation going,
 * but only if no agent has written in the last 30 minutes, so it never talks over someone mid-chat.
 */
export function aiShouldReply(s: PolicySettings, lead: PolicyLead, at = new Date(), lastAgentAt?: string | null) {
  if (!s.ai_enabled || lead.opted_out || lead.ai_mode === "paused") return false;
  if (lead.ai_mode === "ai") return true;
  if (isOfficeOpen(at, s.timezone, s.office_hours as WeekHours, s.holidays)) return false;
  return !lastAgentAt || at.getTime() - Date.parse(lastAgentAt) > AGENT_QUIET_MS;
}

/** "STOP" in the languages Observer speaks. */
export const STOP = /^\s*(stop|unsubscribe|opt ?out|إلغاء|ايقاف|إيقاف|توقف|cancelar|parar|стоп|arrêt|退订|لغو|बंद करें|بند کریں)\s*[.!]?\s*$/i;

type Reachable = { phone: string | null; email: string | null; consent_whatsapp: boolean; consent_email: boolean; opted_out: boolean; last_whatsapp_in_at: string | null };

/** Where to answer an inbound message. WhatsApp needs its 24-hour window; otherwise email; otherwise the template. */
export function replyChannel(lead: Reachable, wanted: string, now = Date.now()): "whatsapp" | "email" | "whatsapp-template" | null {
  if (lead.opted_out) return null;
  const wa = !!lead.phone && lead.consent_whatsapp, em = !!lead.email && lead.consent_email;
  const waOpen = wa && !!lead.last_whatsapp_in_at && now - Date.parse(lead.last_whatsapp_in_at) < 24 * 3600_000;
  if (wanted === "email" && em) return "email";
  if (waOpen) return "whatsapp";
  if (em) return "email";
  if (wa) return "whatsapp-template";
  return null;
}
