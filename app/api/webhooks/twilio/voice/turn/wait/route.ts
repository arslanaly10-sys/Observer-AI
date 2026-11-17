import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { checkToken } from "@/lib/growth/verify";
import { linkSecret } from "@/lib/growth/guard";
import { twilioParams, waitForReply } from "@/lib/growth/voice-turn";

/** Polled by Twilio while Claude prepares the reply. */
export async function POST(req: NextRequest) {
  const secret = linkSecret();
  const { valid } = await twilioParams(req);
  const p = req.nextUrl.searchParams;
  const leadId = p.get("lead") ?? "";
  if (!secret || !valid || !checkToken(leadId, p.get("t"), secret)) return new NextResponse("forbidden", { status: 401 });
  return waitForReply(adminClient(), leadId, Number(p.get("after") ?? 0), Number(p.get("n") ?? 0));
}
