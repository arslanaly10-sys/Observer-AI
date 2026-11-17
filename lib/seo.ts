import type { Metadata } from "next";
import type { Locale } from "./i18n";

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://observer-ai-sable.vercel.app";

/** Per-page metadata with canonical and hreflang alternates for both languages. */
export function pageMeta(locale: Locale, path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: { en: `/en${path}`, ar: `/ar${path}`, "x-default": `/en${path}` },
    },
    openGraph: { title, description, locale: locale === "ar" ? "ar_AE" : "en_AE", url: `/${locale}${path}` },
  };
}
