import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { checkToken } from "@/lib/growth/verify";
import { linkSecret } from "@/lib/growth/guard";
import { synthesize } from "@/lib/growth/channels/voice";

/** Streams ElevenLabs audio for one AI voice message. Links are signed and expire after 10 minutes. */
export async function GET(req: NextRequest) {
  const secret = linkSecret();
  if (!secret) return new NextResponse("voice is not configured: set WORKER_SECRET (24+ characters)", { status: 503 });
  const m = req.nextUrl.searchParams.get("m") ?? "";
  if (!checkToken(m, req.nextUrl.searchParams.get("t"), secret)) return new NextResponse("forbidden", { status: 403 });
  const db = adminClient();
  const { data: msg } = await db.from("messages").select("body, lead_id, leads(language)").eq("id", Number(m)).maybeSingle();
  if (!msg) return new NextResponse("not found", { status: 404 });
  const lang = (msg.leads as unknown as { language: string | null } | null)?.language ?? "en";
  let audio: Response;
  try {
    audio = await synthesize(msg.body as string, lang);
  } catch (e) {
    console.error("tts failed", (e as Error).message);
    return new NextResponse("tts unavailable", { status: 502 });
  }
  return new Response(audio.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=600" } });
}
