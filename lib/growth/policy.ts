/** Pure decisions about when the AI may speak. Kept free of I/O so they are unit-tested. */
import { isOfficeOpen, type WeekHours } from "./hours";

export interface PolicySettings { ai_enabled: boolean; timezone: string; office_hours: WeekHours | Record<string, [string, string][]>; holidays: string[] }
export interface PolicyLead { opted_out: boolean; ai_mode: "ai" | "human" | "paused" }

/** In office hours a handed-over lead belongs to the agent; after hours the AI keeps the conversation going. */
export function aiShouldReply(s: PolicySettings, lead: PolicyLead, at = new Date()) {
  if (!s.ai_enabled || lead.opted_out || lead.ai_mode === "paused") return false;
  if (lead.ai_mode === "ai") return true;
  return !isOfficeOpen(at, s.timezone, s.office_hours as WeekHours, s.holidays);
}

/** "STOP" in the languages Observer speaks. */
export const STOP = /^\s*(stop|unsubscribe|opt ?out|إلغاء|ايقاف|إيقاف|توقف|cancelar|parar|стоп|arrêt|退订|لغو|बंद करें|بند کریں)\s*[.!]?\s*$/i;
