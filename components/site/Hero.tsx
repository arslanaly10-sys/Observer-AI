import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, WhatsappLogo, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { img } from "@/lib/img";
import { InlineCta } from "@/components/site/InlineCta";
import type { ExtraDict } from "@/dictionaries/site-extra";

type Copy = { h1: string; cta: string; cta2: string };

/**
 * Home hero: Burj Khalifa at night, full bleed, with one live moment from the product
 * (an enquiry answered, scored and booked) drawn in real UI rather than a screenshot.
 */
export function Hero({ h, x, form, sources, L, locale }: { h: Copy; x: ExtraDict["hero"]; form: ExtraDict["cta"]; sources: string[]; L: (p: string) => string; locale: string }) {
  const c = x.card;
  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      <div className="absolute inset-0 -z-10 rtl:-scale-x-100">
        <Image src={img("burjNight", 2400, "&h=1400&crop=top")} alt="" fill priority sizes="100vw" className="enter-settle object-cover object-[70%_30%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="mx-auto grid max-w-[1240px] items-center gap-x-10 gap-y-14 px-4 pb-10 pt-28 sm:px-6 lg:min-h-[min(calc(100svh-64px),860px)] lg:grid-cols-[1.08fr_0.92fr] lg:pb-14 lg:pt-24">
        <div>
          <p className="enter-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[13px] text-white/80 backdrop-blur">
            <span className="pulse-dot size-1.5 rounded-full bg-[#3ecf7a]" aria-hidden />
            {x.eyebrow}
          </p>
          <h1 className="t-mega enter-rise enter-d1 mt-6 max-w-[12ch]">{h.h1}</h1>
          <p className="enter-rise enter-d2 mt-6 max-w-[44ch] text-[18px] leading-[1.5] text-white/75 md:text-[20px]">{x.sub}</p>
          <div className="enter-rise enter-d2 mt-8">
            <InlineCta locale={locale} label={form.label} placeholder={form.placeholder} button={h.cta} reassure={form.reassure} />
            <Link href={L("/app/dashboard")} className="mt-3 inline-flex min-h-11 items-center gap-2 text-[15px] text-white/85 underline-offset-4 hover:underline">
              {h.cta2}<ArrowRight size={15} className="rtl:-scale-x-100" />
            </Link>
          </div>
          <dl className="enter-rise enter-d3 mt-10 grid max-w-[540px] grid-cols-3 gap-4 border-t border-white/15 pt-6">
            {x.stats.map(([n, t]) => (
              <div key={t}>
                <dt className="sr-only">{t}</dt>
                <dd>
                  <span className="tnum block text-[28px] font-semibold leading-none tracking-[-0.02em] md:text-[34px]">{n}</span>
                  <span className="mt-2 block text-[13px] leading-snug text-white/60 md:text-[14px]">{t}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The live moment */}
        <div className="relative mx-auto w-full max-w-[460px] pb-10 pt-12 sm:pt-[132px] lg:mx-0 lg:ms-auto" aria-label={x.stageLabel} role="img">
          <div className="hero-card enter-d4 rounded-[22px] sm:me-14 bg-white p-4 text-[#1d1d1f] shadow-[0_40px_100px_-30px_rgb(0_0_0/0.9)] sm:p-5" aria-hidden>
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e8f1f3] text-[14px] font-semibold text-[#006b7d]">{c.initials}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">{c.lead}</p>
                <p className="flex items-center gap-1 truncate text-[12.5px] text-[#6e6e73]"><WhatsappLogo size={13} weight="fill" className="hidden shrink-0 text-[#128c4b] sm:block" />{c.source}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f6ec] px-2.5 py-1 text-[12px] font-medium text-[#128c4b] sm:hidden">
                <WhatsappLogo size={14} weight="fill" />WhatsApp
              </span>
            </div>
            <div className="mt-4 space-y-2.5 rounded-2xl bg-[#f4f1ec] p-3 text-[14px] leading-[1.45]">
              <p className="hero-bubble enter-d5 me-8 w-fit rounded-2xl rounded-ss-md bg-white px-3.5 py-2.5 shadow-sm">
                {c.buyer}
                <span className="mt-1 block text-[11px] text-[#86868b]">{c.ago}</span>
              </p>
              <p className="hero-bubble enter-d6 ms-8 rounded-2xl rounded-se-md bg-[#d9fdd3] px-3.5 py-2.5 shadow-sm">
                {c.reply}
                <span className="mt-1 flex items-center gap-1 text-[11px] text-[#3b6e4b]"><Sparkle size={11} weight="fill" />{c.ai}</span>
              </p>
            </div>
            <p className="mt-3 flex items-center gap-2 text-[12.5px] text-[#6e6e73]">
              <span className="size-1.5 rounded-full bg-[#006b7d]" />{c.routed}
            </p>
          </div>

          {/* Score */}
          <div className="hero-card enter-d5 absolute top-0 end-0 hidden w-[200px] rounded-[18px] border border-white/15 bg-[#121214]/85 p-4 shadow-2xl backdrop-blur-xl sm:block xl:-end-8" aria-hidden>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-white/60">{c.score}</span>
              <span className="rounded-full bg-[#ff7a45]/15 px-2 py-0.5 text-[11.5px] font-medium text-[#ff9a6e]">{c.hot}</span>
            </div>
            <p className="tnum mt-1 text-[40px] font-semibold leading-none tracking-[-0.03em]">87</p>
            <ul className="mt-3 space-y-2">
              {c.signals.map(([k, v]) => (
                <li key={k} className="text-[11.5px] text-white/65">
                  <span className="flex justify-between"><span>{k}</span><span className="tnum">{v}</span></span>
                  <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/10">
                    <span className="bar-in block h-full rounded-full bg-[#ff7a45]" style={{ width: `${v}%`, animationDelay: "1s" }} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Booked */}
          <div className="hero-card enter-d7 absolute -bottom-1 start-0 flex items-center gap-3 rounded-2xl bg-white py-3 pe-5 ps-3 text-[#1d1d1f] shadow-[0_24px_60px_-20px_rgb(0_0_0/0.8)] xl:-start-10" aria-hidden>
            <CheckCircle size={30} weight="fill" className="text-[#1f8a4c]" />
            <div>
              <p className="text-[14px] font-semibold leading-tight">{c.booked}</p>
              <p className="text-[12.5px] text-[#6e6e73]">{c.when}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-7 gap-y-2 px-4 py-5 text-[14px] sm:px-6">
          <span className="text-white/45">{x.from}</span>
          {sources.map((s) => <span key={s} className="font-medium text-white/75">{s}</span>)}
        </div>
      </div>
    </section>
  );
}
