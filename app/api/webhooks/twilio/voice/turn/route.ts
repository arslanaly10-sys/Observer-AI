import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { checkToken } from "@/lib/growth/verify";
import { linkSecret } from "@/lib/growth/guard";
import { loadLead } from "@/lib/growth/pipeline";
import { twilioParams, heard, waitForReply } from "@/lib/growth/voice-turn";

/** The caller finished speaking. Claude answers in the background; Twilio is sent to /turn/wait. */
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  const secret = linkSecret();
  const { params, valid } = await twilioParams(req);
  const leadId = req.nextUrl.searchParams.get("lead") ?? "";
  if (!secret || !valid || !checkToken(leadId, req.nextUrl.searchParams.get("t"), secret)) return new NextResponse("forbidden", { status: 401 });
  const db = adminClient();
  const lead = await loadLead(db, leadId);
  if (!lead) return new NextResponse("gone", { status: 404 });
  const text = (params.SpeechResult ?? "").trim();
  if (!text) {
    // Silence: ask again by replaying the latest AI line.
    const { data } = await db.from("messages").select("id").eq("lead_id", leadId).eq("channel", "voice").eq("author", "ai").order("id", { ascending: false }).limit(1);
    return waitForReply(db, leadId, ((data?.[0]?.id as number) ?? 1) - 1, 0);
  }
  return heard(db, lead, text);
}
