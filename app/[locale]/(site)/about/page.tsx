import type { Metadata } from "next";
import Image from "next/image";
import { getSite } from "@/dictionaries/site";
import { getExtra } from "@/dictionaries/site-extra";
import type { Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { img } from "@/lib/img";
import { Tile, Heading, Cta } from "@/components/site/Section";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, "/about", getSite(locale).nav.about, getSite(locale).about.sub);
}

export default async function About({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getSite(locale);
  const a = t.about;
  const ar = locale === "ar";
  const [lead, ...rest] = a.story;
  return (
    <>
      {/* Image-led opening: Dubai Marina, the headline set on the photograph */}
      <section className="relative isolate overflow-hidden bg-black text-white">
        <Image src={img("marinaCamels", 2400)} alt={ar ? "أبراج دبي مارينا" : "Dubai Marina towers"} fill priority sizes="100vw" className="enter-settle -z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/30" />
        <div className="mx-auto flex min-h-[72vh] max-w-[1240px] flex-col justify-end px-4 pb-14 pt-32 sm:px-6 md:pb-20">
          <h1 className="t-mega enter-rise max-w-[14ch]">{a.h1}</h1>
          <p className="t-lead enter-rise enter-d1 mt-6 max-w-[56ch] text-white/80">{a.sub}</p>
        </div>
      </section>

      <Tile>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <p className="text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.3] tracking-[-0.02em] text-balance">{lead}</p>
          <div className="space-y-5 text-[18px] leading-[1.6] text-ink-2">{rest.map((p) => <p key={p}>{p}</p>)}</div>
        </div>
      </Tile>

      <Tile rule>
        <Heading eyebrow={getExtra(locale).story.principles} h={a.principlesH} />
        <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {a.principles.map((p, i) => (
            <li key={p.h} className="border-t border-ink pt-5">
              <span className="tnum text-[14px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="t-tagline mt-3">{p.h}</h3>
              <p className="mt-2 text-ink-2">{p.t}</p>
            </li>
          ))}
        </ol>
      </Tile>

      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-[1240px] items-stretch lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[520px]">
            <Image src={img("downtownDay", 1600)} alt={ar ? "برج خليفة ووسط مدينة دبي" : "Burj Khalifa and Downtown Dubai"} fill sizes="(min-width:1024px) 620px, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center px-4 py-16 sm:px-6 lg:px-16">
            <h2 className="t-display">{a.whereH}</h2>
            <p className="t-lead mt-5 text-white/70">{a.where}</p>
            <div className="mt-8"><Cta href={`/${locale}/contact`} dark>{t.common.bookDemo}</Cta></div>
          </div>
        </div>
      </section>
    </>
  );
}
