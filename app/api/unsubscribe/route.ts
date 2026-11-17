import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { checkToken } from "@/lib/growth/verify";
import { linkSecret } from "@/lib/growth/guard";

/**
 * Email unsubscribe. GET shows a confirm button (mail scanners open links, so GET never changes anything);
 * POST opts the lead out, including the one-click POST mail providers send for List-Unsubscribe-Post.
 */
function valid(req: NextRequest) {
  const secret = linkSecret();
  const l = req.nextUrl.searchParams.get("l") ?? "";
  return secret && /^[0-9a-f-]{36}$/i.test(l) && checkToken(`unsub:${l}`, req.nextUrl.searchParams.get("t"), secret) ? l : null;
}
const page = (title: string, body: string, form = "") => new NextResponse(
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#f5f5f7;color:#1d1d1f;font:16px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;padding:16px}
main{max-width:420px;background:#fff;border-radius:20px;padding:32px;text-align:center}h1{font-size:22px;margin:0 0 8px}p{color:#6e6e73;margin:0 0 20px}
button{background:#0b6b78;color:#fff;border:0;border-radius:999px;padding:12px 24px;font-size:15px;cursor:pointer}</style></head>
<body><main><h1>${title}</h1><p>${body}</p>${form}</main></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });

export function GET(req: NextRequest) {
  if (!valid(req)) return page("Link expired", "This unsubscribe link is no longer valid. Reply STOP to any of our messages instead.");
  return page("Unsubscribe?", "You’ll stop receiving emails and messages about your property enquiry. لن تصلك رسائل أخرى بخصوص استفسارك.",
    `<form method="post"><button>Unsubscribe</button></form>`);
}

export async function POST(req: NextRequest) {
  const leadId = valid(req);
  if (!leadId) return page("Link expired", "This unsubscribe link is no longer valid. Reply STOP to any of our messages instead.");
  const db = adminClient();
  await db.from("leads").update({ opted_out: true, ai_mode: "paused", consent_email: false }).eq("id", leadId);
  await db.from("jobs").update({ status: "cancelled" }).eq("lead_id", leadId).eq("status", "pending");
  return page("You’re unsubscribed", "We won’t contact you again about this enquiry. تم إلغاء اشتراكك.");
}
