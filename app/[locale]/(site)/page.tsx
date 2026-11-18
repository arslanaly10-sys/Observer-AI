import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Calculator, Translate, Buildings, ShieldCheck, ArrowRight, Article, WhatsappLogo, ArrowBendUpRight, BellSimple, Handshake } from "@phosphor-icons/react/dist/ssr";
import { getSite, audienceIds } from "@/dictionaries/site";
import { getExtra } from "@/dictionaries/site-extra";
import { img, type PhotoKey } from "@/lib/img";
import type { Locale } from "@/lib/i18n";
import { pageMeta, SITE } from "@/lib/seo";
import { Tile, Heading, Eyebrow, CloseBand } from "@/components/site/Section";
import { Hero } from "@/components/site/Hero";
import { LiveDemo } from "@/components/site/LiveDemo";
import { NightShift } from "@/components/site/NightShift";
import { AppFrame, Phone, ScoreDiagram, shot } from "@/components/site/Illustrations";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const h = getSite(locale).home.hero;
  return { ...pageMeta(locale, "", h.h1, h.sub), title: { absolute: `Observer AI · ${h.h1.replace(/\.$/, "")}` } };
}

export const audiencePhoto: Record<string, PhotoKey> = {
  brokerages: "teamMeeting", agents: "agentWoman", developers: "museumFuture", investors: "skylineNight",
};

const stepIcons = [Article, WhatsappLogo, ArrowBendUpRight, ArrowBendUpRight, BellSimple, Handshake];

/** One tile of the "what happens next" grid: a link with a stamp, a title, a line, and product media bleeding off the edge. */
function StoryTile({ href, stamp, h, t, dark, className = "", children }: { href: string; stamp: string; h: string; t: string; dark?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={`lift group flex flex-col overflow-hidden rounded-[24px] ${dark ? "bg-black text-white" : "bg-parchment text-ink"} ${className}`}>
      <div className="p-7 pb-0 sm:p-9 sm:pb-0">
        <Eyebrow dark={dark}>{stamp}</Eyebrow>
        <h3 className="t-title max-w-[22ch]">{h}</h3>
        <p className={`mt-3 max-w-[52ch] text-[16px] leading-relaxed ${dark ? "text-white/65" : "text-ink-2"}`}>{t}</p>
      </div>
      <div className="relative mt-8 flex-1">{children}</div>
    </Link>
  );
}

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getSite(locale);
  const x = getExtra(locale);
  const s = x.story;
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
      <Hero h={h.hero} x={x.hero} form={x.cta} locale={locale} L={L} sources={x.integrations.items.slice(0, 9)} />

      {/* The night shift: one night, scroll-driven */}
      <NightShift n={x.night} card={x.hero.card} heading={h.problem.h2} locale={locale} />

      {/* What happens next: four moments, each shown in the product */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 md:py-24">
          <p className="t-eyebrow mb-6 text-ink-3">{s.next}</p>
          <div className="grid gap-4 lg:grid-cols-12">
            <StoryTile href={L("/product#channels")} stamp={s.whatsapp} h={h.whatsapp.h2} t={h.whatsapp.body} dark className="lg:col-span-7">
              <div className="h-[260px] overflow-hidden ps-7 sm:h-[330px] sm:ps-9">
                <div className="w-[135%] transition-transform duration-700 group-hover:-translate-y-2 rtl:-ms-[35%]">
                  <AppFrame src={shot("whatsapp", locale)} alt={ar ? "محادثة واتساب مع رد مقترح من أوبزرفر" : "A WhatsApp conversation with Observer’s suggested reply"} />
                </div>
              </div>
            </StoryTile>
            <StoryTile href={L("/product#intelligence")} stamp={s.score} h={h.score.h2} t={h.score.body} className="lg:col-span-5">
              <div className="px-5 pb-6 sm:px-8"><ScoreDiagram labels={scoreLabels} /></div>
            </StoryTile>
            <StoryTile href={L("/product#analytics")} stamp={s.desk} h={h.desk.h2} t={h.desk.body} className="lg:col-span-8">
              <div className="h-[260px] overflow-hidden ps-7 sm:h-[340px] sm:ps-9">
                <div className="w-[125%] transition-transform duration-700 group-hover:-translate-y-2 rtl:-ms-[25%]">
                  <AppFrame src={shot("dashboard", locale)} alt={ar ? "لوحة أوبزرفر: العملاء الأكثر جاهزية" : "Observer dashboard: hot leads and next best actions"} />
                </div>
              </div>
            </StoryTile>
            <StoryTile href={L("/app/dashboard")} stamp={s.mobile} h={s.mobileH} t={s.mobileT} dark className="lg:col-span-4">
              <div className="h-[300px] overflow-hidden">
                <div className="origin-top scale-[0.9] transition-transform duration-700 group-hover:-translate-y-2">
                  <Phone src={shot("dashboard-mobile", ar ? "en" : "ar")} alt={ar ? "أوبزرفر على الهاتف بالإنجليزية" : "Observer on a phone, in Arabic"} />
                </div>
              </div>
            </StoryTile>
          </div>
        </div>
      </section>

      {/* Day 1 to day 7: the follow-up cascade, on the night canvas */}
      <Tile ground="night">
        <Heading eyebrow={s.cascade} h={h.cascade.h2} body={h.cascade.body} dark />
        <ol className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-0">
          {h.cascade.steps.map((step, i) => {
            const Icon = stepIcons[i];
            const last = i === h.cascade.steps.length - 1;
            return (
              <li key={i} className="relative border-t border-white/15 pt-6 lg:pe-6">
                <span aria-hidden className={`absolute -top-[5px] start-0 size-[9px] rounded-full ${last ? "bg-[#3ecf7a]" : "bg-white"}`} />
                <p className="tnum whitespace-nowrap text-[28px] font-semibold leading-none tracking-[-0.03em] md:text-[34px] xl:text-[38px]">{h.cascade.waits[i]}</p>
                <p className="mt-4 flex items-center gap-2 text-[15px] text-white/70">
                  <Icon size={18} className={last ? "text-[#3ecf7a]" : "text-white/50"} />{step}
                </p>
              </li>
            );
          })}
        </ol>
      </Tile>

      {/* Try it: a real enquiry, read by the real engine */}
      <Tile id="try">
        <Heading eyebrow={s.demo} h={x.demo.h2} body={x.demo.body} />
        <div className="mt-10"><LiveDemo t={x.demo} locale={locale} /></div>
      </Tile>

      {/* Made in the Gulf: photograph beside the four specifics */}
      <Tile rule>
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="zoom-frame relative aspect-[4/3] overflow-hidden rounded-[24px] lg:aspect-[4/5]">
            <Image src={img("villaPool", 1600)} alt={ar ? "فيلا بيضاء حديثة مع مسبح" : "A white modern villa with a pool"} fill sizes="(min-width:1024px) 540px, 100vw" className="object-cover" />
          </div>
          <div>
            <Heading eyebrow={s.gulf} h={h.gulf.h2} body={h.gulf.body} stack />
            <ul className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {h.gulf.items.map((it, i) => {
                const Icon = [Calculator, Translate, Buildings, ShieldCheck][i];
                return (
                  <li key={it.h} className="border-t border-hairline pt-5">
                    <Icon size={24} className="text-creek" />
                    <h3 className="t-tagline mt-3">{it.h}</h3>
                    <p className="mt-1.5 text-ink-2">{it.t}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Tile>

      {/* The numbers, over the Burj at night */}
      <section className="relative isolate overflow-hidden bg-black text-white">
        <Image src={img("burjNight", 2400)} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/70 to-black/30 rtl:bg-gradient-to-l" />
        <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 md:py-24">
          <Heading eyebrow={s.results} h={h.results.h2} body={h.results.note} dark />
          <dl className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {h.results.items.map((r) => (
              <div key={r.t} className="border-t border-white/20 pt-5">
                <dt className="sr-only">{r.t}</dt>
                <dd>
                  <span className="tnum block text-[48px] font-semibold leading-none tracking-[-0.035em] md:text-[56px]">{r.n}</span>
                  <span className="mt-3 block text-white/70">{r.t}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Who it's for */}
      <Tile>
        <Heading eyebrow={s.who} h={h.who.h2} />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {audienceIds.map((id) => {
            const a = t.audiences[id];
            return (
              <li key={id}>
                <Link href={L(`/solutions/${id}`)} className="group relative block aspect-[4/3] overflow-hidden rounded-[24px] sm:aspect-[3/4] bg-black text-white">
                  <Image src={img(audiencePhoto[id], 900)} alt="" fill sizes="(min-width:1024px) 300px, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="t-tagline flex items-center justify-between">{a.label}<ArrowRight size={18} className="transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" /></h3>
                    <p className="t-caption mt-2 text-white/75">{a.short}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Tile>

      <CloseBand
        h={h.close.h2}
        body={h.close.body}
        locale={locale}
        button={h.close.cta}
        form={x.cta}
        cta2={[h.close.cta2, L("/app/dashboard")]}
        aside={
          <div>
            <p className="t-eyebrow text-white/55">{s.works}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {x.integrations.items.map((i) => <li key={i} className="rounded-full border border-white/15 px-3.5 py-1.5 text-[14px] text-white/80">{i}</li>)}
            </ul>
          </div>
        }
      />
    </>
  );
}
