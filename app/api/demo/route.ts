import { NextResponse } from "next/server";

/**
 * Demo requests. Validates and records the request.
 * TODO (CONTENT-TODO.md): forward to the sales inbox / CRM. Set DEMO_WEBHOOK_URL to POST each request onward.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, 500) : "");
  const lead = { name: str("name"), company: str("company"), role: str("role"), phone: str("phone"), email: str("email"), size: str("size"), message: str("message"), locale: str("locale"), at: new Date().toISOString() };
  if (!lead.name || !lead.company || !lead.phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || body.consent !== "yes")
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 422 });

  const hook = process.env.DEMO_WEBHOOK_URL;
  if (hook) {
    const r = await fetch(hook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(lead) }).catch(() => null);
    if (!r?.ok) return NextResponse.json({ ok: false, error: "forward_failed" }, { status: 502 });
  } else {
    console.log("[demo-request]", JSON.stringify(lead));
  }
  return NextResponse.json({ ok: true });
}
