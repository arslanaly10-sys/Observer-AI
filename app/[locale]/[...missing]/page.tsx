import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

/** Any unknown path under a locale renders the bilingual 404 in app/[locale]/not-found.tsx. */
export default function Missing() {
  notFound();
}
