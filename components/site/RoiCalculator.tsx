"use client";
import { useState } from "react";
import Link from "next/link";
import { roiEstimate, REPLY_FACTOR } from "@/lib/engine";
import type { ExtraDict } from "@/dictionaries/site-extra";

const fmt = (n: number, locale: string) => Math.round(n).toLocaleString(locale === "ar" ? "en-US" : "en-US");

/** Pricing page: an honest, inspectable estimate of what slow first replies cost. */
export function RoiCalculator({ t, locale }: { t: ExtraDict["roi"]; locale: string }) {
  const [leads, setLeads] = useState(100);
  const [deal, setDeal] = useState(1_500_000);
  const [pct, setPct] = useState(2);
  const [reply, setReply] = useState<keyof typeof REPLY_FACTOR>("15to60");
  const [qualify, setQualify] = useState(40);
  const [close, setClose] = useState(10);
  const r = roiEstimate({ leads, dealAED: deal, commissionPct: pct, reply, qualifyPct: qualify, closePct: close });
  const aed = (n: number) => (locale === "ar" ? `${fmt(n, locale)} درهم` : `AED ${fmt(n, locale)}`);
  const slider = "w-full accent-[var(--creek)]";
  const label = "flex justify-between gap-3 text-[15px]";
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <div className="grid gap-6 rounded-[22px] bg-canvas p-6 sm:p-8">
        <label className="grid gap-2"><span className={label}>{t.leads}<b className="tnum">{leads}</b></span>
          <input type="range" min={20} max={3000} step={10} value={leads} onChange={(e) => setLeads(+e.target.value)} className={slider} /></label>
        <label className="grid gap-2"><span className={label}>{t.deal}<b className="tnum">{aed(deal)}</b></span>
          <input type="range" min={500_000} max={15_000_000} step={50_000} value={deal} onChange={(e) => setDeal(+e.target.value)} className={slider} /></label>
        <label className="grid gap-2"><span className={label}>{t.commission}<b className="tnum">{pct}%</b></span>
          <input type="range" min={0.5} max={5} step={0.25} value={pct} onChange={(e) => setPct(+e.target.value)} className={slider} /></label>
        <label className="grid gap-2"><span className={label}>{t.qualify}<b className="tnum">{qualify}%</b></span>
          <input type="range" min={5} max={90} step={1} value={qualify} onChange={(e) => setQualify(+e.target.value)} className={slider} /></label>
        <label className="grid gap-2"><span className={label}>{t.close}<b className="tnum">{close}%</b></span>
          <input type="range" min={1} max={40} step={0.5} value={close} onChange={(e) => setClose(+e.target.value)} className={slider} /></label>
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-[15px]">{t.reply}</legend>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(REPLY_FACTOR) as (keyof typeof REPLY_FACTOR)[]).map((k) => (
              <button key={k} type="button" onClick={() => setReply(k)} aria-pressed={reply === k}
                className={`min-h-11 rounded-[12px] border px-3 text-[14px] transition-colors ${reply === k ? "border-creek bg-creek-soft font-medium text-creek" : "border-hairline text-ink-2 hover:text-ink"}`}>
                {t.replies[k]}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="flex flex-col rounded-[22px] bg-tile p-6 text-white sm:p-8" aria-live="polite">
        {r.monthly === 0 ? (
          <p className="t-title my-auto">{t.zero}</p>
        ) : (
          <>
            <p className="text-[15px] text-white/60">{t.monthH}</p>
            <p className="tnum mt-2 text-[clamp(40px,6vw,64px)] font-semibold leading-none tracking-[-0.03em]">{aed(r.monthly)}</p>
            <p className="tnum mt-3 text-white/70">{t.yearH}: <b className="font-semibold text-white">{aed(r.yearly)}</b></p>
            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/15 pt-6">
              <div><dt className="t-caption text-white/60">{t.lostH}</dt><dd className="tnum mt-1 text-[28px] font-semibold">{fmt(r.lostQualified, locale)}</dd></div>
              <div><dt className="t-caption text-white/60">{t.dealsH}</dt><dd className="tnum mt-1 text-[28px] font-semibold">{r.extraDeals.toFixed(1)}</dd></div>
            </dl>
          </>
        )}
        <p className="t-caption mt-8 text-white/55">{t.model}</p>
        <Link href={`/${locale}/contact`} className="btn mt-6 self-start bg-white text-[#1d1d1f] hover:bg-white/90">{t.cta}</Link>
      </div>
    </div>
  );
}
