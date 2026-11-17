import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { updateSession, carry } from "@/lib/supabase/proxy";

function preferredLocale(request: NextRequest) {
  const pref = request.cookies.get("obs-lang")?.value;
  if (pref === "ar" || pref === "en") return pref;
  const first = (request.headers.get("accept-language") ?? "").split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("ar") ? "ar" : "en";
}

/**
 * 1. "/" goes to /ar or /en by the visitor's language.
 * 2. Workspace and account routes refresh the Supabase session; signed-out visitors are sent to sign in.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/") return NextResponse.redirect(new URL(`/${preferredLocale(request)}`, request.url), 307);
  if (!isSupabaseConfigured) return NextResponse.next();

  const { response, claims } = await updateSession(request);
  const m = pathname.match(/^\/(en|ar)\/(workspace|account)(\/|$)/);
  if (m && !claims) {
    const url = new URL(`/${m[1]}/login`, request.url);
    url.searchParams.set("next", pathname + search);
    return carry(response, NextResponse.redirect(url));
  }
  return response;
}

export const config = {
  matcher: ["/", "/:locale(en|ar)/workspace/:path*", "/:locale(en|ar)/account/:path*", "/:locale(en|ar)/login", "/:locale(en|ar)/invite/:path*"],
};
