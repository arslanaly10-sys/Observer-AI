import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSite, audienceIds, type AudienceId } from "@/dictionaries/site";
import { locales, type Locale } from "@/lib/i18n";
import { img, type PhotoKey } from "@/lib/img";
import { Tile, Heading, Cta } from "@/components/site/Section";
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
  return a ? { title: a.label, description: a.sub } : {};
}

export default async function Solution({ params }: { params: Promise<{ locale: Locale; audience: string }> }) {
  const { locale, audience } = await params;
  if (!audienceIds.includes(audience as AudienceId)) notFound();
  const id = audience as AudienceId;
  const t = getSite(locale);
  const a = t.audiences[id];
  return (
    <>
      <section className="relative overflow-hidden bg-tile text-white">
        <Image src={img(hero[id], 2400)} alt="" fill priority sizes="100vw" className="enter-settle object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/40" />
        <div className="relative mx-auto flex min-h-[82vh] max-w-[1180px] flex-col justify-end px-4 pb-20 pt-32 sm:px-6">
          <nav aria-label={t.nav.solutions} className="enter-rise mb-8 flex flex-wrap gap-2">
            {audienceIds.map((x) => (
              <Link key={x} href={`/${locale}/solutions/${x}`} aria-current={x === id ? "page" : undefined} className={`flex min-h-10 items-center rounded-full px-4 text-[14px] backdrop-blur ${x === id ? "bg-white text-[#1d1d1f]" : "bg-white/10 text-white hover:bg-white/20"}`}>{t.audiences[x].label}</Link>
            ))}
          </nav>
          <h1 className="t-hero enter-rise enter-d1 max-w-[18ch]">{a.h1}</h1>
          <p className="t-lead enter-rise enter-d2 mt-6 max-w-[60ch] text-white/80">{a.sub}</p>
          <div className="enter-rise enter-d3 mt-9 flex flex-wrap items-center gap-4">
            <Link href={`/${locale}/contact`} className="btn bg-white text-[#1d1d1f] hover:bg-white/90">{t.common.bookDemo}</Link>
            <Cta href={`/${locale}/app/dashboard`} ghost dark>{t.common.seeApp}</Cta>
          </div>
        </div>
      </section>
      <Tile>
        <ul className="grid gap-12 md:grid-cols-3">
          {a.points.map((pt) => (
            <li key={pt.h} className="border-t border-hairline pt-6">
              <h2 className="t-tagline">{pt.h}</h2>
              <p className="mt-3 text-ink-2">{pt.t}</p>
            </li>
          ))}
        </ul>
        <div className="mx-auto mt-20 max-w-[1080px]"><AppFrame src={shot(shotName[id], locale)} alt={`Observer: ${a.label}`} /></div>
      </Tile>
      <section className="zoom-frame relative h-[60vh] min-h-[360px] overflow-hidden">
        <Image src={img(second[id], 2400)} alt="" fill sizes="100vw" className="object-cover" />
      </section>
      <Tile ground="parchment">
        <Heading h={t.home.close.h2} body={t.home.close.body} />
        <div className="mt-9 flex justify-center"><Cta href={`/${locale}/contact`}>{t.common.bookDemo}</Cta></div>
      </Tile>
    </>
  );
}
