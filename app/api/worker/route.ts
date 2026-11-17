import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { adminClient } from "@/lib/supabase/admin";
import { runDue } from "@/lib/growth/worker";

export const maxDuration = 60;

/** Called every minute by pg_cron (Bearer WORKER_SECRET) or Vercel Cron (Bearer CRON_SECRET). */
function authorized(req: NextRequest) {
  const got = Buffer.from(req.headers.get("authorization") ?? "");
  return [process.env.WORKER_SECRET, process.env.CRON_SECRET].some((s) => {
    if (!s) return false;
    const want = Buffer.from(`Bearer ${s}`);
    return got.length === want.length && timingSafeEqual(got, want);
  });
}

async function handle(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const results = await runDue(adminClient(), { max: 10, budgetMs: 50_000 });
    return NextResponse.json({ processed: results.length, results });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
export const GET = handle;
export const POST = handle;
