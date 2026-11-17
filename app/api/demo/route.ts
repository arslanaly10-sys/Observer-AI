import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Demo requests. Validates and records the request.
 * Saved to Supabase `demo_requests` when connected; also POSTed to DEMO_WEBHOOK_URL if set.
 */
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
  } else if (!isSupabaseConfigured) {
    console.log("[demo-request]", JSON.stringify(lead));
  }
  return NextResponse.json({ ok: true });
}
