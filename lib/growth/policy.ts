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
