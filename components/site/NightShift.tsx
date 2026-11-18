"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { WhatsappLogo, Sparkle, CheckCircle, MoonStars, CalendarCheck, ArrowDown, Lightning } from "@phosphor-icons/react";
import { img } from "@/lib/img";
import type { ExtraDict } from "@/dictionaries/site-extra";

/**
 * "The night shift": a pinned, scroll-driven film of one night at a brokerage.
 * Patterns adapted from Scrolltide (NORDLYS clock, Rann Mahal side-switching copy,
 * tarn pinned product cards, SELENE self-inking rail). Only opacity and transform animate;
 * React re-renders when the chapter changes, everything continuous runs through CSS variables.
 */

type Props = { n: ExtraDict["night"]; card: ExtraDict["hero"]["card"]; heading: string; locale: string };

// Clock keyframes, seconds after 23:00: 11:42, 11:42:38, 11:43, 11:43:40, 2:10, 7:30
const STARTS = [2520, 2558, 2580, 2620, 11400, 30600];
const END = 30660;
const CH = 6;
const SEG = CH + 1; // intro + chapters
const TIMES_EN = ["11:42 pm", "11:42 pm", "11:43 pm", "11:43 pm", "2:10 am", "7:30 am"];
const TIMES_AR = ["11:42 م", "11:42 م", "11:43 م", "11:43 م", "2:10 ص", "7:30 ص"];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

function clock(sec: number, ar: boolean) {
  const total = 23 * 3600 + sec;
  const h24 = Math.floor(total / 3600) % 24;
  const m = Math.floor((total % 3600) / 60);
  const pm = h24 >= 12;
  const h = h24 % 12 || 12;
  return { hm: `${h}:${String(m).padStart(2, "0")}`, ap: ar ? (pm ? "م" : "ص") : pm ? "pm" : "am" };
}

export function NightShift({ n, card, heading, locale }: Props) {
  const ar = locale === "ar";
  const times = ar ? TIMES_AR : TIMES_EN;
  const root = useRef<HTMLElement>(null);
  const hm = useRef<HTMLSpanElement>(null);
  const ap = useRef<HTMLSpanElement>(null);
  const deep = useRef<HTMLDivElement>(null);
  const dawn = useRef<HTMLDivElement>(null);
  const base = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const score = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(-1);
  const [still, setStill] = useState(false);
  const activeRef = useRef(-1);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setStill(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (still) return;
    let raf = 0;
    const frame = () => {
      raf = 0;
      const el = root.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = el.offsetHeight - innerHeight;
      const p = clamp(-r.top / span);
      const s = Math.min(p * SEG, SEG - 0.0001);
      const idx = Math.floor(s) - 1;
      const lp = s - Math.floor(s);
      el.style.setProperty("--lp", lp.toFixed(4));
      // Clock: hold, then run quickly to the next moment so the night visibly passes
      let sec = STARTS[0];
      if (idx >= 0) {
        const next = idx < CH - 1 ? STARTS[idx + 1] : END;
        sec = STARTS[idx] + (next - STARTS[idx]) * smooth(0.55, 1, lp);
      }
      const c = clock(sec, ar);
      if (hm.current) hm.current.textContent = c.hm;
      if (ap.current) ap.current.textContent = c.ap;
      // Sky: blue-hour city, then deep night at the Burj, then morning
      if (deep.current) deep.current.style.opacity = String(smooth(4.6, 5.2, s) * (1 - smooth(5.8, 6.4, s)));
      if (dawn.current) dawn.current.style.opacity = String(smooth(5.8, 6.4, s));
      if (base.current) base.current.style.transform = `scale(${(1.14 - 0.14 * p).toFixed(4)})`;
      if (fill.current) fill.current.style.transform = `scaleX(${clamp((s - 1) / CH).toFixed(4)})`;
      if (score.current && idx === 2) score.current.textContent = String(Math.round(87 * clamp(lp * 1.6)));
      if (idx !== activeRef.current) { activeRef.current = idx; setActive(idx); }
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(frame); };
    frame();
    addEventListener("scroll", req, { passive: true });
    addEventListener("resize", req);
    return () => { removeEventListener("scroll", req); removeEventListener("resize", req); if (raf) cancelAnimationFrame(raf); };
  }, [still, ar]);

  const jump = useCallback((i: number) => {
    const el = root.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + ((i + 1.35) / SEG) * (el.offsetHeight - innerHeight), behavior: "smooth" });
  }, []);

  const cards = [
    <EnquiryCard key="e" n={n} card={card} />,
    <ReplyCard key="r" card={card} />,
    <ScoreCard key="s" card={card} scoreRef={score} />,
    <RouteCard key="o" n={n} />,
    <LateCard key="l" n={n} />,
    <BookedCard key="b" n={n} />,
  ];

  if (still)
    return (
      <section key="still" id="night-shift" aria-label={n.label} className="bg-black text-white" style={{ "--lp": 1 } as CSSProperties}>
        <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 md:py-24">
          <p className="t-eyebrow text-white/55">{n.eyebrow}</p>
          <h2 className="t-display mt-4 max-w-[18ch]">{heading}</h2>
          <ol className="mt-12 space-y-16">
            {n.chapters.map((c, i) => (
              <li key={c.h} className="grid items-center gap-8 lg:grid-cols-2">
                <div>
                  <p className="tnum text-[15px] text-white/55">{times[i]}</p>
                  <h3 className="t-title mt-2">{c.h}</h3>
                  <p className="mt-3 max-w-[44ch] text-[17px] text-white/70">{c.t}</p>
                </div>
                <div aria-hidden className="mx-auto w-full max-w-[420px]">{cards[i]}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );

  return (
    <section ref={root} id="night-shift" aria-label={n.label} className="relative bg-black text-white" style={{ height: `${SEG * 100 + 40}vh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Sky */}
        <div ref={base} className="absolute inset-0 will-change-transform rtl:-scale-x-100">
          <Image src={img("skylineNight", 2000)} alt="" fill sizes="100vw" className="object-cover object-[60%_50%]" />
        </div>
        <div ref={deep} className="absolute inset-0 opacity-0">
          <Image src={img("burjNight", 2000)} alt="" fill sizes="100vw" className="object-cover object-[65%_30%]" />
        </div>
        <div ref={dawn} className="absolute inset-0 opacity-0">
          <Image src={img("downtownDay", 2000)} alt="" fill sizes="100vw" className="object-cover object-[60%_60%]" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-black/55" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/90 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />

        <div className="relative mx-auto h-full max-w-[1240px]">
          {/* Clock */}
          <div className={`absolute start-4 top-[76px] transition-opacity duration-700 sm:start-6 lg:top-24 ${active < 0 ? "opacity-0" : "opacity-100"}`} aria-hidden>
            <p className="tnum flex items-baseline gap-1.5 font-semibold leading-none tracking-[-0.04em]">
              <span ref={hm} className="text-[40px] lg:text-[64px]">11:42</span>
              <span ref={ap} className="text-[16px] tracking-normal text-white/70 lg:text-[20px]">{ar ? "م" : "pm"}</span>
            </p>
            <p className="mt-2 flex items-center gap-2 text-[13px] text-white/60">
              <span className={`size-1.5 rounded-full ${active === CH - 1 ? "bg-[#3ecf7a]" : "bg-[#ff7a45]"}`} />
              {n.office[active === CH - 1 ? 1 : 0]}
            </p>
          </div>

          {/* Intro */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center px-4 text-center transition-[opacity,transform] duration-700 ${active < 0 ? "opacity-100" : "pointer-events-none -translate-y-6 opacity-0"}`}>
            <p className="t-eyebrow text-white/60">{n.eyebrow}</p>
            <h2 className="t-giant mt-5 max-w-[16ch]">{heading}</h2>
            <p className="mt-10 flex items-center gap-2 text-[14px] text-white/60"><ArrowDown size={16} className="night-bob" />{n.hint}</p>
          </div>

          {/* Chapters: copy switches sides so the scene is never covered */}
          {n.chapters.map((c, i) => {
            const end = i % 2 === 1;
            const state = i === active ? "opacity-100 translate-y-0" : i < active ? "opacity-0 -translate-y-6" : "opacity-0 translate-y-8";
            return (
              <div key={c.h} className={`pointer-events-none absolute inset-x-4 bottom-[104px] sm:inset-x-6 lg:top-0 lg:bottom-0 lg:flex lg:w-[42%] lg:items-center ${end ? "lg:start-auto lg:end-6" : "lg:start-6 lg:end-auto"}`}>
                <div className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${state}`} aria-hidden={i !== active}>
                  <p className="tnum t-eyebrow text-white/60">{times[i]} · {String(i + 1).padStart(2, "0")}/{String(CH).padStart(2, "0")}</p>
                  <h3 className="mt-3 text-[30px] font-semibold leading-[1.05] tracking-[-0.03em] [text-wrap:balance] lg:text-[52px]">{c.h}</h3>
                  <p className="mt-4 max-w-[40ch] text-[16px] leading-relaxed text-white/75 lg:text-[19px]">{c.t}</p>
                </div>
              </div>
            );
          })}

          {/* Product moments: rise, settle, then step back */}
          {cards.map((cd, i) => {
            const end = i % 2 === 0;
            const state = i === active ? "opacity-100 translate-y-0 scale-100" : i < active ? "opacity-0 -translate-y-8 scale-[.96]" : "opacity-0 translate-y-12 scale-[.96]";
            return (
              <div key={i} aria-hidden className={`pointer-events-none absolute inset-x-4 top-[150px] flex justify-center sm:inset-x-6 lg:inset-y-0 lg:top-0 lg:flex lg:w-[46%] lg:items-center ${end ? "lg:start-auto lg:end-6" : "lg:start-6 lg:end-auto"}`}>
                <div className={`w-full max-w-[400px] origin-top transition-[opacity,transform] duration-700 ease-[cubic-bezier(.16,1,.3,1)] max-lg:scale-[.86] lg:max-w-[440px] ${state}`}>{cd}</div>
              </div>
            );
          })}

          {/* Rail: inks itself through the night; each moment is a stop you can jump to */}
          <div className="absolute inset-x-4 bottom-6 sm:inset-x-6 lg:bottom-10">
            <div className="relative h-px bg-white/20">
              <span ref={fill} className="absolute inset-0 origin-left scale-x-0 bg-white rtl:origin-right" />
            </div>
            <ol className="relative -mt-[5px] flex justify-between">
              {times.map((tm, i) => (
                <li key={i} className="flex flex-col items-center first:items-start last:items-end">
                  <button type="button" onClick={() => jump(i)} aria-label={`${tm}: ${n.chapters[i].h}`} className="group flex min-h-11 flex-col items-center gap-2">
                    <span className={`size-[9px] rounded-full transition-colors ${i <= active ? "bg-white" : "bg-white/30 group-hover:bg-white/60"}`} />
                    <span className={`tnum text-[12px] transition-colors ${i === active ? "text-white" : "max-sm:hidden text-white/45 group-hover:text-white/80"}`}>{tm}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- The six product moments, drawn in real UI ---------- */

function Panel({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <div className={`rounded-[22px] p-5 shadow-[0_40px_100px_-30px_rgb(0_0_0/0.9)] ${dark ? "border border-white/15 bg-[#121214]/90 text-white backdrop-blur-xl" : "bg-white text-[#1d1d1f]"}`}>{children}</div>;
}

function EnquiryCard({ n, card }: { n: Props["n"]; card: Props["card"] }) {
  return (
    <Panel>
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-[#e8f1f3] text-[14px] font-semibold text-[#006b7d]">{card.initials}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">{card.lead}</p>
          <p className="text-[12.5px] text-[#6e6e73]">{n.enquiry.source}</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-[#fdeee6] px-2.5 py-1 text-[12px] font-medium text-[#c2410c]"><Lightning size={12} weight="fill" />{n.enquiry.title}</span>
      </div>
      <dl className="mt-4 divide-y divide-[#e8e8ed] rounded-2xl bg-[#f5f5f7] px-4">
        {n.enquiry.rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2.5 text-[14px]"><dt className="text-[#6e6e73]">{k}</dt><dd className="font-medium">{v}</dd></div>
        ))}
      </dl>
    </Panel>
  );
}

function ReplyCard({ card }: { card: Props["card"] }) {
  const words = card.reply.split(" ");
  const k = words.length * 1.7;
  return (
    <Panel>
      <div className="flex items-center gap-2 text-[13px] font-medium text-[#128c4b]"><WhatsappLogo size={16} weight="fill" />WhatsApp</div>
      <div className="mt-3 space-y-2.5 rounded-2xl bg-[#f4f1ec] p-3 text-[14px] leading-[1.45]">
        <p className="me-8 w-fit rounded-2xl rounded-ss-md bg-white px-3.5 py-2.5 shadow-sm">{card.buyer}<span className="mt-1 block text-[11px] text-[#86868b]">{card.ago}</span></p>
        <p className="ms-8 rounded-2xl rounded-se-md bg-[#d9fdd3] px-3.5 py-2.5 shadow-sm">
          {words.map((w, i) => (
            <span key={i} style={{ opacity: `clamp(0.08, calc(var(--lp, 1) * ${k.toFixed(1)} - ${i}), 1)` } as CSSProperties}>{w} </span>
          ))}
          <span className="mt-1 flex items-center gap-1 text-[11px] text-[#3b6e4b]"><Sparkle size={11} weight="fill" />{card.ai}</span>
        </p>
      </div>
    </Panel>
  );
}

function ScoreCard({ card, scoreRef }: { card: Props["card"]; scoreRef: React.RefObject<HTMLSpanElement | null> }) {
  const C = 2 * Math.PI * 52;
  const grow = "min(1, var(--lp, 1) * 1.6)";
  return (
    <Panel dark>
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-white/60">{card.score}</span>
        <span className="rounded-full bg-[#ff7a45]/15 px-2.5 py-0.5 text-[12px] font-medium text-[#ff9a6e]">{card.hot}</span>
      </div>
      <div className="mt-3 flex items-center gap-6">
        <div className="relative size-[124px] shrink-0">
          <svg viewBox="0 0 124 124" className="size-full -rotate-90">
            <circle cx="62" cy="62" r="52" fill="none" stroke="rgb(255 255 255 / .1)" strokeWidth="10" />
            <circle cx="62" cy="62" r="52" fill="none" stroke="#ff7a45" strokeWidth="10" strokeLinecap="round" strokeDasharray={C}
              style={{ strokeDashoffset: `calc(${C.toFixed(1)}px - ${(C * 0.87).toFixed(1)}px * ${grow})` } as CSSProperties} />
          </svg>
          <span ref={scoreRef} className="tnum absolute inset-0 grid place-items-center text-[38px] font-semibold tracking-[-0.03em]">87</span>
        </div>
        <ul className="flex-1 space-y-3">
          {card.signals.map(([label, v]) => (
            <li key={label} className="text-[12.5px] text-white/70">
              <span className="flex justify-between"><span>{label}</span><span className="tnum">{v}</span></span>
              <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full origin-left rounded-full bg-[#ff7a45] rtl:origin-right" style={{ width: `${v}%`, transform: `scaleX(${grow})` } as CSSProperties} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

function RouteCard({ n }: { n: Props["n"] }) {
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold">{n.route.title}</p>
        <p className="text-[12px] text-[#6e6e73]">{n.route.why}</p>
      </div>
      <ul className="mt-3 space-y-2">
        {n.route.agents.map(([name, meta], i) => (
          <li key={name} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${i === 0 ? "bg-[#e3f2f4] ring-1 ring-[#006b7d]/30" : "bg-[#f5f5f7] opacity-60"}`}>
            <span className="grid size-9 place-items-center rounded-full bg-white text-[13px] font-semibold text-[#1d1d1f]">{name.split(" ").map((x) => x[0]).join("")}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">{name}</p>
              <p className="truncate text-[12px] text-[#6e6e73]">{meta}</p>
            </div>
            {i === 0 && <CheckCircle size={22} weight="fill" className="text-[#006b7d]" style={{ opacity: "clamp(0, calc((var(--lp, 1) - .25) * 5), 1)" } as CSSProperties} />}
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-center gap-2 text-[12.5px] text-[#128c4b]" style={{ opacity: "clamp(0, calc((var(--lp, 1) - .4) * 5), 1)" } as CSSProperties}>
        <WhatsappLogo size={15} weight="fill" />{n.route.alert}
      </p>
    </Panel>
  );
}

function LateCard({ n }: { n: Props["n"] }) {
  return (
    <Panel>
      <div className="space-y-2.5 rounded-2xl bg-[#f4f1ec] p-3 text-[14px] leading-[1.45]">
        <p className="me-8 w-fit rounded-2xl rounded-ss-md bg-white px-3.5 py-2.5 shadow-sm">{n.late.buyer}<span className="mt-1 block text-[11px] text-[#86868b]">2:10</span></p>
        <p className="ms-8 rounded-2xl rounded-se-md bg-[#d9fdd3] px-3.5 py-2.5 shadow-sm">{n.late.reply}</p>
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-[#d2d2d7] px-3.5 py-3">
        <MoonStars size={22} className="shrink-0 text-[#3f6b8a]" />
        <div>
          <p className="text-[14px] font-medium">{n.late.planned}</p>
          <p className="text-[12.5px] text-[#6e6e73]">{n.late.when}</p>
        </div>
      </div>
    </Panel>
  );
}

function BookedCard({ n }: { n: Props["n"] }) {
  return (
    <Panel>
      <div className="flex items-start gap-4">
        <div className="w-[76px] shrink-0 overflow-hidden rounded-2xl border border-[#e8e8ed] text-center">
          <p className="bg-[#c2410c] py-1 text-[11px] font-semibold uppercase tracking-wide text-white">{n.booked.day}</p>
          <p className="tnum py-2 text-[20px] font-semibold leading-none">{n.booked.time}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[16px] font-semibold"><CalendarCheck size={18} weight="fill" className="text-[#1f8a4c]" />{n.booked.title}</p>
          <p className="mt-1 text-[14px]">{n.booked.who}</p>
          <p className="text-[13px] text-[#6e6e73]">{n.booked.where}</p>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 rounded-2xl bg-[#e6f4ec] px-3.5 py-2.5 text-[13px] text-[#1f8a4c]"><CheckCircle size={16} weight="fill" />{n.booked.inbox}</p>
    </Panel>
  );
}
