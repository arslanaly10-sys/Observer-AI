"use client";
import { useEffect, useMemo, useState } from "react";
import { Sparkle, WhatsappLogo, Checks } from "@phosphor-icons/react";
import { analyzeEnquiry, AR_AREA } from "@/lib/engine";
import type { ExtraDict } from "@/dictionaries/site-extra";

/** The home page's interactive moment: a real enquiry, read by the real engine, in the visitor's browser. */
export function LiveDemo({ t, locale }: { t: ExtraDict["demo"]; locale: "en" | "ar" }) {
  const [text, setText] = useState(t.samples[0].text);
  const [input, setInput] = useState(t.samples[0].text);
  const [shown, setShown] = useState(0);
  const lang: "en" | "ar" = /[؀-ۿ]/.test(input) ? "ar" : "en";
  const r = useMemo(() => analyzeEnquiry(input, lang), [input, lang]);
  // Timed in the browser only (after hydration), so server and client markup match.
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const t0 = performance.now();
    for (let k = 0; k < 20; k++) analyzeEnquiry(input, lang);
    setMs(Math.max(0.1, (performance.now() - t0) / 20));
  }, [input, lang]);

  // Count the score up once per new reading (user-triggered, so it shows what changed).
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(r.score); return; }
    let raf = 0; const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 700);
      setShown(Math.round(r.score * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [r.score, input]);

  const tone = r.temp === "hot" ? "text-hot bg-hot-soft" : r.temp === "warm" ? "text-warm bg-warm-soft" : "text-cold bg-cold-soft";
  const val = (k: string) => t.vals[k] ?? k;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <form
        className="flex flex-col rounded-[22px] bg-canvas p-5 sm:p-7"
        onSubmit={(e) => { e.preventDefault(); setInput(text); }}
      >
        <label htmlFor="demo-msg" className="flex items-center gap-2 text-[15px] font-medium">
          <WhatsappLogo size={20} className="text-wa" /> {t.label}
        </label>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t.label}>
          {t.samples.map((s) => (
            <button
              type="button"
              key={s.label}
              onClick={() => { setText(s.text); setInput(s.text); }}
              aria-pressed={input === s.text}
              className={`min-h-9 rounded-full border px-3.5 text-[14px] transition-colors ${input === s.text ? "border-creek bg-creek-soft text-creek" : "border-hairline text-ink-2 hover:border-ink-3 hover:text-ink"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <textarea
          id="demo-msg"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          dir="auto"
          maxLength={600}
          className="mt-4 min-h-36 w-full resize-none rounded-[16px] bg-[#e7f6ec] px-4 py-3.5 text-[17px] leading-relaxed text-[#0b3b22] outline-none ring-creek focus:ring-2 dark:bg-[#123b25] dark:text-[#d9f7e4]"
        />
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="t-caption text-ink-3">{t.note}</p>
          <button className="btn btn-primary shrink-0">{t.run}</button>
        </div>
      </form>

      <div className="rounded-[22px] bg-canvas p-5 sm:p-7" aria-live="polite">
        <div className="flex items-end gap-4">
          <p className="tnum text-[72px] font-semibold leading-[0.9] tracking-[-0.04em]" aria-label={`${t.score} ${r.score}`}>{shown}</p>
          <div className="pb-1.5">
            <p className="t-caption text-ink-2">{t.score}</p>
            <span className={`mt-1 inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-medium ${tone}`}>{val(r.temp)}</span>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-[15px] sm:grid-cols-4">
          {[[t.intent, val(r.intent.primary)], [t.urgency, val(r.intent.urgency)], [t.area, r.area ? (locale === "ar" ? AR_AREA[r.area] ?? r.area : r.area) : t.unknown], [t.budget, r.budget ?? t.unknown]].map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="t-caption text-ink-2">{k}</dt>
              <dd className="truncate font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="t-caption mt-6 text-ink-2">{t.signals}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {r.intent.hits.length === 0 && <li className="t-caption text-ink-3">{t.none}</li>}
          {r.intent.hits.map((h) => (
            <li key={h.key} className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-parchment px-3 py-1 text-[13px]">
              <b className="font-medium">{t.sig[h.label] ?? h.label}</b>
              <span className="truncate text-ink-2" dir="auto">“{h.evidence}”</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t border-hairline-soft pt-5">
          <p className="flex items-center gap-2 text-[14px] font-medium"><Sparkle size={16} weight="fill" className="text-creek" /> {t.reply}</p>
          <p key={r.reply} dir={lang === "ar" ? "rtl" : "ltr"} className="enter-rise mt-3 rounded-[16px] bg-[#d9f7e4] px-4 py-3 text-[16px] leading-relaxed text-[#0b3b22] dark:bg-[#123b25] dark:text-[#d9f7e4]">
            {r.reply}
          </p>
          <p className="t-caption mt-2 flex items-center gap-1.5 text-ink-3"><Checks size={14} className="text-cold" /> {t.sent} <span className="tnum">{ms === null ? "…" : ms.toFixed(1)}</span> {t.seconds}</p>
        </div>
      </div>
    </div>
  );
}
