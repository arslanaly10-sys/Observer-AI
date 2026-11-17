import { NextResponse, after, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { verifyMeta } from "@/lib/growth/verify";
import { fromMetaLead } from "@/lib/growth/normalize";
import { fetchMetaLead } from "@/lib/growth/channels/whatsapp";
import { ingestLead, handleInbound, loadSettings } from "@/lib/growth/pipeline";
import { runDue } from "@/lib/growth/worker";
import { normalizePhone, timezoneFromPhone } from "@/lib/growth/phone";
import { detectLanguage } from "@/lib/growth/language";
import { assessLead } from "@/lib/ai/score";
import type { LeadRecord } from "@/lib/growth/send";

/** One endpoint for Meta: Lead Ads (Facebook + Instagram) and the WhatsApp Cloud API. */
export const maxDuration = 60;

export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get("hub.mode") === "subscribe" && process.env.META_VERIFY_TOKEN && p.get("hub.verify_token") === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(p.get("hub.challenge"), { status: 200 });
  }
  return new NextResponse("forbidden", { status: 403 });
}

type Change = { field: string; value: Record<string, any> }; // eslint-disable-line @typescript-eslint/no-explicit-any

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyMeta(raw, req.headers.get("x-hub-signature-256"), process.env.META_APP_SECRET)) return new NextResponse("bad signature", { status: 401 });
  const body = JSON.parse(raw) as { object: string; entry: { id: string; changes?: Change[] }[] };
  const db = adminClient();

  for (const entry of body.entry ?? []) {
    for (const ch of entry.changes ?? []) {
      try {
        if (body.object === "page" && ch.field === "leadgen") await onLeadgen(db, ch.value);
        if (body.object === "whatsapp_business_account" && ch.field === "messages") await onWhatsApp(db, ch.value);
      } catch (e) {
        console.error("meta webhook change failed", (e as Error).message);
      }
    }
  }
  after(() => runDue(db, { max: 5 }).catch(() => {}));
  return NextResponse.json({ ok: true }); // always 200 quickly, or Meta retries and eventually disables the hook
}

async function onLeadgen(db: ReturnType<typeof adminClient>, v: Record<string, any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: ws } = await db.from("workspace_settings").select("workspace_id").eq("meta_page_id", String(v.page_id)).maybeSingle();
  if (!ws) return;
  const lead = fromMetaLead(await fetchMetaLead(String(v.leadgen_id)));
  if (lead) await ingestLead(db, ws.workspace_id as string, lead);
}

async function onWhatsApp(db: ReturnType<typeof adminClient>, v: Record<string, any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const phoneId = String(v.metadata?.phone_number_id ?? "");
  const { data: ws } = await db.from("workspace_settings").select("workspace_id").eq("whatsapp_phone_number_id", phoneId).maybeSingle();
  if (!ws) return;
  const workspaceId = ws.workspace_id as string;

  // Delivery receipts
  for (const s of v.statuses ?? []) {
    const status = ["sent", "delivered", "read", "failed"].includes(s.status) ? s.status : null;
    if (status) await db.from("messages").update({ status, error: s.errors?.[0]?.title ?? null }).eq("provider_id", String(s.id));
  }

  // Incoming messages
  for (const m of v.messages ?? []) {
    const phone = normalizePhone(String(m.from));
    if (!phone) continue;
    const text = m.type === "text" ? m.text?.body
      : m.type === "button" ? m.button?.text
      : m.type === "interactive" ? (m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title)
      : m.type === "audio" ? "[Voice note received. Ask them to type, or offer a call.]"
      : `[${m.type} received]`;
    if (!text) continue;
    const profileName = v.contacts?.find((c: { wa_id: string }) => c.wa_id === m.from)?.profile?.name;

    const { data: existing } = await db.from("leads").select("*").eq("workspace_id", workspaceId).eq("phone", phone).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (existing) {
      await handleInbound(db, existing as LeadRecord, { channel: "whatsapp", text: String(text), providerId: String(m.id) });
      continue;
    }
    // Someone messaged the business number directly (click-to-WhatsApp ads, QR codes, the website button).
    const settings = await loadSettings(db, workspaceId);
    const a = await assessLead({ name: profileName ?? phone, message: String(text), source: "WhatsApp" });
    const { data: owner } = await db.from("workspaces").select("created_by").eq("id", workspaceId).single();
    const { data: lead } = await db.from("leads").insert({
      workspace_id: workspaceId, created_by: owner!.created_by, name: (profileName ?? `+${phone}`).slice(0, 120), phone, source: m.referral ? "Click-to-WhatsApp ad" : "WhatsApp",
      channel: "whatsapp", campaign: m.referral?.headline ?? null, consent_whatsapp: true, language: detectLanguage(String(text)), intent: a.intent,
      score: a.score, temp: a.temp, score_reason: a.reason.slice(0, 600), area: a.area, budget_aed: a.budget_aed, timeframe: a.timeframe, financing: a.financing,
      timezone: timezoneFromPhone(phone, settings.timezone),
    }).select("*").single();
    if (lead) {
      await handleInbound(db, lead as LeadRecord, { channel: "whatsapp", text: String(text), providerId: String(m.id) });
    }
  }
}
