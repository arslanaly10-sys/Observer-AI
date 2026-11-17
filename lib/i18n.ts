export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}
export function dirOf(l: Locale) {
  return l === "ar" ? "rtl" : "ltr";
}
export function otherLocale(l: Locale): Locale {
  return l === "ar" ? "en" : "ar";
}
/** Swap the locale segment of a pathname. */
export function switchPath(pathname: string, to: Locale) {
  const parts = pathname.split("/");
  if (parts[1] && isLocale(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/") || `/${to}`;
}
