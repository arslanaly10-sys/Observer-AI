import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./env";

/**
 * Refreshes the Supabase session on every matched request and returns the verified claims.
 * The returned response carries the refreshed cookies and the no-cache headers; return it (or copy
 * its cookies and headers onto any other response) so the user stays signed in.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  let cacheHeaders: Record<string, string> = {};
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        if (headers) cacheHeaders = { ...cacheHeaders, ...headers };
        for (const [k, v] of Object.entries(cacheHeaders)) response.headers.set(k, v);
      },
    },
  });
  // Do not put code between createServerClient and getClaims: it is what refreshes the session.
  const { data } = await supabase.auth.getClaims();
  return { response, claims: data?.claims ?? null };
}

/** Copy refreshed auth cookies and cache headers onto a different response (e.g. a redirect). */
export function carry(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => to.cookies.set(c));
  for (const h of ["cache-control", "expires", "pragma"]) {
    const v = from.headers.get(h);
    if (v) to.headers.set(h, v);
  }
  return to;
}
