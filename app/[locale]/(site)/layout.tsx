import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { getSite } from "@/dictionaries/site";
import { getExtra } from "@/dictionaries/site-extra";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSite(locale);
  return (
    <>
      <Nav locale={locale} t={t.nav} audiences={t.audiences} menuLabel={getExtra(locale).solutionsMenu} groups={t.product.groups} x={getExtra(locale).navx} cta={getExtra(locale).cta} />
      <main id="main">{children}</main>
      <Footer locale={locale} t={t.footer} legal={getExtra(locale).footerLegal} />
    </>
  );
}
