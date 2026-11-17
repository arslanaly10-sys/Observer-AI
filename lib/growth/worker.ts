import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { processJob, type Job } from "./pipeline";

/** Claim due jobs (SKIP LOCKED, so overlapping runs never double-send) and process them within a time budget. */
export async function runDue(db: SupabaseClient, opts: { max?: number; budgetMs?: number } = {}) {
  const started = Date.now(), budget = opts.budgetMs ?? 50_000;
  const { data: jobs, error } = await db.rpc("claim_due_jobs", { max_jobs: opts.max ?? 10 });
  if (error) throw error;
  const results: { id: number; kind: string; result: string }[] = [];
  for (const job of (jobs ?? []) as Job[]) {
    if (Date.now() - started > budget) {
      await db.from("jobs").update({ status: "pending", attempts: job.attempts - 1 }).eq("id", job.id);
      continue;
    }
    try {
      const result = await processJob(db, job);
      await db.from("jobs").update({ status: "done", last_error: null, updated_at: new Date().toISOString() }).eq("id", job.id);
      results.push({ id: job.id, kind: job.kind, result });
    } catch (e) {
      const msg = (e as Error).message.slice(0, 1000);
      const retry = job.attempts < 3;
      await db.from("jobs").update({
        status: retry ? "pending" : "failed", last_error: msg, updated_at: new Date().toISOString(),
        ...(retry ? { run_at: new Date(Date.now() + 2 ** job.attempts * 60_000).toISOString() } : {}),
      }).eq("id", job.id);
      results.push({ id: job.id, kind: job.kind, result: `error: ${msg}` });
    }
  }
  return results;
}
