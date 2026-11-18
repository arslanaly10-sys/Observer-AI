import Image from "next/image";
import Link from "next/link";
import { Calculator, Translate, Buildings, ShieldCheck, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getSite, audienceIds } from "@/dictionaries/site";
import { img, type PhotoKey } from "@/lib/img";
import type { Locale } from "@/lib/i18n";
import { Tile, Heading, Cta } from "@/components/site/Section";
import { Hero } from "@/components/site/Hero";
import { LiveDemo } from "@/components/site/LiveDemo";
import { Integrations } from "@/components/site/Integrations";
import { getExtra } from "@/dictionaries/site-extra";
import { pageMeta, SITE } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const h = getSite(locale).home.hero;
  return { ...pageMeta(locale, "", h.h1, h.sub), title: { absolute: `Observer AI · ${h.h1.replace(/\.$/, "")}` } };
}
import { AppFrame, Phone, ScoreDiagram, CascadeDiagram, shot } from "@/components/site/Illustrations";

export const audiencePhoto: Record<string, PhotoKey> = {
  brokerages: "teamMeeting", agents: "agentWoman", developers: "museumFuture", investors: "skylineNight",
};

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getSite(locale);
  const x = getExtra(locale);
  const h = t.home;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: "Observer AI", url: SITE, logo: `${SITE}/icon.svg`, areaServed: ["AE", "SA", "QA", "KW", "BH", "OM"] },
      { "@type": "SoftwareApplication", name: "Observer AI", applicationCategory: "BusinessApplication", operatingSystem: "Web", inLanguage: ["en", "ar"], description: h.hero.sub, url: `${SITE}/${locale}` },
    ],
  };
  const L = (p: string) => `/${locale}${p}`;
  const ar = locale === "ar";
  const scoreLabels = ar
    ? ["التفاعل", "مطابقة الميزانية", "التوقيت", "سرعة الرد", "الطلب على المنطقة", "جودة المصدر", "التمويل"]
    : ["Engagement", "Budget match", "Timeframe", "Response speed", "Area demand", "Source quality", "Financing"];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero h={h.hero} x={x.hero} L={L} sources={x.integrations.items.slice(0, 9)} />

      {/* The problem */}
      <Tile>
        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Heading h={h.problem.h2} body={h.problem.body} center={false} />
          <ul className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1 lg:gap-0">
            {h.problem.facts.map((f) => (
              <li key={f.n} className="flex items-baseline gap-5 border-t border-hairline pt-4 lg:py-4">
                <p className="tnum min-w-[3.4ch] shrink-0 whitespace-nowrap text-[40px] font-semibold leading-none tracking-[-0.03em]">{f.n}</p>
                <p className="text-ink-2">{f.t}</p>
              </li>
            ))}
          </ul>
        </div>
      </Tile>

      {/* The interactive moment: a real enquiry, read by the real engine */}
      <Tile ground="parchment" id="try">
        <Heading h={x.demo.h2} body={x.demo.body} />
        <div className="mx-auto mt-10 max-w-[1080px]"><LiveDemo t={x.demo} locale={locale} /></div>
      </Tile>

      {/* One calm screen, in two languages and on a phone */}
      <Tile>
        <Heading h={h.desk.h2} body={h.desk.body} />
        <div className="mx-auto mt-10 grid max-w-[1080px] items-center gap-10 md:grid-cols-[1fr_280px]">
          <AppFrame src={ar ? "/shots/dashboard.jpg" : "/shots/dashboard-ar.jpg"} alt={ar ? "لوحة القيادة بالإنجليزية" : "The dashboard in Arabic, right to left"} />
          <Phone src={shot("dashboard-mobile", locale)} alt={ar ? "أوبزرفر على الهاتف" : "Observer on a phone"} />
        </div>
      </Tile>

      {/* WhatsApp, on a dark tile */}
      <Tile ground="tile">
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Heading h={h.whatsapp.h2} body={h.whatsapp.body} center={false} dark />
            <div className="mt-8"><Cta href={L("/product#channels")} ghost dark>{h.whatsapp.link}</Cta></div>
          </div>
          <AppFrame src={shot("whatsapp", locale)} alt={ar ? "محادثة واتساب مع رد مقترح من أوبزرفر" : "A WhatsApp conversation with Observer’s suggested reply"} />
        </div>
      </Tile>

      {/* Scoring, drawn */}
      <Tile>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Heading h={h.score.h2} body={h.score.body} center={false} />
          <div className="rounded-[18px] border border-hairline-soft bg-pearl p-6 sm:p-10">
            <ScoreDiagram labels={scoreLabels} />
          </div>
        </div>
      </Tile>

      {/* The cascade */}
      <Tile ground="parchment">
        <Heading h={h.cascade.h2} body={h.cascade.body} />
        <div className="mx-auto mt-10 max-w-[1080px]">
          <CascadeDiagram steps={h.cascade.steps} waits={h.cascade.waits} />
        </div>
      </Tile>

      {/* Made for the Gulf: photograph beside the four specifics */}
      <Tile>
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="zoom-frame relative aspect-[4/3] overflow-hidden rounded-[22px] lg:aspect-[4/5]">
            <Image src={img("villaPool", 1600)} alt={ar ? "فيلا بيضاء حديثة مع مسبح" : "A white modern villa with a pool"} fill sizes="(min-width:1024px) 520px, 100vw" className="object-cover" />
          </div>
          <div>
            <Heading h={h.gulf.h2} body={h.gulf.body} center={false} />
            <ul className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {h.gulf.items.map((it, i) => {
                const Icon = [Calculator, Translate, Buildings, ShieldCheck][i];
                return (
                  <li key={it.h}>
                    <Icon size={26} className="text-creek" />
                    <h3 className="t-tagline mt-3">{it.h}</h3>
                    <p className="mt-1.5 text-ink-2">{it.t}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Tile>

      {/* Results over the Burj at night */}
      <section className="relative overflow-hidden bg-tile text-white">
        <Image src={img("burjNight", 2400)} alt="" fill sizes="100vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80" />
        <div className="relative mx-auto max-w-[1180px] px-4 py-16 sm:px-6 md:py-24">
          <Heading h={h.results.h2} dark />
          <p className="t-caption mx-auto mt-3 max-w-[56ch] text-center text-white/60">{h.results.note}</p>
          <dl className="mx-auto mt-10 grid max-w-[1000px] gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {h.results.items.map((r) => (
              <div key={r.t} className="border-t border-white/20 pt-6">
                <dt className="sr-only">{r.t}</dt>
                <dd>
                  <span className="tnum block text-[44px] font-semibold leading-none tracking-[-0.03em]">{r.n}</span>
                  <span className="mt-3 block text-white/70">{r.t}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Who it's for */}
      <Tile>
        <Heading h={h.who.h2} />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {audienceIds.map((id) => {
            const a = t.audiences[id];
            return (
              <li key={id}>
                <Link href={L(`/solutions/${id}`)} className="lift group block overflow-hidden rounded-[18px] bg-parchment">
                  <div className="zoom-frame relative aspect-[4/5]">
                    <Image src={img(audiencePhoto[id], 900)} alt="" fill sizes="(min-width:1024px) 280px, 50vw" className="object-cover" />
                  </div>
                  <div className="p-5">
                    <h3 className="t-tagline flex items-center justify-between">{a.label}<ArrowRight size={18} className="text-creek transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" /></h3>
                    <p className="t-caption mt-2 text-ink-2">{a.short}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Tile>

      {/* Integrations */}
      <Tile ground="parchment"><Integrations t={x.integrations} /></Tile>

      {/* Close */}
      <Tile ground="tile">
        <Heading h={h.close.h2} body={h.close.body} dark />
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
          <Link href={L("/contact")} className="btn bg-white text-[#1d1d1f] hover:bg-white/90">{h.close.cta}</Link>
          <Cta href={L("/app/dashboard")} ghost dark>{h.close.cta2}</Cta>
        </div>
      </Tile>
    </>
  );
}
