import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { checkToken } from "@/lib/growth/verify";
import { linkSecret } from "@/lib/growth/guard";
import { normalizePhone, languageFromPhone } from "@/lib/growth/phone";
import { loadLead, createInboundLead } from "@/lib/growth/pipeline";
import { twilioParams, greeting, languageMenu } from "@/lib/growth/voice-turn";
import type { LeadRecord } from "@/lib/growth/send";

/**
 * Start of a call. Outbound calls we placed carry ?lead=&t=; inbound calls to a workspace's number are matched
 * by the dialled number (voice_from) and the caller's phone, creating a lead if the caller is new.
 */
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  const secret = linkSecret();
  if (!secret) return new NextResponse("voice is not configured: set WORKER_SECRET (24+ characters)", { status: 503 });
  const { params, valid } = await twilioParams(req);
  if (!valid) return new NextResponse("bad signature", { status: 401 });
  const db = adminClient();
  const leadId = req.nextUrl.searchParams.get("lead");
  let lead: LeadRecord | null = null;
  if (leadId && checkToken(leadId, req.nextUrl.searchParams.get("t"), secret)) {
    lead = await loadLead(db, leadId);
  } else if (params.Direction === "inbound") {
    const { data: ws } = await db.from("workspace_settings").select("workspace_id").eq("voice_from", params.To).maybeSingle();
    const phone = normalizePhone(params.From);
    if (ws && phone) {
      const { data: existing } = await db.from("leads").select("*").eq("workspace_id", ws.workspace_id).eq("phone", phone).order("created_at", { ascending: false }).limit(1).maybeSingle();
      lead = existing as LeadRecord | null;
      if (!lead) {
        lead = await createInboundLead(db, ws.workspace_id as string, { name: null, phone, text: "", source: "Phone call", channel: "phone", language: languageFromPhone(phone) });
        if (phone.startsWith("971")) return languageMenu(db, lead);
      }
    }
  }
  if (!lead) return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`, { headers: { "Content-Type": "text/xml" } });
  return greeting(db, lead);
}
