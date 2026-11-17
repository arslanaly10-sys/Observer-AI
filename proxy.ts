import { NextResponse, type NextRequest } from "next/server";

/** Send "/" to the visitor's language: Arabic when the browser prefers it, English otherwise. */
export function proxy(request: NextRequest) {
  const pref = request.cookies.get("obs-lang")?.value;
  const accept = request.headers.get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  const locale = pref === "ar" || pref === "en" ? pref : first.startsWith("ar") ? "ar" : "en";
  return NextResponse.redirect(new URL(`/${locale}`, request.url), 307);
}

export const config = { matcher: "/" };
