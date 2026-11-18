import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSite, audienceIds, type AudienceId } from "@/dictionaries/site";
import { locales, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { img, type PhotoKey } from "@/lib/img";
import { Tile, Cta, CloseBand } from "@/components/site/Section";
import { getExtra } from "@/dictionaries/site-extra";
import { AppFrame, shot } from "@/components/site/Illustrations";

const hero: Record<AudienceId, PhotoKey> = { brokerages: "teamMeeting", agents: "dealHighFive", developers: "museumFuture", investors: "skylineNight" };
const second: Record<AudienceId, PhotoKey> = { brokerages: "handshake", agents: "villaDusk", developers: "palmAerial", investors: "burjAlArabAerial" };
const shotName: Record<AudienceId, string> = { brokerages: "dashboard", agents: "whatsapp", developers: "payment-plans", investors: "leads" };

export function generateStaticParams() {
  return locales.flatMap((locale) => audienceIds.map((audience) => ({ locale, audience })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; audience: AudienceId }> }): Promise<Metadata> {
  const { locale, audience } = await params;
  const a = getSite(locale).audiences[audience];
  return a ? pageMeta(locale, `/solutions/${audience}`, a.label, a.sub) : {};
}

export default async function Solution({ params }: { params: Promise<{ locale: Locale; audience: string }> }) {
  const { locale, audience } = await params;
  if (!audienceIds.includes(audience as AudienceId)) notFound();
  const id = audience as AudienceId;
  const t = getSite(locale);
  const a = t.audiences[id];
  return (
    <>
      <section className="relative isolate overflow-hidden bg-black text-white">
        <Image src={img(hero[id], 2400)} alt="" fill priority sizes="100vw" className="enter-settle -z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/45 to-black/40" />
        <div className="mx-auto flex min-h-[78vh] max-w-[1240px] flex-col justify-end px-4 pb-16 pt-32 sm:px-6">
          <nav aria-label={t.nav.solutions} className="enter-rise mb-8 flex flex-wrap gap-2">
            {audienceIds.map((x) => (
              <Link key={x} href={`/${locale}/solutions/${x}`} aria-current={x === id ? "page" : undefined} className={`flex min-h-10 items-center rounded-full px-4 text-[14px] backdrop-blur ${x === id ? "bg-white text-[#1d1d1f]" : "bg-white/10 text-white hover:bg-white/20"}`}>{t.audiences[x].label}</Link>
            ))}
          </nav>
          <h1 className="t-mega enter-rise enter-d1 max-w-[16ch]">{a.h1}</h1>
          <p className="t-lead enter-rise enter-d2 mt-6 max-w-[60ch] text-white/80">{a.sub}</p>
          <div className="enter-rise enter-d3 mt-8 flex flex-wrap items-center gap-3">
            <Cta href={`/${locale}/contact`} dark>{t.common.bookDemo}</Cta>
            <Cta href={`/${locale}/demo`} ghost dark>{t.common.seeApp}</Cta>
          </div>
        </div>
      </section>

      <Tile>
        <ol className="grid gap-x-8 gap-y-10 md:grid-cols-3">
          {a.points.map((pt, i) => (
            <li key={pt.h} className="border-t border-ink pt-5">
              <span className="tnum text-[14px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="t-title mt-3">{pt.h}</h2>
              <p className="mt-3 text-ink-2">{pt.t}</p>
            </li>
          ))}
        </ol>
        <div className="relative mt-14 h-[260px] overflow-hidden rounded-t-[20px] sm:h-[440px] lg:h-[580px]">
          <AppFrame src={shot(shotName[id], locale)} alt={`Observer: ${a.label}`} />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-canvas to-transparent" />
        </div>
      </Tile>

      <CloseBand h={t.home.close.h2} body={t.home.close.body} locale={locale} button={t.common.bookDemo} form={getExtra(locale).cta} cta2={[t.common.seeApp, `/${locale}/demo`]} photo={second[id]} />
    </>
  );
}
