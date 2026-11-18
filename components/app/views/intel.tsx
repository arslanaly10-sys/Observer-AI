"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Lightning, Microphone, PhoneDisconnect, ShieldCheck, NotePencil, Target, Check, Phone, WhatsappLogo, ChatText, Robot, UserPlus, Clock, CheckCircle } from "@phosphor-icons/react";
import { weights, intentThreads, PROPERTY } from "@/lib/data";
import { img } from "@/lib/img";
import { useStore } from "../store";
import { scoreLead, extractIntent, rankActions, fmtAED } from "@/lib/engine";
import { useT } from "../i18n";
import { Card, CardHead, PageHead, Stat, Stats, Monogram, ScoreBar, Btn, Meter, Pill, Dot, TempBadge, cx } from "../ui";

export function Scoring() {
  const { t } = useT();
  const { leads } = useStore();
  const [w, setW] = useState(() => Object.fromEntries(weights.map((x) => [x.label, x.pts])) as Record<string, number>);
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  const [queue, setQueue] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setQueue((q) => (q + 1) % 101), 60);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      <PageHead title="Lead scoring" sub="Seven signals, weighted. Every score shows its working, so your agents can trust it." />
      <Stats>
        <Stat label="Model" value="v2.4" note="91.3% accurate on last quarter’s closes" />
        <Stat label="Scored today" value="184" delta="+22" note="new" />
        <Stat label="High intent" value="47" note="25.5% of today’s leads" />
        <Stat label="Average score" value="78" note="up from 61 last month" />
      </Stats>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHead title="What the score listens to" sub="Drag a weight to see how it changes the ranking." />
          <ul className="space-y-4">
            {weights.map((x) => (
              <li key={x.label}>
                <div className="mb-1.5 flex justify-between text-[15px]">
                  <label htmlFor={`w-${x.label}`}>{t(x.label)}</label>
                  <span className="tnum text-ink-2">{Math.round((w[x.label] / total) * 100)}%</span>
                </div>
                <input id={`w-${x.label}`} type="range" min={0} max={40} value={w[x.label]} onChange={(e) => setW({ ...w, [x.label]: +e.target.value })} className="w-full accent-[var(--creek)]" />
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHead title="Ranking with these weights" />
          <ul className="divide-y divide-hairline-soft">
            {leads
              .map((l) => {
                const s = scoreLead(l);
                const weighted = s.parts.reduce((a, p) => a + (p.pts / p.max) * (w[p.label] ?? 0), 0);
                return { l, score: Math.round((weighted / Math.max(1, total)) * 100) };
              })
              .sort((a, b) => b.score - a.score)
              .map(({ l, score }, i) => (
                <li key={l.id} className="flex items-center gap-3 py-2.5">
                  <span className="tnum w-5 text-ink-3">{i + 1}</span>
                  <Monogram name={l.name} size={30} />
                  <span className="flex-1 truncate">{l.name}</span>
                  <ScoreBar score={Math.min(100, score)} />
                </li>
              ))}
          </ul>
          <div className="mt-5 rounded-[14px] bg-pearl p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-creek-soft text-creek"><Target size={16} /></span>
              <p className="flex-1 text-[15px]">{t("Scoring new lead #248 from Facebook")}</p>
              <span className="tnum text-[13px] text-ink-2">{queue}%</span>
            </div>
            <Meter value={queue} className="mt-3" />
          </div>
        </Card>
      </div>
    </>
  );
}

export function Intent() {
  const { t } = useT();
  const [i, setI] = useState(0);
  const th = intentThreads[i];
  const r = extractIntent(th.msgs);
  return (
    <>
      <PageHead title="Intent detection" sub="Observer reads each conversation and highlights the exact words that tell you who’s serious." />
      <Stats>
        <Stat label="Buyers found" value="163" />
        <Stat label="Sellers found" value="84" note="34% of leads" />
        <Stat label="High urgency" value="51" note="act today" />
        <Stat label="Languages" value="EN · AR" note="WhatsApp and SMS" />
      </Stats>
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <Card pad={false} className="p-2">
          <ul>
            {intentThreads.map((x, k) => (
              <li key={x.name}>
                <button onClick={() => setI(k)} aria-pressed={i === k} className={cx("flex w-full items-center gap-3 rounded-[12px] p-3 text-start", i === k ? "bg-parchment" : "hover:bg-pearl")}>
                  <Monogram name={x.name} size={34} />
                  <span className="flex-1 truncate font-medium">{x.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHead title="Conversation" />
            <div className="space-y-3">
              {th.msgs.map((m, k) => (
                <p key={k} className={cx("max-w-[85%] rounded-[16px] px-4 py-2.5 text-[15px] leading-snug", m.dir === "in" ? "bg-parchment" : "ms-auto bg-creek text-on-creek")}>
                  {m.dir === "in" ? <Highlight text={m.text} words={r.hits.map((h) => h.evidence)} /> : m.text}
                </p>
              ))}
            </div>
          </Card>
          <Card>
            <CardHead title="What Observer heard" />
            <dl className="grid grid-cols-3 gap-3 text-center">
              {[["Intent", t(r.primary)], ["Urgency", t(r.urgency)], ["Confidence", `${r.confidence}%`]].map(([k, v]) => (
                <div key={k} className="rounded-[14px] bg-pearl p-3">
                  <dt className="t-fine text-ink-2">{t(k)}</dt>
                  <dd className="mt-1 text-[19px] font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-5 text-[14px] font-semibold">{t("Signals")}</h3>
            <ul className="mt-2 space-y-2">
              {r.hits.map((h) => (
                <li key={h.key} className="flex items-center justify-between gap-3 text-[14px]">
                  <Pill tone={h.key === "researching" ? "cold" : h.key === "urgent" ? "hot" : "creek"}>{t(h.label)}</Pill>
                  <span className="truncate text-ink-2">“{h.evidence}”</span>
                </li>
              ))}
            </ul>
            {r.budget && <p className="t-caption mt-4 text-ink-2">{t("Budget mentioned")}: <b className="text-ink">{r.budget}</b></p>}
          </Card>
        </div>
      </div>
    </>
  );
}

function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const rx = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return <>{text.split(rx).map((p, i) => (words.some((w) => w.toLowerCase() === p.toLowerCase()) ? <mark key={i} className="rounded bg-creek-soft px-0.5 text-creek">{p}</mark> : p))}</>;
}

const FADE: Record<string, string> = { hot: "Act within 30 minutes", warm: "Act within 4 hours", cold: "Act within 2 days" };
const ACT_ICON: Record<string, typeof Lightning> = { Call: Phone, WhatsApp: WhatsappLogo, SMS: ChatText, "AI call": Robot, Assign: UserPlus };

/**
 * Next best action, led by a hero (Supahero patterns, as on the marketing site: one photograph,
 * a direct headline, one primary button, a live product card and a slim stat strip).
 * The hero is always the most valuable undone action; finishing or postponing it brings in the next.
 */
export function NextBestAction() {
  const { t, rtl } = useT();
  const { leads, toast } = useStore();
  const ranked = rankActions(leads);
  const [done, setDone] = useState<string[]>([]);
  const [later, setLater] = useState<string[]>([]);
  const order = [...ranked.filter((a) => !later.includes(a.lead)), ...later.map((n) => ranked.find((a) => a.lead === n)!).filter(Boolean)];
  const open = order.filter((a) => !done.includes(a.lead));
  const focus = open[0];
  const lead = focus && leads.find((l) => l.name === focus.lead);
  const home = lead ? PROPERTY[lead.area] : undefined;
  const verb = (c: string) => t(c === "Call" ? "Call" : c === "Assign" ? "Assign" : "Send");
  const finish = (name: string, action: string) => { toast(`${t(action)} · ${name}`); setDone((d) => (d.includes(name) ? d : [...d, name])); };
  const postpone = (name: string) => { setLater((l) => [...l.filter((x) => x !== name), name]); toast(t("Moved to the end of the list")); };
  const FocusIcon = focus ? ACT_ICON[focus.channel] ?? Lightning : Check;

  return (
    <>
      <PageHead title="Next best action" sub="Ranked by what each lead is worth, how likely they are to close, and how fast that chance is fading." />

      {/* Hero: the one thing to do now */}
      <section aria-live="polite" className="relative isolate mb-6 overflow-hidden rounded-[28px] bg-black text-white">
        {home && (
          <div key={focus!.lead} className="nba-fade absolute inset-0 -z-10">
            <Image src={img(home.photo, 1600)} alt="" fill sizes="(min-width:1024px) 1100px, 100vw" className="object-cover opacity-55" />
          </div>
        )}
        <div aria-hidden className={cx("absolute inset-0 -z-10", rtl ? "bg-gradient-to-l" : "bg-gradient-to-r", "from-black via-black/75 to-black/25")} />

        {focus && lead ? (
          <div key={focus.lead} className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_0.75fr] lg:p-10">
            <div className="nba-rise">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[13px] text-white/80 backdrop-blur">
                <span className="pulse-dot size-1.5 rounded-full bg-[#ff7a45]" />{t("Do this first")} · <span className="tnum">{ranked.length - open.length + 1}/{ranked.length}</span>
              </p>
              <h2 className="mt-5 text-[36px] font-semibold leading-[1.02] tracking-[-0.035em] [text-wrap:balance] sm:text-[48px] lg:text-[56px]">{t(focus.action)}.</h2>
              <p className="mt-2 text-[22px] font-medium tracking-[-0.02em] text-white/70 sm:text-[26px]">{focus.lead}</p>
              <p className="mt-4 max-w-[46ch] text-[16px] text-white/75">{t(focus.why)}</p>

              <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-4">
                <div>
                  <dt className="t-fine text-white/55">{t("Commission at stake")}</dt>
                  <dd className="tnum mt-1 text-[28px] font-semibold leading-none tracking-[-0.02em]">{fmtAED(focus.commission * 1e6)}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <Ring value={focus.closeProb} />
                  <div>
                    <dt className="t-fine text-white/55">{t("chance of closing")}</dt>
                    <dd className="tnum mt-1 text-[28px] font-semibold leading-none tracking-[-0.02em]">{focus.closeProb}%</dd>
                  </div>
                </div>
                <div>
                  <dt className="sr-only">{t("Timeframe")}</dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[13px] text-white/85"><Clock size={14} />{t(FADE[focus.temp])}</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => finish(focus.lead, focus.action)} className="btn bg-white !px-6 text-[#1d1d1f] hover:bg-white/90">
                  <FocusIcon size={18} weight="fill" />{verb(focus.channel)} {focus.lead.split(" ")[0]}
                </button>
                <button type="button" onClick={() => postpone(focus.lead)} className="btn btn-ghost btn-on-dark !px-5"><span>{t("Later")}</span></button>
              </div>
            </div>

            {/* The lead, as a product card */}
            <div className="nba-card rounded-[22px] bg-white p-5 text-[#1d1d1f] shadow-[0_40px_100px_-30px_rgb(0_0_0/0.9)]">
              <div className="flex items-center gap-3">
                <Monogram name={lead.name} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-semibold">{lead.name}</p>
                  <p className="tnum truncate text-[13px] text-[#6e6e73]" dir="ltr">{lead.phone} · {t(lead.source)}</p>
                </div>
                <TempBadge temp={lead.temp} />
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-[14px] bg-[#f5f5f7] px-3.5 py-3">
                <span className="text-[13px] text-[#6e6e73]">{t("Score")}</span>
                <ScoreBar score={lead.score} className="flex-1" />
              </div>
              <dl className="mt-3 divide-y divide-[#e8e8ed] text-[14px]">
                {([["Wants", home ? `${t(home.type)} · ${t(home.label)}` : t(lead.area)], ["Budget", lead.budget], ["Timeframe", t(lead.timeframe)], ["Financing", t(lead.financing)], ["Status", t(lead.status)], ["Last contact", `${lead.lastContact}`]] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-[#6e6e73]">{t(k)}</dt><dd className="truncate text-end font-medium"><bdi>{v}</bdi></dd></div>
                ))}
              </dl>
            </div>
          </div>
        ) : (
          <div className="nba-rise flex flex-col items-start gap-4 p-8 sm:p-10">
            <CheckCircle size={44} weight="fill" className="text-[#3ecf7a]" />
            <h2 className="text-[40px] font-semibold leading-none tracking-[-0.035em]">{t("All clear")}</h2>
            <p className="max-w-[46ch] text-white/75">{t("Nothing urgent is left. Observer is following up with the rest.")}</p>
            <button type="button" onClick={() => { setDone([]); setLater([]); }} className="btn btn-ghost btn-on-dark !px-5"><span>{t("Start over")}</span></button>
          </div>
        )}

        {/* Stat strip */}
        <dl className="grid grid-cols-2 border-t border-white/10 text-[14px] sm:grid-cols-4">
          {([["12", "do within 30 minutes"], ["28", "scheduled by Observer"], [`${41 + done.length}`, "done today"], ["94%", "confidence"]] as [string, string][]).map(([n, l]) => (
            <div key={l} className="flex items-baseline gap-2 px-6 py-4 sm:px-8 lg:px-10">
              <dt className="sr-only">{t(l)}</dt>
              <dd className="tnum text-[20px] font-semibold">{n}</dd>
              <span aria-hidden className="text-white/60">{t(l)}</span>
            </div>
          ))}
        </dl>
      </section>

      {/* Up next */}
      {open.length > 1 && (
        <Card>
          <CardHead title="Up next" />
          <ol className="divide-y divide-hairline-soft">
            {open.slice(1).map((a, i) => {
              const Icon = ACT_ICON[a.channel] ?? Lightning;
              return (
                <li key={a.lead} className="flex flex-wrap items-center gap-4 py-3.5">
                  <span className="tnum w-6 text-[15px] text-ink-3">{ranked.length - open.length + i + 2}</span>
                  <span className="flex size-10 items-center justify-center rounded-full bg-creek-soft text-creek"><Icon size={18} /></span>
                  <div className="min-w-[200px] flex-1">
                    <p className="font-medium">{t(a.action)} <span className="text-ink-2">· {a.lead}</span></p>
                    <p className="t-caption text-ink-2">{t(a.why)}</p>
                  </div>
                  <div className="hidden text-end md:block">
                    <p className="tnum text-[15px] font-semibold">{fmtAED(a.commission * 1e6)}</p>
                    <p className="t-fine text-ink-2">{t("commission")} · {a.closeProb}% {t("to close")}</p>
                  </div>
                  <TempBadge temp={a.temp} />
                  <Btn variant="secondary" onClick={() => finish(a.lead, a.action)}>{verb(a.channel)}</Btn>
                </li>
              );
            })}
          </ol>
        </Card>
      )}

      {/* Done */}
      {done.length > 0 && (
        <Card className="mt-6">
          <CardHead title="Done today" />
          <ul className="divide-y divide-hairline-soft">
            {done.map((n) => {
              const a = ranked.find((x) => x.lead === n)!;
              return (
                <li key={n} className="flex items-center gap-3 py-3 text-ink-2">
                  <CheckCircle size={20} weight="fill" className="text-ok" />
                  <span className="flex-1">{t(a.action)} · {n}</span>
                  <Btn variant="quiet" onClick={() => setDone((d) => d.filter((x) => x !== n))}>{t("Undo")}</Btn>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </>
  );
}

/** Close probability as a small ring. */
function Ring({ value }: { value: number }) {
  const C = 2 * Math.PI * 16;
  return (
    <svg viewBox="0 0 40 40" className="size-10 -rotate-90" aria-hidden>
      <circle cx="20" cy="20" r="16" fill="none" stroke="rgb(255 255 255 / .15)" strokeWidth="4" />
      <circle cx="20" cy="20" r="16" fill="none" stroke="#ff7a45" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(C * value) / 100} ${C}`} className="nba-ring" />
    </svg>
  );
}

const whispers = [
  "Ask what matters most to the family about the garden. He mentioned three children.",
  "He’s a cash buyer. Offer to hold Thursday 11am before someone else takes it.",
  "If price comes up: the comparable on Sidra sold for AED 4.35M last month.",
];
const transcript = [
  { me: false, text: "We liked the photos, but the price feels high for the size." },
  { me: true, text: "That’s fair. It’s 5,200 square feet with a private pool, and the last similar home on this street went for 4.35." },
  { me: false, text: "Okay. My wife wants to see it with the kids first." },
  { me: true, text: "Of course. Thursday at 11 works for a family visit. Shall I hold it?" },
];

export function LiveCall() {
  const { t } = useT();
  const { toast } = useStore();
  const [muted, setMuted] = useState(false);
  const [sec, setSec] = useState(134);
  const [k, setK] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSec((s) => s + 1), 1000);
    const w = setInterval(() => setK((x) => (x + 1) % whispers.length), 6000);
    return () => { clearInterval(id); clearInterval(w); };
  }, []);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0"), ss = String(sec % 60).padStart(2, "0");
  return (
    <>
      <PageHead title="Live call assistant" sub="Observer listens alongside your agent, suggests the next line, and writes the notes." />
      <Stats>
        <Stat label="Call time" value={`${mm}:${ss}`} />
        <Stat label="Mood" value={t("Positive")} note="buyer engaged" />
        <Stat label="Chance to close" value="73%" delta="+12%" note="this call" />
        <Stat label="Talk ratio" value="38 : 62" note="agent : buyer, about right" />
      </Stats>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-[22px] bg-tile p-6 text-white">
          <div className="flex items-center gap-4">
            <Monogram name="Ahmed Al Khalidi" size={52} />
            <div className="flex-1">
              <p className="text-[19px] font-semibold">Ahmed Al Khalidi</p>
              <p className="text-[14px] text-white/60">{t("Score 87 · cash buyer · 5BR in Dubai Hills · AED 4.2M")}</p>
            </div>
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[13px]"><span className="pulse-dot size-2 rounded-full bg-[#ff6b5b]" />{t("Recording")}</span>
          </div>
          <div className="mt-6 flex h-14 items-center gap-[3px]" aria-hidden>
            {Array.from({ length: 64 }).map((_, i) => (
              <span key={i} className="flex-1 rounded-full bg-white/35" style={{ height: `${18 + Math.abs(Math.sin(i * 0.7 + sec)) * 70}%`, transition: "height .5s ease" }} />
            ))}
          </div>
          <div className="mt-6 rounded-[16px] bg-white/[0.07] p-4">
            <p className="flex items-center gap-2 text-[13px] text-[#6bd3df]"><Lightning size={14} weight="fill" /> {t("Say this next")}</p>
            <p key={k} className="enter-rise mt-2 text-[19px] leading-snug">{t(whispers[k])}</p>
          </div>
          <div className="mt-6 flex gap-2">
            <button onClick={() => { setMuted((m) => !m); }} aria-pressed={muted} className="flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-[15px]"><Microphone size={18} weight={muted ? "fill" : "regular"} /> {t(muted ? "Unmute" : "Mute")}</button>
            <button onClick={() => toast(t("Call ended. Notes saved to Ahmed’s record."))} className="flex h-11 items-center gap-2 rounded-full bg-[#e5484d] px-5 text-[15px] font-medium"><PhoneDisconnect size={18} /> {t("End call")}</button>
          </div>
        </div>
        <div className="grid gap-5">
          <Card>
            <CardHead title="Objection" aside={<ShieldCheck size={18} className="text-creek" />} />
            <p className="text-[15px]"><b className="font-medium">“{t("The price feels high for the size.")}”</b></p>
            <p className="mt-2 text-[15px] text-ink-2">{t("Point to the plot and the pool, then the street comparable at AED 4.35M. Don’t discount yet. He hasn’t seen it in person.")}</p>
          </Card>
          <Card>
            <CardHead title="Notes Observer is writing" aside={<span className="t-caption flex items-center gap-1.5 text-ok"><Dot live />{t("Saving")}</span>} />
            <ul className="space-y-2 text-[15px]">
              {["Family of five, three children", "Wants a garden and a private pool", "Wife to view: Thursday 11am", "Cash, no mortgage needed"].map((n) => (
                <li key={n} className="flex items-start gap-2"><NotePencil size={16} className="mt-1 shrink-0 text-ink-3" />{t(n)}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
      <Card className="mt-5">
        <CardHead title="Transcript" />
        <ul className="space-y-3">
          {transcript.map((m, i) => (
            <li key={i} className="flex gap-3 text-[15px]">
              <span className={cx("w-16 shrink-0 font-medium", m.me ? "text-creek" : "text-ink-2")}>{m.me ? t("Layla") : "Ahmed"}</span>
              <span>{t(m.text)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
