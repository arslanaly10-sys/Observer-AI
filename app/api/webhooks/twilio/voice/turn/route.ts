import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { checkToken } from "@/lib/growth/verify";
import { loadLead } from "@/lib/growth/pipeline";
import { twilioParams, answer, speak } from "@/lib/growth/voice-turn";

/** Each time the caller finishes speaking: Twilio's transcript in, Claude's spoken answer out. */
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  const { params, valid } = await twilioParams(req);
  const leadId = req.nextUrl.searchParams.get("lead") ?? "";
  if (!valid || !checkToken(leadId, req.nextUrl.searchParams.get("t"), process.env.WORKER_SECRET ?? "")) return new NextResponse("forbidden", { status: 401 });
  const db = adminClient();
  const lead = await loadLead(db, leadId);
  if (!lead) return new NextResponse("gone", { status: 404 });
  const heard = (params.SpeechResult ?? "").trim();
  if (!heard) return speak(db, lead, lead.language === "ar" ? "عذراً، لم أسمعك جيداً. هل يمكنك التكرار؟" : "Sorry, I didn't catch that. Could you say it again?");
  return answer(db, lead, heard);
}
