import "server-only";
/**
 * Which providers are connected. Secrets stay in server environment variables (Vercel); this module only
 * reports whether each one is present, so pages can show status without ever exposing a value.
 */
const has = (...names: string[]) => names.every((n) => Boolean(process.env[n]));

export const providers = {
  anthropic: () => has("ANTHROPIC_API_KEY"),
  managedAgent: () => has("ANTHROPIC_API_KEY", "OBSERVER_AGENT_ID", "OBSERVER_ENVIRONMENT_ID"),
  supabaseAdmin: () => has("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY"),
  whatsapp: () => has("WHATSAPP_ACCESS_TOKEN", "META_APP_SECRET"),
  metaLeads: () => has("META_PAGE_ACCESS_TOKEN", "META_APP_SECRET", "META_VERIFY_TOKEN"),
  email: () => has("RESEND_API_KEY"),
  emailInbound: () => has("RESEND_WEBHOOK_SECRET"),
  voice: () => has("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"),
  tts: () => has("ELEVENLABS_API_KEY"),
  worker: () => has("WORKER_SECRET"),
};

export function providerStatus() {
  return Object.fromEntries(Object.entries(providers).map(([k, f]) => [k, f()])) as Record<keyof typeof providers, boolean>;
}

export const APP_URL = () => (process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://observer-ai-sable.vercel.app").replace(/\/$/, "");
export const GRAPH = () => `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || "v23.0"}`;
