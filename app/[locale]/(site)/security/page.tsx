import type { Metadata } from "next";
import { getExtra } from "@/dictionaries/site-extra";
import type { Locale } from "@/lib/i18n";
import { TrustPage } from "@/components/site/TrustPage";
import { pageMeta } from "@/lib/seo";
import { withContacts, legalReviewed } from "@/lib/contact";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = getExtra(locale).trust.security;
  return pageMeta(locale, "/security", d.title, d.h1);
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const d = getExtra(locale).trust.security;
  const sections = d.sections.map((x) => ({ ...x, t: withContacts(x.t, locale) }));
  return <TrustPage h1={d.h1} sub={(d as { sub?: string }).sub} draft={legalReviewed() ? undefined : (d as { draft?: string }).draft} sections={sections} contents={getExtra(locale).story.onThisPage} />;
}
