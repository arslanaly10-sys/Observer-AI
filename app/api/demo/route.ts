import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Demo requests. Every request must reach a person: it is saved to Supabase `demo_requests` when connected,
 * POSTed to DEMO_WEBHOOK_URL if set, and emailed to DEMO_NOTIFY_EMAIL through Resend if both are set.
 * With none of these, the form answers 503 so the visitor is told, instead of a "thank you" for a request
 * nobody will see.
 */
const resendReady = () => Boolean(process.env.RESEND_API_KEY && process.env.DEMO_NOTIFY_EMAIL && process.env.DEMO_FROM_EMAIL);
const demoDeliveryConfigured = () => isSupabaseConfigured || Boolean(process.env.DEMO_WEBHOOK_URL) || resendReady();
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  // Honeypot filled: answer as if accepted, record nothing.
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });
  if (JSON.stringify(body).length > 5000) return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, 500) : "");
  const lead = { name: str("name"), company: str("company"), role: str("role"), phone: str("phone"), email: str("email"), size: str("size"), message: str("message"), locale: str("locale"), at: new Date().toISOString() };
  if (!lead.name || !lead.company || !lead.phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || body.consent !== "yes")
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 422 });

  if (!demoDeliveryConfigured()) {
    console.error("[demo-request] no delivery configured; set DEMO_WEBHOOK_URL, DEMO_NOTIFY_EMAIL or Supabase");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // 1) Save it in Supabase (insert-only for the website; nobody can read it back through the public key).
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { error } = await supabase.from("demo_requests").insert({
      name: lead.name, company: lead.company, role: lead.role || null, phone: lead.phone, email: lead.email,
      team_size: lead.size || null, message: lead.message || null, locale: lead.locale === "ar" ? "ar" : "en",
    });
    if (error) return NextResponse.json({ ok: false, error: "save_failed" }, { status: 502 });
  }
  // 2) Optionally forward to a sales inbox or CRM.
  const hook = process.env.DEMO_WEBHOOK_URL;
  if (hook) {
    const r = await fetch(hook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(lead) }).catch(() => null);
    if (!r?.ok) return NextResponse.json({ ok: false, error: "forward_failed" }, { status: 502 });
  }
  // 3) Email the sales inbox.
  if (resendReady()) {
    const text = [`New demo request`, ``, `Name: ${lead.name}`, `Company: ${lead.company}`, `Role: ${lead.role || "-"}`, `WhatsApp: ${lead.phone}`, `Email: ${lead.email}`, `Team size: ${lead.size || "-"}`, `Language: ${lead.locale || "en"}`, ``, lead.message || "(no message)"].join("\n");
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.DEMO_FROM_EMAIL, to: [process.env.DEMO_NOTIFY_EMAIL], reply_to: lead.email, subject: `Demo request: ${lead.company} (${lead.name})`, text }),
    }).catch(() => null);
    // If Supabase or the webhook already has it, a failed email isn't fatal; otherwise it is.
    if (!r?.ok && !isSupabaseConfigured && !process.env.DEMO_WEBHOOK_URL) return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
