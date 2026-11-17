import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { fromGoogleLead } from "@/lib/growth/normalize";
import { ingestLead } from "@/lib/growth/pipeline";

/** Google Ads lead form webhook. Set the URL to /api/webhooks/google/<ingest token> and the key to the same token. */
export const maxDuration = 60;
export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body || body.google_key !== token) return NextResponse.json({ error: "bad key" }, { status: 401 });
  const db = adminClient();
  const { data: ws } = await db.from("workspace_settings").select("workspace_id").eq("ingest_token", token).maybeSingle();
  if (!ws) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (body.is_test) return NextResponse.json({ ok: true, test: true });
  const lead = fromGoogleLead(body);
  if (!lead) return NextResponse.json({ error: "no contact details" }, { status: 422 });
  const r = await ingestLead(db, ws.workspace_id as string, lead);
  return NextResponse.json({ ok: true, lead_id: r.id });
}
