import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { checkToken } from "@/lib/growth/verify";
import { linkSecret } from "@/lib/growth/guard";
import { twilioParams } from "@/lib/growth/voice-turn";

/** Call ended: log the outcome on the lead's timeline. */
export async function POST(req: NextRequest) {
  const secret = linkSecret();
  if (!secret) return new NextResponse("voice is not configured: set WORKER_SECRET (24+ characters)", { status: 503 });
  const { params, valid } = await twilioParams(req);
  const leadId = req.nextUrl.searchParams.get("lead") ?? "";
  if (!valid || !checkToken(leadId, req.nextUrl.searchParams.get("t"), secret)) return new NextResponse("forbidden", { status: 401 });
  const db = adminClient();
  const { data: lead } = await db.from("leads").select("workspace_id").eq("id", leadId).maybeSingle();
  if (lead && params.CallStatus) {
    const mins = Math.round(Number(params.CallDuration ?? 0) / 60);
    await db.from("activities").insert({ workspace_id: lead.workspace_id, lead_id: leadId, kind: "call", body: `AI call ${params.CallStatus}${mins ? `, ${mins} min` : ""}.` });
  }
  return NextResponse.json({ ok: true });
}
