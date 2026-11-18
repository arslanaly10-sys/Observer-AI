import type { Metadata } from "next";
import { getSite } from "@/dictionaries/site";
import { getExtra } from "@/dictionaries/site-extra";
import type { Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { Tile, Heading, CloseBand } from "@/components/site/Section";
import { AppFrame, shot } from "@/components/site/Illustrations";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, "/product", getSite(locale).nav.product, getSite(locale).product.sub);
}

export default async function Product({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getSite(locale);
  const p = t.product;
  const soon = locale === "ar" ? "قريباً" : "Soon";
  return (
    <>
      <Tile className="!pb-10 md:!pb-14">
        <Heading level={1} h={p.h1} body={p.sub} />
        <nav aria-label={t.nav.product} className="mt-10 flex flex-wrap gap-2">
          {p.groups.map((g, i) => (
            <a key={g.id} href={`#${g.id}`} className="flex min-h-11 items-center gap-2 rounded-full border border-hairline px-4 text-[15px] transition-colors hover:border-ink">
              <span className="tnum text-[12px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>{g.h}
            </a>
          ))}
        </nav>
      </Tile>

      {p.groups.map((g, i) => (
        <Tile key={g.id} id={g.id} rule className="scroll-mt-16">
          <Heading eyebrow={String(i + 1).padStart(2, "0")} h={g.h} body={g.t} />
          {/* The screen, large and cropped, so the product carries the section */}
          <div className="relative mt-10 h-[260px] overflow-hidden rounded-t-[20px] sm:h-[420px] lg:h-[540px]">
            <AppFrame src={shot(g.shot, locale)} alt={`${g.h}: Observer`} />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-canvas to-transparent" />
          </div>
          <dl className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {g.items.map((it) => (
              <div key={it.h} className="border-t border-hairline pt-5">
                <dt className="t-tagline flex flex-wrap items-center gap-2">
                  {it.h}
                  {"soon" in it && it.soon && <span className="rounded-full border border-hairline px-2 py-0.5 text-[12px] font-medium text-ink-2">{soon}</span>}
                </dt>
                <dd className="mt-1.5 text-[16px] text-ink-2">{it.t}</dd>
              </div>
            ))}
          </dl>
        </Tile>
      ))}

      <CloseBand
        h={p.close.h2}
        body={getExtra(locale).hero.sub}
        locale={locale}
        button={p.close.cta}
        form={getExtra(locale).cta}
        photo="villaSea"
        cta2={[t.nav.app, `/${locale}/demo`]}
      />
    </>
  );
}
