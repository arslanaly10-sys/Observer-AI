import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { safeNext } from "@/lib/safe-next";

/**
 * Completes every email and OAuth flow: sign-up confirmation, magic link, password recovery and Google.
 * PKCE links arrive with ?code=; links built from a token_hash email template arrive with ?token_hash=&type=.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"), "/en/workspace");
  const locale = next.startsWith("/ar") ? "ar" : "en";
  const fail = (reason: string) => NextResponse.redirect(new URL(`/${locale}/login?error=${encodeURIComponent(reason)}`, url.origin));
  if (!isSupabaseConfigured) return fail("not_configured");

  const supabase = await createClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail("link_expired");
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) return fail("link_expired");
  } else {
    return fail(url.searchParams.get("error_description") ? "provider_error" : "missing_code");
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
