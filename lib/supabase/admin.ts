import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/**
 * Service-role client for webhooks and the background worker only (lead intake, AI turns, scheduled sends).
 * It bypasses RLS, so it is never used for a signed-in user's request and never reaches the browser.
 */
let admin: SupabaseClient | null = null;
export function adminClient(): SupabaseClient {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!SUPABASE_URL || !key) throw new Error("SUPABASE_SECRET_KEY is not set");
  return (admin ??= createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } }));
}
