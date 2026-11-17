import { NextResponse, after, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { verifySvix } from "@/lib/growth/verify";
import { leadIdFromAddress } from "@/lib/growth/channels/email";
import { handleInbound, loadLead } from "@/lib/growth/pipeline";
import { runDue } from "@/lib/growth/worker";

/** Resend: delivery events for our sends, and inbound replies to reply+<leadId>@<inbound domain>. */
export const maxDuration = 60;
const STATUS: Record<string, string> = { "email.sent": "sent", "email.delivered": "delivered", "email.opened": "read", "email.bounced": "failed", "email.complained": "failed" };

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const ok = verifySvix(raw, { id: req.headers.get("svix-id"), timestamp: req.headers.get("svix-timestamp"), signature: req.headers.get("svix-signature") }, process.env.RESEND_WEBHOOK_SECRET);
  if (!ok) return new NextResponse("bad signature", { status: 401 });
  const ev = JSON.parse(raw) as { type: string; data: Record<string, any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const db = adminClient();

  if (STATUS[ev.type] && ev.data.email_id) {
    await db.from("messages").update({ status: STATUS[ev.type] }).eq("provider_id", String(ev.data.email_id));
  }
  if (ev.type === "email.received") {
    const to: string[] = [].concat(ev.data.to ?? []);
    const leadId = to.map(leadIdFromAddress).find(Boolean);
    const lead = leadId ? await loadLead(db, leadId) : null;
    if (lead) {
      let text: string = ev.data.text ?? "";
      if (!text && ev.data.email_id && process.env.RESEND_API_KEY) {
        const r = await fetch(`https://api.resend.com/emails/receiving/${ev.data.email_id}`, { headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` } });
        const j = await r.json().catch(() => ({}));
        text = j.text ?? String(j.html ?? "").replace(/<[^>]+>/g, " ");
      }
      // Keep only the new part of the reply, not the quoted thread.
      text = text.split(/\n(?:On .+wrote:|-{2,} ?Original Message|>.*\n>)/)[0].trim();
      if (text) await handleInbound(db, lead, { channel: "email", text, subject: ev.data.subject, providerId: `in:${ev.data.email_id ?? ev.data.message_id ?? Date.now()}` });
    }
  }
  after(() => runDue(db, { max: 5 }).catch(() => {}));
  return NextResponse.json({ ok: true });
}
