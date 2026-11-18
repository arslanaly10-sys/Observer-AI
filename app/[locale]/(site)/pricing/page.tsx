import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { getSite } from "@/dictionaries/site";
import type { Locale } from "@/lib/i18n";
import { Tile, Heading, CloseBand } from "@/components/site/Section";
import { RoiCalculator } from "@/components/site/RoiCalculator";
import { getExtra } from "@/dictionaries/site-extra";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, "/pricing", getSite(locale).nav.pricing, getSite(locale).pricing.sub);
}

export default async function Pricing({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const p = getSite(locale).pricing;
  const roi = getExtra(locale).roi;
  return (
    <>
      <Tile>
        <Heading level={1} h={p.h1} body={p.sub} />
        <ul className="mt-12 grid gap-4 lg:grid-cols-3">
          {p.tiers.map((tier) => {
            const featured = "featured" in tier && tier.featured;
            return (
              <li key={tier.name} className={`relative flex flex-col rounded-[22px] p-8 ${featured ? "bg-tile text-white" : "border border-hairline bg-canvas"}`}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="t-tagline">{tier.name}</h2>
                  {featured && <span className="rounded-full bg-white/12 px-3 py-1 text-[12px] font-medium text-white">{p.popular}</span>}
                </div>
                <p className={`t-caption mt-1 ${featured ? "text-white/60" : "text-ink-2"}`}>{tier.note}</p>
                <p className="mt-8 flex items-baseline gap-2">
                  <span className="tnum text-[40px] font-semibold leading-none tracking-[-0.03em]">{tier.price}</span>
                  {tier.price.match(/\d/) && <span className={featured ? "text-white/60" : "text-ink-2"}>{p.month}</span>}
                </p>
                <ul className="mt-8 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[15px]">
                      <Check size={18} weight="bold" className={`mt-0.5 shrink-0 ${featured ? "text-[#6bd3df]" : "text-creek"}`} />{f}
                    </li>
                  ))}
                </ul>
                <Link href={`/${locale}/contact`} className={`btn mt-10 w-full ${featured ? "bg-white text-[#1d1d1f] hover:bg-white/90" : "btn-primary"}`}>{tier.cta}</Link>
              </li>
            );
          })}
        </ul>
      </Tile>
      <Tile ground="parchment" id="roi">
        <Heading h={roi.h2} body={roi.body} />
        <div className="mt-10"><RoiCalculator t={roi} locale={locale} /></div>
      </Tile>
      <Tile>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start"><Heading h={p.faqH} /></div>
          <div className="divide-y divide-hairline border-y border-hairline">
            {p.faq.map((f) => (
              <details key={f.q} className="group py-2">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 text-[19px] font-semibold tracking-[-0.012em] [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="relative size-4 shrink-0 before:absolute before:inset-x-0 before:top-1/2 before:h-[1.5px] before:bg-current after:absolute after:inset-y-0 after:left-1/2 after:w-[1.5px] after:bg-current after:transition-transform group-open:after:scale-y-0" />
                </summary>
                <p className="pb-5 text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Tile>
      <CloseBand h={getSite(locale).home.close.h2} body={getSite(locale).home.close.body} locale={locale} button={getSite(locale).home.close.cta} form={getExtra(locale).cta} photo="villaWhite" cta2={[getSite(locale).home.close.cta2, `/${locale}/demo`]} />
    </>
  );
}
