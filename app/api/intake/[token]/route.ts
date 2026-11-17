import { NextResponse, after, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { fromGeneric, CHANNEL_SOURCE } from "@/lib/growth/normalize";
import { ingestLead } from "@/lib/growth/pipeline";
import { runDue } from "@/lib/growth/worker";

/**
 * Universal lead intake: website and landing-page forms, TikTok and Snapchat lead webhooks, portal
 * email-to-webhook services and Zapier/Make. POST JSON or form data to
 *   /api/intake/<workspace ingest token>?source=website|tiktok|snapchat|bayut|propertyfinder|dubizzle|portal|zapier
 */
export const maxDuration = 60;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!UUID.test(token)) return NextResponse.json({ error: "not found" }, { status: 404, headers: cors });
  const db = adminClient();
  const { data: ws } = await db.from("workspace_settings").select("workspace_id").eq("ingest_token", token).maybeSingle();
  if (!ws) return NextResponse.json({ error: "not found" }, { status: 404, headers: cors });

  let body: Record<string, unknown> = {};
  const type = req.headers.get("content-type") ?? "";
  try {
    if (type.includes("application/json")) body = await req.json();
    else body = Object.fromEntries((await req.formData()).entries()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "unreadable body" }, { status: 400, headers: cors });
  }
  if (body._hp || body.website_url_hp) return NextResponse.json({ ok: true }, { headers: cors }); // honeypot: pretend success

  const key = (req.nextUrl.searchParams.get("source") ?? String(body.source ?? "website")).toLowerCase().replace(/[^a-z]/g, "");
  const src = CHANNEL_SOURCE[key] ?? CHANNEL_SOURCE.website;
  const lead = fromGeneric(body, src.channel, src.source);
  if (!lead) return NextResponse.json({ error: "a phone number or email is required" }, { status: 422, headers: cors });

  const r = await ingestLead(db, ws.workspace_id as string, lead);
  after(() => runDue(db, { max: 5 }).catch(() => {})); // scores/rescore jobs that are already due
  return NextResponse.json({ ok: true, lead_id: r.id, duplicate: r.duplicate }, { headers: cors });
}
