import { NextResponse, after, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { providers } from "@/lib/growth/config";
import { fromGeneric, CHANNEL_SOURCE } from "@/lib/growth/normalize";
import { ingestLead } from "@/lib/growth/pipeline";
import { runDue } from "@/lib/growth/worker";
import { ipHash, verifyCaptcha, intakeLimit, workspaceForKey } from "@/lib/growth/guard";

/**
 * Universal lead intake. Two kinds of key:
 *   - the workspace's form key, for website and landing-page forms in the browser: needs a Turnstile
 *     captcha (when TURNSTILE_SECRET_KEY is set) and has tight per-address limits;
 *   - the private ingest token, for server-to-server sources (Zapier, TikTok, Snapchat, portal parsers).
 * POST JSON or form data to /api/intake/<key>?source=website|tiktok|snapchat|bayut|propertyfinder|dubizzle|portal|zapier
 */
export const maxDuration = 60;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: cors });

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!UUID.test(token)) return json({ error: "not found" }, 404);
  if (!providers.supabaseAdmin()) return json({ error: "lead intake is not configured on this server" }, 503);
  const db = adminClient();
  const key = await workspaceForKey(db, token);
  if (!key) return json({ error: "not found" }, 404);

  let body: Record<string, unknown> = {};
  try {
    body = (req.headers.get("content-type") ?? "").includes("application/json") ? await req.json() : Object.fromEntries((await req.formData()).entries());
  } catch {
    return json({ error: "unreadable body" }, 400);
  }
  if (body._hp || body.website_url_hp) return json({ ok: true }); // honeypot: pretend success

  if (key.isPublic && !(await verifyCaptcha(String(body["cf-turnstile-response"] ?? "") || null, req.headers.get("x-real-ip") ?? undefined))) {
    return json({ error: "captcha failed" }, 403);
  }
  const src = CHANNEL_SOURCE[(req.nextUrl.searchParams.get("source") ?? String(body.source ?? "website")).toLowerCase().replace(/[^a-z]/g, "")] ?? CHANNEL_SOURCE.website;
  // Browser forms can only ever be "website" leads.
  const lead = fromGeneric(body, key.isPublic ? "website" : src.channel, key.isPublic ? "Website" : src.source);
  if (!lead) return json({ error: "a phone number or email is required" }, 422);

  const refused = await intakeLimit(db, key.workspaceId, ipHash(req), lead.phone, key.isPublic);
  if (refused) return json({ error: refused }, 429);

  const r = await ingestLead(db, key.workspaceId, lead);
  after(() => runDue(db, { max: 5 }).catch(() => {}));
  return json({ ok: true, lead_id: r.id, duplicate: r.duplicate });
}
