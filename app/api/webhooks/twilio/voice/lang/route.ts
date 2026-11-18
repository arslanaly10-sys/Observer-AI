import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { checkToken } from "@/lib/growth/verify";
import { linkSecret } from "@/lib/growth/guard";
import { loadLead } from "@/lib/growth/pipeline";
import { twilioParams, greeting } from "@/lib/growth/voice-turn";

/** The caller pressed 1 (English) or 2 (Arabic) — or nothing, which means English. */
export async function POST(req: NextRequest) {
  const secret = linkSecret();
  if (!secret) return new NextResponse("voice is not configured: set WORKER_SECRET (24+ characters)", { status: 503 });
  const { params, valid } = await twilioParams(req);
  const leadId = req.nextUrl.searchParams.get("lead") ?? "";
  if (!valid || !checkToken(leadId, req.nextUrl.searchParams.get("t"), secret)) return new NextResponse("forbidden", { status: 401 });
  const db = adminClient();
  const language = params.Digits === "2" ? "ar" : "en";
  await db.from("leads").update({ language }).eq("id", leadId);
  const lead = await loadLead(db, leadId);
  if (!lead) return new NextResponse("gone", { status: 404 });
  return greeting(db, lead);
}
