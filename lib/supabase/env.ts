/**
 * Supabase connection settings. Both values are public by design (the publishable key only ever
 * acts as the `anon` role; row-level security decides what it can see). No secret key is used anywhere.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** False until both variables are set, so the site keeps working before the backend is connected. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
