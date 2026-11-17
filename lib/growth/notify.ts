import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { providers, APP_URL } from "./config";
import { sendWhatsApp } from "./channels/whatsapp";
import { sendEmail } from "./channels/email";
import type { Settings } from "./send";

/**
 * In-app notification, plus (when urgent and the workspace is live) a WhatsApp alert to the agent's alert
 * phone or an email. Alerts use the approved `observer_agent_alert` utility template: agents rarely have an
 * open 24h window with the business number.
 */
export async function notify(
  db: SupabaseClient,
  n: { workspace_id: string; user_id: string; lead_id?: string; kind: "new_lead" | "hot_lead" | "handover" | "booking" | "reply" | "system"; body: string; urgent?: boolean },
  settings?: Settings,
) {
  await db.from("notifications").insert({ workspace_id: n.workspace_id, user_id: n.user_id, lead_id: n.lead_id ?? null, kind: n.kind, body: n.body.slice(0, 1000) });
  if (!n.urgent || !settings || settings.sandbox_mode) return;
  const link = n.lead_id ? `${APP_URL()}/en/workspace/leads/${n.lead_id}` : `${APP_URL()}/en/workspace`;
  try {
    const { data: prof } = await db.from("member_profiles").select("alert_phone").eq("workspace_id", n.workspace_id).eq("user_id", n.user_id).maybeSingle();
    if (prof?.alert_phone && settings.whatsapp_phone_number_id && providers.whatsapp()) {
      await sendWhatsApp(settings.whatsapp_phone_number_id, prof.alert_phone as string, { kind: "template", name: "observer_agent_alert", language: "en", params: [n.body.slice(0, 900), link] });
      return;
    }
    if (settings.email_from && providers.email()) {
      const { data } = await db.auth.admin.getUserById(n.user_id);
      if (data?.user?.email) await sendEmail({ from: settings.email_from, to: data.user.email, subject: n.body.slice(0, 120), text: `${n.body}\n\nOpen the lead: ${link}` });
    }
  } catch (e) {
    console.error("notify: alert failed", (e as Error).message);
  }
}
