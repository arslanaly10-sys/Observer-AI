import Image from "next/image";
import Link from "next/link";
import { Calculator, Translate, Buildings, ShieldCheck, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getSite, audienceIds } from "@/dictionaries/site";
import { img, type PhotoKey } from "@/lib/img";
import type { Locale } from "@/lib/i18n";
import { Tile, Heading, Cta } from "@/components/site/Section";
import { AppFrame, Phone, ScoreDiagram, CascadeDiagram, shot } from "@/components/site/Illustrations";

export const audiencePhoto: Record<string, PhotoKey> = {
  brokerages: "teamMeeting", agents: "agentWoman", developers: "museumFuture", investors: "skylineNight",
};

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getSite(locale);
  const h = t.home;
  const L = (p: string) => `/${locale}${p}`;
  const ar = locale === "ar";
  const scoreLabels = ar
    ? ["التفاعل", "مطابقة الميزانية", "التوقيت", "سرعة الرد", "الطلب على المنطقة", "جودة المصدر", "التمويل"]
    : ["Engagement", "Budget match", "Timeframe", "Response speed", "Area demand", "Source quality", "Financing"];

  return (
    <>
      {/* Hero: dusk on Sheikh Zayed Road, the product rising out of it (DESIGN.md › Signature) */}
      <section className="relative overflow-hidden bg-tile text-white">
        <div className="absolute inset-0">
          <Image src={img("skylineDusk", 2400)} alt="" fill priority sizes="100vw" className="enter-settle object-cover object-[50%_40%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/80" />
        </div>
        <div className="relative mx-auto max-w-[1180px] px-4 pb-0 pt-32 text-center sm:px-6 md:pt-40">
          <h1 className="t-hero enter-rise mx-auto max-w-[14ch]">{h.hero.h1}</h1>
          <p className="t-lead enter-rise enter-d1 mx-auto mt-6 max-w-[58ch] text-white/80">{h.hero.sub}</p>
          <div className="enter-rise enter-d2 mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
            <Link href={L("/contact")} className="btn bg-white text-[#1d1d1f] hover:bg-white/90">{h.hero.cta}</Link>
            <Cta href={L("/app/dashboard")} ghost dark>{h.hero.cta2}</Cta>
          </div>
          <div className="enter-rise enter-d3 relative mx-auto mt-14 max-w-[1080px] translate-y-px md:mt-20">
            <AppFrame src={shot("dashboard", locale)} alt={ar ? "لوحة أوبزرفر: العملاء الأكثر جاهزية وما أنجزه خلال الليل" : "Observer dashboard: hot leads, overnight activity and next best actions"} priority />
          </div>
        </div>
        <div className="relative h-16 bg-canvas md:h-24" />
      </section>

      {/* The problem */}
      <Tile>
        <Heading h={h.problem.h2} body={h.problem.body} />
        <ul className="mx-auto mt-16 grid max-w-[1000px] gap-10 md:grid-cols-3">
          {h.problem.facts.map((f) => (
            <li key={f.n} className="border-t border-hairline pt-6">
              <p className="tnum text-[44px] font-semibold leading-none tracking-[-0.03em]">{f.n}</p>
              <p className="mt-3 text-ink-2">{f.t}</p>
            </li>
          ))}
        </ul>
      </Tile>

      {/* One calm screen, in two languages and on a phone */}
      <Tile ground="parchment">
        <Heading h={h.desk.h2} body={h.desk.body} />
        <div className="mx-auto mt-16 grid max-w-[1080px] items-center gap-10 md:grid-cols-[1fr_280px]">
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
        <div className="mx-auto mt-16 max-w-[1080px]">
          <CascadeDiagram steps={h.cascade.steps} waits={h.cascade.waits} />
        </div>
      </Tile>

      {/* Made for the Gulf: photograph, then the four specifics */}
      <section className="bg-canvas">
        <div className="zoom-frame relative h-[56vh] min-h-[360px] overflow-hidden">
          <Image src={img("villaPool", 2400)} alt={ar ? "فيلا بيضاء حديثة مع مسبح" : "A white modern villa with a pool"} fill sizes="100vw" className="object-cover" />
        </div>
        <div className="mx-auto max-w-[1180px] px-4 py-20 sm:px-6 md:py-28">
          <Heading h={h.gulf.h2} body={h.gulf.body} />
          <ul className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {h.gulf.items.map((it, i) => {
              const Icon = [Calculator, Translate, Buildings, ShieldCheck][i];
              return (
                <li key={it.h}>
                  <Icon size={28} className="text-creek" />
                  <h3 className="t-tagline mt-4">{it.h}</h3>
                  <p className="mt-2 text-ink-2">{it.t}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Results over the Burj at night */}
      <section className="relative overflow-hidden bg-tile text-white">
        <Image src={img("burjNight", 2400)} alt="" fill sizes="100vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80" />
        <div className="relative mx-auto max-w-[1180px] px-4 py-24 sm:px-6 md:py-32">
          <Heading h={h.results.h2} dark />
          <dl className="mx-auto mt-16 grid max-w-[1000px] gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Close */}
      <Tile ground="parchment">
        <Heading h={h.close.h2} body={h.close.body} />
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
          <Cta href={L("/contact")}>{h.close.cta}</Cta>
          <Cta href={L("/app/dashboard")} ghost>{h.close.cta2}</Cta>
        </div>
      </Tile>
    </>
  );
}
