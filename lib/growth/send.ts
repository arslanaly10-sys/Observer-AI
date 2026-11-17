import "server-only";
/**
 * One place every outgoing message goes through. It decides sandbox vs live, picks a WhatsApp template when
 * the 24-hour service window is closed, records the message, and stamps the lead. Nothing else calls a
 * provider directly, so sandbox mode can never leak a real send.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { providers, APP_URL } from "./config";
import { signToken } from "./verify";
import { linkSecret } from "./guard";
import { sendWhatsApp, inServiceWindow } from "./channels/whatsapp";
import { sendEmail, replyAddress } from "./channels/email";

export interface Settings {
  workspace_id: string; assistant_name: string; timezone: string; office_hours: Record<string, [string, string][]>; holidays: string[];
  ai_enabled: boolean; sandbox_mode: boolean; quiet_start: string; quiet_end: string; followup_days: number[]; escalate_score: number;
  first_contact_delay_s: number; whatsapp_phone_number_id: string | null; whatsapp_template: string; email_from: string | null;
  voice_from: string | null; meta_page_id: string | null;
}
export interface LeadRecord {
  id: string; workspace_id: string; assigned_to: string | null; name: string; phone: string | null; email: string | null; source: string;
  budget_aed: number | null; area: string | null; timeframe: string | null; financing: string | null; stage: string; score: number; temp: "hot" | "warm" | "cold";
  notes: string | null; language: string | null; intent: string | null; score_reason: string | null; channel: string; consent_whatsapp: boolean;
  consent_email: boolean; opted_out: boolean; ai_mode: "ai" | "human" | "paused"; handover_reason: string | null; timezone: string | null;
  last_inbound_at: string | null; last_whatsapp_in_at: string | null; last_outbound_at: string | null; agent_session_id: string | null; created_at: string;
}
export type OutChannel = "whatsapp" | "email";

export interface Outgoing {
  channel: OutChannel; body: string; subject?: string; author: "ai" | "agent" | "system"; authorId?: string | null;
  /** WhatsApp only: a business-initiated template, used for first contact and when the 24h window is closed. */
  template?: { name: string; params: string[] };
  document?: { link: string; filename: string };
}

/** Which channels may we use for this lead right now? */
export function reachable(lead: LeadRecord): OutChannel[] {
  if (lead.opted_out) return [];
  const out: OutChannel[] = [];
  if (lead.phone && lead.consent_whatsapp) out.push("whatsapp");
  if (lead.email && lead.consent_email) out.push("email");
  return out;
}

export function isSandbox(s: Settings, channel: OutChannel) {
  if (s.sandbox_mode) return true;
  if (channel === "whatsapp") return !providers.whatsapp() || !s.whatsapp_phone_number_id;
  return !providers.email() || !s.email_from;
}

export async function deliver(db: SupabaseClient, s: Settings, lead: LeadRecord, m: Outgoing) {
  const sandbox = isSandbox(s, m.channel);
  let status: "sent" | "sandbox" | "failed" = sandbox ? "sandbox" : "sent";
  let provider_id: string | null = null, error: string | null = null;
  // Outside the 24h window WhatsApp only accepts approved templates.
  const needTemplate = m.channel === "whatsapp" && !inServiceWindow(lead.last_whatsapp_in_at);
  const template = needTemplate ? m.template : undefined;
  if (needTemplate && !template) {
    // Free text outside the 24-hour window is rejected by WhatsApp. Say so instead of trying.
    const error = "WhatsApp only allows free text within 24 hours of the lead's last WhatsApp message. Use email, or wait for them to reply.";
    await db.from("messages").insert({ workspace_id: lead.workspace_id, lead_id: lead.id, channel: "whatsapp", direction: "out", author: m.author, author_id: m.authorId ?? null, body: m.body.slice(0, 8000), status: "failed", error });
    return { id: undefined, status: "failed" as const, error };
  }

  if (!sandbox) {
    try {
      if (m.channel === "whatsapp") {
        const r = m.document
          ? await sendWhatsApp(s.whatsapp_phone_number_id!, lead.phone!, { kind: "document", link: m.document.link, filename: m.document.filename, caption: m.body })
          : template
            ? await sendWhatsApp(s.whatsapp_phone_number_id!, lead.phone!, { kind: "template", name: template.name, language: lead.language ?? "en", params: template.params })
            : await sendWhatsApp(s.whatsapp_phone_number_id!, lead.phone!, { kind: "text", body: m.body });
        provider_id = r.id || null;
      } else {
        const unsub = unsubscribeUrl(lead.id);
        const text = unsub ? `${m.body}\n\n--\n${UNSUB_LINE[lead.language ?? "en"] ?? UNSUB_LINE.en} ${unsub}` : m.body;
        const r = await sendEmail({
          from: s.email_from!, to: lead.email!, subject: m.subject ?? "Your property enquiry", text,
          replyTo: replyAddress(lead.id), tags: { lead: lead.id.replace(/-/g, "_") },
          // RFC 8058 one-click unsubscribe, required by Gmail and Yahoo for bulk senders.
          headers: unsub ? { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined,
        });
        provider_id = r.id || null;
      }
    } catch (e) {
      status = "failed";
      error = (e as Error).message.slice(0, 1000);
    }
  }

  const { data } = await db.from("messages").insert({
    workspace_id: lead.workspace_id, lead_id: lead.id, channel: m.channel, direction: "out", author: m.author,
    author_id: m.authorId ?? null, subject: m.subject ?? null, body: m.body.slice(0, 8000),
    media: m.document ? { document: m.document } : template ? { template } : null,
    status, provider_id, error,
  }).select("id").single();
  if (status !== "failed") await db.from("leads").update({ last_outbound_at: new Date().toISOString() }).eq("id", lead.id);
  return { id: data?.id as number | undefined, status, error };
}

const UNSUB_LINE: Record<string, string> = {
  en: "Don't want these emails? Unsubscribe:", ar: "لا ترغب في هذه الرسائل؟ إلغاء الاشتراك:", hi: "ये ईमेल नहीं चाहिए? सदस्यता छोड़ें:", ur: "یہ ای میلز نہیں چاہییں؟ ان سبسکرائب کریں:",
  es: "¿No quiere estos correos? Darse de baja:", pt: "Não quer estes e-mails? Cancelar inscrição:", ru: "Не хотите получать эти письма? Отписаться:",
  fr: "Vous ne souhaitez plus ces e-mails ? Se désabonner :", zh: "不想再收到这些邮件？退订：", fa: "این ایمیل‌ها را نمی‌خواهید؟ لغو اشتراک:",
};
/** A signed link that opts the lead out (valid 180 days). */
export function unsubscribeUrl(leadId: string) {
  const secret = linkSecret();
  return secret ? `${APP_URL()}/api/unsubscribe?l=${leadId}&t=${signToken(`unsub:${leadId}`, secret, 180 * 86400)}` : null;
}

export const firstName = (n: string) => n.trim().split(/\s+/)[0] || n;
