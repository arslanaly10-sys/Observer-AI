"use client";
import { useEffect, useRef, useState } from "react";
import { Sparkle, Check, PencilSimple, X, Play, Pause, Lightning, FlowArrow, CircleNotch, CheckCircle, Phone, ChatCircleText, LockSimple, ArrowsSplit, Tag, ClockCounterClockwise } from "@phosphor-icons/react";
import { useT } from "../i18n";
import { useStore } from "../store";
import { Card, CardHead, PageHead, Stat, Stats, Pill, Btn, Segmented, Dot, Meter, cx } from "../ui";
import { aiEvents, automations, calls, ledger, kpi, type AiKind } from "@/lib/demo/group";

const kindIcon: Record<AiKind, typeof Sparkle> = { reply: ChatCircleText, hold: LockSimple, route: ArrowsSplit, call: Phone, price: Tag, followup: ClockCounterClockwise };
const kindLabel: Record<AiKind, string> = { reply: "Replies", hold: "Unit holds", route: "Routing", call: "Calls", price: "Price concessions", followup: "Follow-ups" };
type Mode = "auto" | "ask" | "off";

const pool = [
  { kind: "reply" as AiKind, text: "Replied in Hindi with two Diamondz studios and the 1% monthly plan", client: "Arjun Mehta" },
  { kind: "route" as AiKind, text: "Routed a Property Finder enquiry for Nawafir Pearl to Ahmed Tariq (Abu Dhabi)", client: "Sara Al Blooshi" },
  { kind: "followup" as AiKind, text: "Sent the day-3 follow-up with the Harbour One floor plans", client: "James Whitaker" },
  { kind: "reply" as AiKind, text: "Answered a service-charge question for Saadiyat Lagoons in Arabic", client: "Mohammed Al Shamsi" },
  { kind: "call" as AiKind, text: "Returned a missed call in English and confirmed Saturday's viewing", client: "Elena Rossi" },
];

/** Every AI action, live, with people deciding the ones that matter. */
export function AiActivity() {
  const { t } = useT();
  const { toast } = useStore();
  const [feed, setFeed] = useState(aiEvents.map((e) => ({ ...e, state: e.approval ? "pending" : "done" as string })));
  const [modes, setModes] = useState<Record<AiKind, Mode>>({ reply: "auto", hold: "ask", price: "ask", route: "auto", call: "auto", followup: "auto" });
  const n = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      const p = pool[n.current++ % pool.length];
      setFeed((f) => [{ id: `live${n.current}`, kind: p.kind, text: p.text, client: p.client, time: "Just now", approval: false, risk: "low" as const, state: "done" }, ...f].slice(0, 14));
    }, 7000);
    return () => clearInterval(id);
  }, []);
  const decide = (id: string, state: string, msg: string) => { setFeed((f) => f.map((e) => (e.id === id ? { ...e, state } : e))); toast(t(msg)); };
  const pending = feed.filter((e) => e.state === "pending").length;

  return (
    <>
      <PageHead title="AI activity" sub="What the AI did in the last hour, and what it is waiting for you to decide." />
      <Stats>
        <Stat label="Actions today" value="3,148" note="replies, routing, calls, follow-ups" />
        <Stat label="Waiting for a person" value={pending} note="holds, prices, VIP clients" />
        <Stat label="Approved as drafted" value="96.8%" note="this month" />
        <Stat label="Overridden" value={ledger.overrides} note={`of ${ledger.approvals.toLocaleString("en")} approvals`} />
      </Stats>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHead title="Live" aside={<span className="t-caption flex items-center gap-1.5 text-ink-2"><Dot live />{t("Updating")}</span>} />
          <ol className="divide-y divide-hairline-soft">
            {feed.map((e) => {
              const I = kindIcon[e.kind];
              return (
                <li key={e.id} className="nba-rise flex gap-3 py-3.5">
                  <span className={cx("grid size-9 shrink-0 place-items-center", e.state === "pending" ? "bg-warm-soft text-warm" : "bg-creek-soft text-creek")}><I size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] leading-snug">{t(e.text)}</p>
                    <p className="t-caption mt-0.5 text-ink-2"><span className="pii">{t(e.client)}</span> · {t(e.time)} · {t(kindLabel[e.kind])}</p>
                    {e.state === "pending" && (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <Btn onClick={() => decide(e.id, "approved", "Approved. The AI is carrying it out.")}><Check size={15} />{t("Approve")}</Btn>
                        <Btn variant="secondary" onClick={() => decide(e.id, "edited", "Opened for editing, with the draft kept.")}><PencilSimple size={15} />{t("Edit")}</Btn>
                        <Btn variant="quiet" onClick={() => decide(e.id, "overridden", "Overridden. The client hears from a person instead.")}><X size={15} />{t("Override")}</Btn>
                      </div>
                    )}
                    {e.state !== "pending" && e.approval && <p className="t-caption mt-1 font-medium text-ok">{t(e.state === "approved" ? "Approved by you" : e.state === "edited" ? "Edited by you" : "Overridden by you")}</p>}
                  </div>
                  {e.state === "pending" && <Pill tone={e.risk === "high" ? "hot" : "warm"}>{t("Needs you")}</Pill>}
                </li>
              );
            })}
          </ol>
        </Card>
        <Card>
          <CardHead title="What the AI may do alone" sub="Set per kind of action. Changes apply immediately and are logged." />
          <ul className="space-y-4">
            {(Object.keys(modes) as AiKind[]).map((k) => (
              <li key={k}>
                <p className="mb-1.5 text-[14px] font-medium">{t(kindLabel[k])}</p>
                <Segmented label={kindLabel[k]} value={modes[k]} onChange={(v) => { setModes((m) => ({ ...m, [k]: v })); toast(`${t(kindLabel[k])}: ${t(v === "auto" ? "Automatic" : v === "ask" ? "Ask first" : "Off")}`); }} options={[{ value: "auto", label: "Automatic" }, { value: "ask", label: "Ask first" }, { value: "off", label: "Off" }]} />
              </li>
            ))}
          </ul>
          <p className="t-fine mt-5 text-ink-3">{t("VIP clients and budgets above AED 15M always go to a person first, whatever is set here.")}</p>
        </Card>
      </div>
    </>
  );
}

/** Visual workflows with a test run that lights up each step. */
export function Automations() {
  const { t } = useT();
  const { toast } = useStore();
  const [sel, setSel] = useState(0);
  const [active, setActive] = useState(automations.map((a) => a.active));
  const [run, setRun] = useState(-1);
  const a = automations[sel];
  useEffect(() => {
    if (run < 0 || run > a.steps.length) return;
    const id = setTimeout(() => (run === a.steps.length ? (toast(t("Test run complete. Nothing was sent to a real client.")), setRun(-1)) : setRun(run + 1)), 650);
    return () => clearTimeout(id);
  }, [run, a.steps.length, toast, t]);
  return (
    <>
      <PageHead title="Automations" sub="Workflows the AI runs on its own, built from triggers, steps and the limits you set." actions={<Btn onClick={() => toast(t("New automation drafted from a template"))}><FlowArrow size={16} />{t("New automation")}</Btn>} />
      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <Card pad={false} className="p-2">
          <ul>
            {automations.map((x, i) => (
              <li key={x.name}>
                <button onClick={() => { setSel(i); setRun(-1); }} aria-pressed={i === sel} className={cx("w-full p-3 text-start", i === sel ? "bg-parchment" : "hover:bg-pearl")}>
                  <span className="flex items-center justify-between gap-2"><span className="font-medium">{t(x.name)}</span><Dot tone={active[i] ? "ok" : "cold"} /></span>
                  <span className="t-caption tnum mt-0.5 block text-ink-2">{x.runs.toLocaleString("en")} {t("runs")} · {x.success}% {t("completed")}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="t-eyebrow !mb-1">{t("Workflow")}</p>
              <h2 className="lux-serif text-[30px] leading-tight">{t(a.name)}</h2>
            </div>
            <div className="flex gap-2">
              <Btn variant="secondary" onClick={() => setActive((v) => v.map((x, i) => (i === sel ? !x : x)))}>{active[sel] ? t("Pause") : t("Turn on")}</Btn>
              <Btn onClick={() => setRun(0)}>{run >= 0 ? <CircleNotch size={16} className="animate-spin" /> : <Play size={16} weight="fill" />}{t("Test run")}</Btn>
            </div>
          </div>
          <ol className="mt-6 grid gap-0">
            <li className="flex gap-4">
              <span className="flex flex-col items-center"><span className="grid size-10 place-items-center bg-ink text-canvas"><Lightning size={18} weight="fill" /></span><span className="w-px flex-1 bg-hairline" /></span>
              <div className="pb-6"><p className="t-eyebrow !mb-0.5">{t("When")}</p><p className="text-[15px]">{t(a.trigger)}</p></div>
            </li>
            {a.steps.map((s, i) => {
              const state = run < 0 ? "idle" : i < run ? "done" : i === run ? "doing" : "idle";
              return (
                <li key={s} className="flex gap-4">
                  <span className="flex flex-col items-center">
                    <span className={cx("grid size-10 place-items-center border transition-colors", state === "done" ? "border-ok bg-ok-soft text-ok" : state === "doing" ? "border-creek bg-creek-soft text-creek" : "border-hairline bg-canvas text-ink-3")}>
                      {state === "done" ? <CheckCircle size={18} weight="fill" /> : state === "doing" ? <CircleNotch size={18} className="animate-spin" /> : <span className="tnum text-[13px]">{i + 1}</span>}
                    </span>
                    {i < a.steps.length - 1 && <span className="w-px flex-1 bg-hairline" />}
                  </span>
                  <div className="pb-6"><p className="t-eyebrow !mb-0.5">{t("Then")}</p><p className="text-[15px]">{t(s)}</p></div>
                </li>
              );
            })}
          </ol>
          <div className="border-t border-hairline-soft pt-4">
            <p className="t-eyebrow">{t("Recent runs")}</p>
            <ul className="mt-2 space-y-1.5 text-[13.5px]">
              {["21:14", "21:12", "21:09", "21:07", "21:02"].map((tm, i) => (
                <li key={tm} className="flex items-center gap-3"><span className="tnum w-12 text-ink-3">{tm}</span><Dot tone={i === 3 && a.success < 99 ? "warm" : "ok"} /><span className="text-ink-2">{t(i === 3 && a.success < 99 ? "Completed after one retry" : "Completed")}</span></li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </>
  );
}

/** Voice agent recordings and the AI ledger. */
export function Voice() {
  const { t } = useT();
  const [sel, setSel] = useState(0);
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const c = calls[sel];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPos((p) => { if (p >= 100) { setPlaying(false); return 100; } return p + 1.2; }), 90);
    return () => clearInterval(id);
  }, [playing]);
  const line = Math.min(c.lines.length - 1, Math.floor((pos / 100) * c.lines.length));
  const bars = Array.from({ length: 64 }, (_, i) => 20 + Math.round(Math.abs(Math.sin(i * 1.7 + sel) * 60 + Math.cos(i * 0.6) * 18)));
  return (
    <>
      <PageHead title="Voice agent & ledger" sub="Calls the AI made and answered tonight, and an honest account of what the AI did this month." />
      <Stats>
        <Stat label="Calls tonight" value="412" note="Arabic, English, Russian, Hindi, Chinese" />
        <Stat label="Viewings booked by voice" value="57" />
        <Stat label="Handed to a person" value="9%" note="VIPs and complex questions" />
        <Stat label="Median call" value="3:04" />
      </Stats>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-4 flex flex-wrap gap-2">
            {calls.map((x, i) => (
              <button key={x.client} onClick={() => { setSel(i); setPos(0); setPlaying(false); }} aria-pressed={i === sel} className={cx("border px-3 py-2 text-start text-[13.5px]", i === sel ? "border-ink bg-parchment" : "border-hairline hover:border-ink")}>
                <span className="pii block font-medium">{x.client}</span><span className="t-caption text-ink-2">{t(x.lang)} · {x.duration} · {t(x.time)}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 bg-[#0d0c0a] p-4 text-[#efe9df]">
            <button onClick={() => { if (pos >= 100) setPos(0); setPlaying((v) => !v); }} aria-label={t(playing ? "Pause" : "Play")} className="grid size-11 shrink-0 place-items-center bg-[#cdb284] text-[#15120e]">{playing ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}</button>
            <div className="flex h-12 flex-1 items-center gap-[2px]" aria-hidden>
              {bars.map((h, i) => <span key={i} style={{ height: `${h}%` }} className={cx("flex-1", (i / bars.length) * 100 <= pos ? "bg-[#cdb284]" : "bg-white/20")} />)}
            </div>
            <span className="tnum w-12 text-end text-[13px] text-[#efe9df]/70">{c.duration}</span>
          </div>
          <ol className="mt-4 space-y-3">
            {c.lines.map(([who, text], i) => (
              <li key={i} className={cx("flex gap-3 transition-opacity", pos > 0 && i > line && "opacity-35")}>
                <span className={cx("mt-0.5 w-14 shrink-0 text-[12px] font-semibold", who === "AI" ? "text-creek" : "text-ink-2")}>{t(who === "AI" ? "AI" : "Client")}</span>
                <p className="text-[14.5px] leading-relaxed" dir="auto">{text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-center gap-2 border-t border-hairline-soft pt-3 text-[14px]"><CheckCircle size={18} weight="fill" className="text-ok" />{t(c.outcome)}</p>
          <p className="t-fine mt-2 text-ink-3">{t("Every caller hears that they are speaking to an AI assistant, and can ask for a person at any time.")}</p>
        </Card>
        <Card>
          <CardHead title="AI ledger, this month" sub="Measured, not estimated, except where marked" />
          <dl className="divide-y divide-hairline-soft">
            {([
              ["Conversations handled", ledger.conversations.toLocaleString("en")],
              ["Consultant hours saved", ledger.hoursSaved.toLocaleString("en")],
              ["Quiet leads brought back", ledger.revived.toLocaleString("en")],
              ["Bookings from revived leads", String(ledger.revivedBookings)],
              ["Sales the AI touched", `AED ${ledger.attributedM}M`],
              ["Actions approved by people", ledger.approvals.toLocaleString("en")],
              ["Actions overridden", String(ledger.overrides)],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-3"><dt className="text-ink-2">{t(k)}</dt><dd className="tnum font-semibold">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-4">
            <p className="t-caption mb-1.5 text-ink-2">{t("First replies sent by the AI")}</p>
            <Meter value={kpi.aiFirstReplies} />
            <p className="t-fine mt-1.5 text-ink-3">{kpi.aiFirstReplies}% · {t("median")} {kpi.medianReply}s · {t("hours saved valued at a consultant's loaded cost")}</p>
          </div>
        </Card>
      </div>
    </>
  );
}
