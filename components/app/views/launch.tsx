"use client";
/**
 * Launch night: a scroll-driven scene for tonight's Nawafir Riyadh Gate launch (after Scrolltide's ARÊTE:
 * scroll moves the day, a dock sets the conditions, glass cards explain each moment).
 * Scroll runs the clock from 18:00 to midnight; the dock sets demand, adds a surge, or holds the AI
 * so the difference it makes is visible. All figures are simulated for the demonstration.
 */
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Wind, Pause, Play, ArrowCounterClockwise, Lightning, Sparkle } from "@phosphor-icons/react";
import { img } from "@/lib/img";
import { useT } from "../i18n";
import { cx } from "../ui";

const START = 18, END = 24, OPEN = 21, UNITS = 720;
const curve = (h: number) => (h < OPEN ? 0.25 + (h - START) * 0.08 : 0.4 + 1.5 * Math.exp(-((h - 21.6) ** 2) / 0.55) + 0.15);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a: string, b: string, k: number) => {
  const p = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(",")})`;
};
function sky(h: number) {
  const k = clamp((h - START) / (END - START));
  if (k < 0.4) { const q = k / 0.4; return [mix("#e9b89a", "#3b2f4f", q), mix("#6d5a7a", "#141225", q)]; }
  const q = (k - 0.4) / 0.6;
  return [mix("#3b2f4f", "#0c0b12", q), mix("#141225", "#050507", q)];
}

const captions = [
  { at: 18, h: "Doors open online at nine.", t: "Expressions of interest are already arriving from Riyadh, Jeddah and Dubai. The AI answers each one and shares the floor plans." },
  { at: 21, h: "The sale opens. 720 units, three towers.", t: "Clients who registered interest are invited in order. Units are held for 30 minutes while the deposit is paid." },
  { at: 21.5, h: "The surge.", t: "Enquiries peak. The AI keeps the first reply under a minute, routes VIP families to senior consultants and never quotes a price outside the list." },
  { at: 23, h: "Close of night.", t: "Every enquiry answered, every hold either paid or released, and a report waiting for the chairman at seven." },
];

export function LaunchNight() {
  const { t } = useT();
  const root = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const [demand, setDemand] = useState(900);
  const [held, setHeld] = useState(false);
  const [gusts, setGusts] = useState(0);
  const [gustOn, setGustOn] = useState(false);
  const [live, setLive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const frame = () => {
      raf = 0;
      const el = root.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setP(clamp(-r.top / Math.max(1, el.offsetHeight - innerHeight + 64)));
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(frame); };
    frame();
    addEventListener("scroll", req, { passive: true });
    addEventListener("resize", req);
    return () => { removeEventListener("scroll", req); removeEventListener("resize", req); if (raf) cancelAnimationFrame(raf); };
  }, []);
  // A slow live drift so the night breathes even while nobody scrolls
  useEffect(() => { const id = setInterval(() => setLive((v) => v + 1), 1000); return () => clearInterval(id); }, []);

  const hour = START + p * (END - START);
  const sim = useMemo(() => {
    let enq = 0, booked = 0;
    for (let h = START; h < hour; h += 0.05) {
      const rate = demand * curve(h) * 0.05;
      enq += rate;
      if (h >= OPEN) booked += rate * (held ? 0.012 : 0.034);
    }
    enq += gusts * 400 + live * (demand / 3600) * curve(hour) * 3;
    if (hour >= OPEN) booked += gusts * (held ? 4 : 14);
    booked = Math.min(UNITS - 12, booked);
    const queue = held ? Math.round(demand * curve(hour) * 0.4 + gusts * 260) : Math.round(gustOn ? 18 : 2);
    const reply = held ? Math.round(9 + queue / 25) * 60 : gustOn ? 52 : 34 + Math.round(curve(hour) * 4);
    return {
      enq: Math.round(enq),
      answered: Math.max(0, Math.round(enq) - queue),
      queue,
      reply,
      booked: Math.round(booked),
      holds: hour >= OPEN ? Math.round(14 + curve(hour) * 22 + (gustOn ? 30 : 0)) : 0,
      vips: Math.round(enq * 0.006),
      value: Math.round(booked * 1.62 * 10) / 10,
    };
  }, [hour, demand, held, gusts, gustOn, live]);

  const cap = [...captions].reverse().find((c) => hour >= c.at) ?? captions[0];
  const [top, bottom] = sky(hour);
  const hh = Math.floor(hour) % 24, mm = Math.floor((hour % 1) * 60);
  const clock = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  const gust = () => { setGusts((g) => g + 1); setGustOn(true); setTimeout(() => setGustOn(false), 2600); };
  const fmt = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60 ? `${s % 60}s` : ""}` : `${s}s`);

  return (
    <section ref={root} aria-label={t("Launch night simulation")} className="relative -mx-4 -mt-6 sm:-mx-6 sm:-mt-8" style={{ height: "380vh" }}>
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden text-white" style={{ background: `linear-gradient(to bottom, ${top}, ${bottom})` }}>
        <Image src={img("towerAbstract", 1800)} alt="" fill sizes="100vw" className="object-cover opacity-25 mix-blend-luminosity" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

        {/* Header strip */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 sm:p-8">
          <div>
            <p className="t-eyebrow !mb-1 !text-[#e7d6b3]">{t("Launch night")} · {t("Nawafir Riyadh Gate")}</p>
            <h1 className="text-[34px] leading-none sm:text-[52px]">{t("Riyadh Gate, tonight")}</h1>
          </div>
          <div className="text-end">
            <p className="tnum font-[family-name:var(--font-display)] text-[44px] leading-none sm:text-[64px]">{clock}</p>
            <p className="t-caption text-white/65">{t("Riyadh time")} · {hour < OPEN ? t("Sale opens at 21:00") : t("Sale open")}</p>
          </div>
        </div>

        {/* Towers */}
        <div className="absolute inset-x-0 bottom-[150px] top-[330px] flex items-end justify-center gap-3 px-4 sm:bottom-[160px] sm:gap-6 lg:top-[150px] lg:px-[330px]" aria-hidden>
          {[0, 1, 2].map((tw) => {
            const per = UNITS / 3;
            const filled = Math.max(0, Math.min(per, sim.booked / 3 + (tw === 0 ? 6 : tw === 1 ? 0 : -6)));
            return (
              <div key={tw} className="flex h-full flex-col items-center">
                <div className="grid h-full grid-cols-8 gap-[2px]" style={{ gridTemplateRows: "repeat(30, minmax(0, 1fr))", width: "clamp(70px, 9vw, 130px)" }}>
                  {Array.from({ length: per }, (_, i) => {
                    const order = i; // top floors first
                    const isBooked = order < filled;
                    const isHeld = !isBooked && order < filled + (sim.holds / 3);
                    return <span key={i} className={cx("transition-colors duration-500", isBooked ? "bg-[#cdb284]" : isHeld ? "bg-[#cdb284]/40" : "bg-white/[0.07]")} />;
                  })}
                </div>
                <p className="t-caption mt-2 text-white/70">{t("Gate")} {tw + 1}</p>
              </div>
            );
          })}
        </div>

        {/* Live numbers */}
        <dl className="absolute end-4 top-[132px] hidden w-[260px] border border-white/15 bg-black/35 p-4 backdrop-blur-xl sm:end-8 lg:block">
          {([
            ["Enquiries", sim.enq.toLocaleString("en")],
            ["Answered", sim.answered.toLocaleString("en")],
            ["Median first reply", fmt(sim.reply)],
            ["Units booked", `${sim.booked} / ${UNITS}`],
            ["Units on hold", String(sim.holds)],
            ["VIP families escalated", String(sim.vips)],
            ["Value booked", `SAR ${sim.value}M`],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-white/10 py-2 last:border-0">
              <dt className="text-[13px] text-white/65">{t(k)}</dt>
              <dd dir="ltr" className={cx("tnum text-[14px] font-semibold", k === "Median first reply" && held && "text-[#ff9a6e]")}>{v}</dd>
            </div>
          ))}
        </dl>

        {/* Caption */}
        <div key={cap.h} className="nba-rise absolute start-4 top-[132px] w-[min(340px,calc(100%-2rem))] border border-white/15 bg-black/35 p-4 backdrop-blur-xl sm:start-8">
          <p className="t-eyebrow !mb-1 !text-[#e7d6b3]">{t("From")} {String(Math.floor(cap.at)).padStart(2, "0")}:{cap.at % 1 ? "30" : "00"}</p>
          <p className="lux-serif text-[24px] leading-tight">{t(cap.h)}</p>
          <p className="mt-2 text-[14px] leading-relaxed text-white/75">{t(cap.t)}</p>
          {held && <p className="mt-3 flex items-start gap-1.5 text-[13.5px] text-[#ff9a6e]"><Pause size={15} weight="fill" className="mt-0.5 shrink-0" />{t("AI on hold. Replies now wait for people: the queue grows and bookings slow.")}</p>}
          {gustOn && !held && <p className="mt-3 flex items-start gap-1.5 text-[13.5px] text-[#e7d6b3]"><Lightning size={15} weight="fill" className="mt-0.5 shrink-0" />{t("Surge: 400 enquiries in a minute, all answered in under a minute.")}</p>}
        </div>

        {/* Dock */}
        <div className="absolute inset-x-3 bottom-4 mx-auto flex max-w-[760px] flex-wrap items-center gap-3 border border-white/15 bg-black/45 px-4 py-3 backdrop-blur-xl sm:bottom-6">
          <label className="flex min-w-[220px] flex-1 items-center gap-3 text-[13px]">
            <Wind size={18} className="shrink-0 text-[#e7d6b3]" />
            <span className="t-eyebrow !mb-0 !text-[#e7d6b3]">{t("Demand")}</span>
            <input type="range" min={300} max={1500} step={50} value={demand} onChange={(e) => setDemand(+e.target.value)} className="flex-1 accent-[#cdb284]" aria-label={t("Enquiries per hour at peak")} />
            <span className="tnum w-20 text-end text-white/80">{demand}/{t("hr")}</span>
          </label>
          <div className="flex gap-2">
            <button onClick={gust} className="inline-flex h-9 items-center gap-1.5 bg-[#cdb284] px-3.5 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-[#15120e] hover:bg-[#e0c99f] rtl:tracking-normal"><Lightning size={14} weight="fill" />{t("Gust")}</button>
            <button onClick={() => setHeld((v) => !v)} aria-pressed={held} className={cx("inline-flex h-9 items-center gap-1.5 border px-3.5 text-[12.5px] font-semibold uppercase tracking-[0.12em] rtl:tracking-normal", held ? "border-[#ff9a6e] text-[#ff9a6e]" : "border-white/30 text-white hover:border-white")}>{held ? <Play size={14} weight="fill" /> : <Pause size={14} weight="fill" />}{t(held ? "Resume AI" : "Hold AI")}</button>
            <button onClick={() => { setDemand(900); setHeld(false); setGusts(0); scrollTo({ top: 0, behavior: "smooth" }); }} className="inline-flex h-9 items-center gap-1.5 border border-white/30 px-3 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-white hover:border-white rtl:tracking-normal"><ArrowCounterClockwise size={14} />{t("Reset")}</button>
          </div>
          <p className="w-full text-[12px] text-white/55"><Sparkle size={12} weight="fill" className="me-1 inline text-[#e7d6b3]" />{t("Scroll to move the evening forward. Simulated figures for the demonstration.")}</p>
        </div>
      </div>
    </section>
  );
}
