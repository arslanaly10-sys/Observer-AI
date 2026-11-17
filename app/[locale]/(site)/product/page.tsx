import type { Metadata } from "next";
import { getSite } from "@/dictionaries/site";
import type { Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { Tile, Heading, Cta } from "@/components/site/Section";
import { AppFrame, shot } from "@/components/site/Illustrations";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, "/product", getSite(locale).nav.product, getSite(locale).product.sub);
}

export default async function Product({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getSite(locale);
  const p = t.product;
  return (
    <>
      <Tile className="pt-14">
        <Heading level={1} h={p.h1} body={p.sub} />
        <nav aria-label={t.nav.product} className="mt-10 flex flex-wrap justify-center gap-2">
          {p.groups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="flex min-h-11 items-center rounded-full border border-hairline px-5 text-[15px] hover:border-creek hover:text-creek">{g.h}</a>
          ))}
        </nav>
      </Tile>
      {p.groups.map((g, i) => (
        <Tile key={g.id} id={g.id} ground={i % 2 === 0 ? "parchment" : "canvas"}>
          <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="lg:sticky lg:top-24">
              <h2 className="t-display">{g.h}</h2>
              <p className="t-lead mt-4 text-ink-2">{g.t}</p>
              <dl className="mt-10 space-y-7">
                {g.items.map((it) => (
                  <div key={it.h} className="border-t border-hairline pt-5">
                    <dt className="t-tagline flex items-center gap-2">{it.h}{"soon" in it && it.soon && <span className="rounded-full bg-creek-soft px-2 py-0.5 text-[12px] font-medium text-creek">{locale === "ar" ? "قريباً" : "Soon"}</span>}</dt>
                    <dd className="mt-1.5 text-ink-2">{it.t}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <AppFrame src={shot(g.shot, locale)} alt={`${g.h}: Observer`} />
          </div>
        </Tile>
      ))}
      <Tile ground="tile">
        <Heading h={p.close.h2} dark />
        <div className="mt-9 flex justify-center gap-4">
          <Cta href={`/${locale}/contact`}>{p.close.cta}</Cta>
          <Cta href={`/${locale}/app/dashboard`} ghost dark>{t.nav.app}</Cta>
        </div>
      </Tile>
    </>
  );
}
