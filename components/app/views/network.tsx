"use client";
import { useMemo, useState, type FormEvent } from "react";
import { ShieldCheck, Warning, CheckCircle, UserPlus, Scales, Clock, WhatsappLogo, LockKey, ArrowsClockwise, BellRinging } from "@phosphor-icons/react";
import { useT } from "../i18n";
import { useStore } from "../store";
import { Card, CardHead, PageHead, Stat, Stats, Pill, Btn, Table, cx } from "../ui";
import { brokers, deals, group } from "@/lib/demo/group";
import { registrations as seedRegs, incoming as seedIncoming, evidence, holds as seedHolds, reporting, NOW } from "@/lib/demo/brokerdesk";
import { check, protection, requestHold, settle, deposit, PROTECTION_DAYS, HOLD_HOURS, RENEWING, type Registration, type Verdict, type UnitHolds } from "@/lib/brokers/rules";
import { field, labelCls } from "@/components/workspace/forms";
import { aed } from "./exec";

const HOUR = 3_600_000, DAY = 86_400_000;
const fmtDate = (ms: number, locale: string) => new Date(ms).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dubai" });

/** Commission tiers. Protection is the same for every agency: one rule, so nobody argues about it. */
const tiers = [
  { tier: "Platinum", rate: "4%", rule: "AED 120M+ a year" },
  { tier: "Gold", rate: "3.5%", rule: "AED 50M+ a year" },
  { tier: "Silver", rate: "3%", rule: "Registered with RERA or REGA" },
];

function VerdictLine({ v }: { v: Verdict }) {
  const { t } = useT();
  if (v.kind === "clear") return <p className="mt-1.5 flex items-start gap-1.5 text-[13.5px] text-ok"><CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0" />{t("No match on phone or email across every enquiry and registration. Ready to protect for 30 days.")}</p>;
  if (v.kind === "owned") return <p className="mt-1.5 flex items-start gap-1.5 text-[13.5px] text-hot"><Warning size={16} className="mt-0.5 shrink-0" /><span>{t("Same client already registered by")} <b className="font-medium">{t(v.owner.broker)}</b>, {t("protected for")} {v.daysLeft} {t("more days")}.</span></p>;
  return <p className="mt-1.5 flex items-start gap-1.5 text-[13.5px] text-warm"><Scales size={16} className="mt-0.5 shrink-0" /><span>{t("Dispute with")} <b className="font-medium">{t(v.owner.broker)}</b>: {t(v.reason)}</span></p>;
}

/** The developer's side: every agency, one protection rule, duplicates caught, disputes ruled on. */
export function Brokers() {
  const { t, locale } = useT();
  const { toast } = useStore();
  const [regs, setRegs] = useState<Registration[]>(seedRegs);
  const [pending, setPending] = useState<Registration[]>(seedIncoming);
  const [disputes, setDisputes] = useState<{ reg: Registration; owner: Registration; reason: string }[]>([]);
  const [nudged, setNudged] = useState<string[]>([]);

  const verdicts = useMemo(() => pending.map((r) => ({ r, v: check(r, regs, NOW) })), [pending, regs]);
  const decide = (r: Registration, v: Verdict) => {
    setPending((p) => p.filter((x) => x.id !== r.id));
    if (v.kind === "clear") { setRegs((x) => [...x, r]); toast(`${r.client} ${t("protected for 30 days")}`); }
    else if (v.kind === "owned") toast(`${t("Told")} ${t(r.broker)} ${t("the client is registered with another agency")}`);
    else { setDisputes((d) => [...d, { reg: r, owner: v.owner, reason: v.reason }]); toast(t("Sent to the dispute queue")); }
  };
  const rule = (d: (typeof disputes)[number], winner: Registration) => {
    setDisputes((x) => x.filter((y) => y.reg.id !== d.reg.id));
    setRegs((x) => [...x.filter((y) => y.id !== d.owner.id || winner.id === d.owner.id), ...(winner.id === d.reg.id ? [{ ...d.reg, registeredAt: NOW }] : [])]);
    toast(`${d.reg.client} ${t("given to")} ${t(winner.broker)}. ${t("Both agencies told on WhatsApp.")}`);
  };

  const late = reporting.filter((r) => r.overdue > 3).length;
  return (
    <>
      <PageHead title="Broker network" sub={`${t("184 agencies sell the same projects. One rule for all of them: the first to register a client keeps them for 30 days, renewed by every call, viewing or offer.")}`} />
      <Stats>
        <Stat label="Partner agencies" value="184" note="RERA and FAL licensed" />
        <Stat label="Registrations this month" value="4,120" note="every one checked" />
        <Stat label="Duplicates caught" value="612" note="same buyer, another agency or portal" />
        <Stat label="Disputes open" value={disputes.length + pending.filter((r) => check(r, regs, NOW).kind === "dispute").length} note="ruled on by sales admin" />
      </Stats>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <Card>
          <CardHead title="Registration requests" sub="Matched on phone and email, in any format, before anyone is protected" />
          {verdicts.length === 0 && <p className="text-ink-2">{t("All requests handled.")}</p>}
          <ul className="space-y-4">
            {verdicts.map(({ r, v }) => (
              <li key={r.id} className="border-t border-hairline-soft pt-3 first:border-0 first:pt-0">
                <p className="text-[14.5px]"><b className="pii font-medium">{r.client}</b> · {t(r.project)}</p>
                <p className="t-caption text-ink-2">{t("from")} {t(r.broker)} · <span dir="ltr" className="pii">{r.phone ?? r.email}</span></p>
                <VerdictLine v={v} />
                <div className="mt-2 flex gap-2">
                  {v.kind === "clear" && <Btn onClick={() => decide(r, v)}><ShieldCheck size={16} />{t("Protect")}</Btn>}
                  {v.kind === "owned" && <Btn variant="secondary" onClick={() => decide(r, v)}>{t("Tell the agency")}</Btn>}
                  {v.kind === "dispute" && <Btn variant="secondary" onClick={() => decide(r, v)}><Scales size={16} />{t("Open a dispute")}</Btn>}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHead title="Dispute queue" sub="Sales admin rules with the full timeline in front of them" />
          {disputes.length === 0 ? <p className="text-ink-2">{t("No open disputes. Open one from a registration request to see the timeline.")}</p> : (
            <ul className="space-y-5">
              {disputes.map((d) => (
                <li key={d.reg.id}>
                  <p className="font-medium"><span className="pii">{d.reg.client}</span> · {t(d.reg.project)}</p>
                  <p className="t-caption text-warm">{t(d.reason)}</p>
                  <ol className="mt-2 space-y-1.5 border-s border-hairline ps-3 text-[13.5px]">
                    {(evidence[d.reg.id] ?? []).map((e) => <li key={e.at + e.who}><span className="tnum text-ink-3">{e.at}</span> · <b className="font-medium">{t(e.who)}</b> · {t(e.what)}</li>)}
                  </ol>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Btn onClick={() => rule(d, d.owner)}>{t("Give to")} {t(d.owner.broker)}</Btn>
                    <Btn variant="secondary" onClick={() => rule(d, d.reg)}>{t("Give to")} {t(d.reg.broker)}</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHead title="Protected clients" sub="30 days from the latest call, viewing or offer. A WhatsApp message alone doesn't renew it." />
          <Table head={["Client", "Agency", "Last renewal", "Protection"]} minWidth={560}>
            {regs.map((r) => {
              const p = protection(r, NOW);
              const last = r.activity.filter((a) => RENEWING.includes(a.kind)).sort((a, b) => b.at - a.at)[0];
              return (
                <tr key={r.id}>
                  <td><span className="pii font-medium">{r.client}</span><span className="t-caption block text-ink-2">{t(r.project)}</span></td>
                  <td>{t(r.broker)}</td>
                  <td className="text-ink-2">{last ? `${t(last.kind[0].toUpperCase() + last.kind.slice(1))} · ${fmtDate(last.at, locale)}` : `${t("Registered")} · ${fmtDate(r.registeredAt, locale)}`}</td>
                  <td>{p.status === "released" ? <Pill tone="cold">{t("Released")}</Pill> : <Pill tone={p.status === "expiring" ? "warm" : "ok"}>{p.daysLeft} {t("days left")}</Pill>}</td>
                </tr>
              );
            })}
          </Table>
        </Card>
        <div className="grid content-start gap-5">
          <Card>
            <CardHead title="Reporting from agencies" sub={`${late} ${t("agencies are behind on updates")}`} />
            <ul className="divide-y divide-hairline-soft text-[14px]">
              {reporting.map((r) => (
                <li key={r.broker} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0"><b className="block truncate font-medium">{t(r.broker)}</b><span className="t-caption text-ink-2">{t("Last update")} {t(r.lastUpdate)} · {t("usually")} {t(r.median)}</span></span>
                  {r.overdue > 3 ? (
                    nudged.includes(r.broker) ? <Pill tone="ok">{t("Reminded")}</Pill> :
                    <Btn variant="secondary" onClick={() => { setNudged((n) => [...n, r.broker]); toast(`${t("WhatsApp reminder sent to")} ${t(r.broker)}`); }}><WhatsappLogo size={15} />{r.overdue} {t("overdue")}</Btn>
                  ) : <Pill tone="ok">{r.overdue} {t("overdue")}</Pill>}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHead title="Commission tiers" sub="Tiers change the rate, never the protection rule" />
            <ul className="divide-y divide-hairline-soft text-[14px]">
              {tiers.map((x) => (
                <li key={x.tier} className="flex items-center justify-between gap-3 py-2.5">
                  <span><b className="font-medium">{t(x.tier)}</b><span className="t-caption block text-ink-2">{t(x.rule)}</span></span>
                  <span className="tnum font-semibold">{x.rate}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

function HoldRow({ h, now, onDeposit, onRequest }: { h: UnitHolds & { project: string; price: string }; now: number; onDeposit: () => void; onRequest: (broker: string) => void }) {
  const { t } = useT();
  const [who, setWho] = useState(brokers[2].name);
  const left = h.active?.expiresAt ? Math.max(0, Math.round((h.active.expiresAt - now) / HOUR)) : null;
  return (
    <li className="grid gap-3 border-t border-hairline-soft py-4 first:border-0 first:pt-0 md:grid-cols-[1fr_1.3fr_auto] md:items-start">
      <div>
        <p className="font-medium"><bdi>{h.unit}</bdi></p>
        <p className="t-caption text-ink-2">{t(h.project)} · <span dir="ltr">{h.price}</span></p>
      </div>
      <div className="text-[14px]">
        {!h.active ? <Pill tone="ok">{t("Available")}</Pill> : h.active.deposit ? (
          <p><Pill tone="creek"><LockKey size={13} />{t("Reserved, deposit paid")}</Pill> <span className="t-caption text-ink-2">{t(h.active.broker)}</span></p>
        ) : (
          <p className="flex flex-wrap items-center gap-2"><Pill tone={left !== null && left < 12 ? "warm" : "creek"}><Clock size={13} />{left} {t("h left")}</Pill><span>{t("Held by")} <b className="font-medium">{t(h.active.broker)}</b> {t("for")} <span className="pii">{h.active.client}</span></span></p>
        )}
        {h.queue.length > 0 && (
          <ol className="t-caption mt-2 space-y-0.5 text-ink-2">
            {h.queue.map((q, i) => <li key={q.broker + q.client}>{i + 1}. {t(q.broker)} · <span className="pii">{q.client}</span></li>)}
          </ol>
        )}
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        {h.active && !h.active.deposit && <Btn variant="secondary" onClick={onDeposit}>{t("Record deposit")}</Btn>}
        {!h.active?.deposit && (
          <span className="flex gap-1.5">
            <select aria-label={t("Agency")} value={who} onChange={(e) => setWho(e.target.value)} className="h-9 max-w-[11rem] rounded-[10px] border border-hairline bg-canvas px-2 text-[13px]">{brokers.map((b) => <option key={b.name} value={b.name}>{t(b.name)}</option>)}</select>
            <Btn variant="quiet" onClick={() => onRequest(who)}>{t("Request hold")}</Btn>
          </span>
        )}
      </div>
    </li>
  );
}

/** One active hold per unit, timed, released automatically; everyone else queues. */
export function Holds() {
  const { t } = useT();
  const { toast } = useStore();
  const [offset, setOffset] = useState(0);
  const now = NOW + offset;
  const [units, setUnits] = useState(seedHolds);
  const view = units.map((u) => ({ ...u, ...settle(u, now) }));
  const held = view.filter((u) => u.active && !u.active.deposit).length;
  const queued = view.reduce((a, u) => a + u.queue.length, 0);
  return (
    <>
      <PageHead title="Unit holds" sub={`${t("Two agencies can never hold the same unit. A hold lasts")} ${HOLD_HOURS} ${t("hours and releases itself unless a deposit arrives; the next agency in the queue gets it automatically.")}`}
        actions={<Btn variant="secondary" onClick={() => { setOffset((o) => o + 24 * HOUR); toast(t("Clock moved forward 24 hours")); }}><ArrowsClockwise size={16} />{t("Move clock 24 hours")}</Btn>} />
      <Stats>
        <Stat label="Units on hold" value={held} />
        <Stat label="Agencies queuing" value={queued} />
        <Stat label="Reserved with deposit" value={view.filter((u) => u.active?.deposit).length} />
        <Stat label="Double bookings" value="0" note="the rule makes them impossible" />
      </Stats>
      <Card>
        <CardHead title="Holds and queues" sub={offset ? `${t("Showing the board")} ${offset / HOUR} ${t("hours from now")}` : "Live"} />
        <ul>
          {view.map((h, i) => (
            <HoldRow key={h.unit} h={h} now={now}
              onDeposit={() => { setUnits((us) => us.map((u, j) => (j === i ? { ...u, ...deposit(u, h.active!.broker, now) } : u))); toast(`${h.unit} ${t("reserved. Queue released and told on WhatsApp.")}`); }}
              onRequest={(broker) => {
                const r = requestHold(units[i], { broker, client: "New client", requestedAt: now }, now);
                setUnits((us) => us.map((u, j) => (j === i ? { ...u, ...r.state } : u)));
                toast(r.outcome === "held" ? `${t(broker)} ${t("holds")} ${h.unit} ${t("for 48 hours")}` : r.outcome === "queued" ? `${t(broker)} ${t("is number")} ${r.position} ${t("in the queue")}` : r.outcome === "sold" ? t("Already reserved with a deposit") : t("This agency already holds it"));
              }} />
          ))}
        </ul>
      </Card>
    </>
  );
}

/** The broker's own side: register, see protection, hold units, one price list, WhatsApp alerts. */
export function Partner() {
  const { t, locale } = useT();
  const { toast } = useStore();
  const me = brokers[0];
  const myDeals = deals.filter((d) => d.broker === me.name);
  const [mine, setMine] = useState<Registration[]>(seedRegs.filter((r) => r.broker === me.name));
  const [result, setResult] = useState<{ tone: "ok" | "hot" | "warm"; text: string } | null>(null);
  const [holdMsg, setHoldMsg] = useState<string | null>(null);
  const [units, setUnits] = useState(seedHolds);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const reg: Registration = { id: `p${Date.now()}`, broker: me.name, client: String(f.get("name") || "").trim(), phone: String(f.get("phone") || "") || undefined, email: String(f.get("email") || "") || undefined, project: String(f.get("project")), registeredAt: NOW, activity: [] };
    if (!reg.client || (!reg.phone && !reg.email)) { setResult({ tone: "hot", text: t("Add the client's mobile or email, so we can check for duplicates.") }); return; }
    const v = check(reg, seedRegs, NOW);
    if (v.kind === "clear") {
      setMine((m) => [reg, ...m]);
      setResult({ tone: "ok", text: `${reg.client} ${t("is yours until")} ${fmtDate(NOW + PROTECTION_DAYS * DAY, locale)}. ${t("Every call, viewing or offer you log extends it.")}` });
      toast(t("Client registered and protected"));
      e.currentTarget.reset();
    } else if (v.kind === "owned") setResult({ tone: "hot", text: `${t("Another agency registered this client first. Their protection ends in")} ${v.daysLeft} ${t("days unless they stay active; we'll tell you if it lapses.")}` });
    else setResult({ tone: "warm", text: t("This client was registered by another agency at almost the same time. Sales admin will rule within one working day and tell you on WhatsApp.") });
  };

  const hold = (i: number) => {
    const r = requestHold(units[i], { broker: me.name, client: "My client", requestedAt: NOW }, NOW);
    setUnits((us) => us.map((u, j) => (j === i ? { ...u, ...r.state } : u)));
    setHoldMsg(r.outcome === "held" ? `${units[i].unit} ${t("is held for you for 48 hours.")}` : r.outcome === "queued" ? `${t("Someone holds it. You're number")} ${r.position} ${t("in the queue; we'll WhatsApp you the moment it's yours.")}` : r.outcome === "sold" ? t("Reserved with a deposit. Not available.") : t("You already hold this unit."));
  };

  const alerts = [
    { icon: Clock, text: "Your hold on A-3902 ends in 6 hours. Record a deposit or it goes to the next agency." },
    { icon: BellRinging, text: "Price list updated for Creek Harbour: 4 units changed price. Your shared links already show the new prices." },
    { icon: ShieldCheck, text: "Chen Wei: another agency tried to register this client. Your protection holds for 24 more days." },
  ];

  return (
    <>
      <PageHead title="Partner home" sub={`${t(me.name)} · ${t("Platinum partner")} · ORN ${me.orn}`} />
      <Stats>
        <Stat label="Protected clients" value={mine.length + me.clients - 2} />
        <Stat label="Deals this year" value={me.deals} />
        <Stat label="Commission this year" value={aed(me.commissionM)} note="4% Platinum rate" />
        <Stat label="Next payment" value="AED 136K" note="due 2 December" />
      </Stats>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid content-start gap-5">
          <Card>
            <CardHead title="Register a client" sub={`${t("Checked against every")} ${t(group.name)} ${t("enquiry and every agency's registrations")}`} />
            <form onSubmit={submit} className="grid gap-3">
              <label className={labelCls}>{t("Client name")}<input name="name" required className={field} placeholder={t("e.g. Lina Haddad")} /></label>
              <label className={labelCls}>{t("Mobile")}<input name="phone" inputMode="tel" dir="ltr" className={field} placeholder="+971" /></label>
              <label className={labelCls}>{t("Email")}<input name="email" type="email" dir="ltr" className={field} /></label>
              <label className={labelCls}>{t("Project")}<select name="project" className={field}>{[...new Set(seedHolds.map((h) => h.project).concat(seedRegs.map((r) => r.project)))].map((p) => <option key={p} value={p}>{t(p)}</option>)}</select></label>
              <Btn type="submit"><UserPlus size={16} />{t("Register and protect")}</Btn>
              {result && <p role="status" className={cx("flex items-start gap-1.5 text-[13.5px]", result.tone === "ok" ? "text-ok" : result.tone === "warm" ? "text-warm" : "text-hot")}>{result.tone === "ok" ? <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0" /> : <Warning size={16} className="mt-0.5 shrink-0" />}{result.text}</p>}
              <p className="t-fine text-ink-3">{t("Try mobile “+49 151 2290 1144” on Creek Harbour to see a duplicate caught.")}</p>
            </form>
          </Card>
          <Card>
            <CardHead title="WhatsApp alerts" sub="What this agency received today" />
            <ul className="space-y-3 text-[14px]">
              {alerts.map((a) => <li key={a.text} className="flex gap-2.5"><a.icon size={18} className="mt-0.5 shrink-0 text-creek" /><span>{t(a.text)}</span></li>)}
            </ul>
          </Card>
        </div>
        <div className="grid content-start gap-5">
          <Card>
            <CardHead title="My protected clients" />
            <ul className="divide-y divide-hairline-soft">
              {mine.map((r) => {
                const p = protection(r, NOW);
                return (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0"><span className="pii block truncate font-medium">{r.client}</span><span className="t-caption text-ink-2">{t(r.project)}</span></span>
                    {p.status === "released" ? <Pill tone="cold">{t("Released")}</Pill> : <Pill tone={p.status === "expiring" ? "warm" : "ok"}>{p.daysLeft} {t("days left")}</Pill>}
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card>
            <CardHead title="Hold a unit" sub="One price list for every agency, confirmed 40 minutes ago" />
            {holdMsg && <p role="status" className="mb-3 text-[13.5px] text-creek">{holdMsg}</p>}
            <ul className="divide-y divide-hairline-soft">
              {units.map((u, i) => {
                const s = settle(u, NOW);
                const status = !s.active ? t("Available") : s.active.deposit ? t("Reserved") : s.active.broker === me.name ? t("Held by you") : `${t("Held")} · ${s.queue.length} ${t("queuing")}`;
                return (
                  <li key={u.unit} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0"><span className="block font-medium"><bdi>{u.unit}</bdi></span><span className="t-caption text-ink-2">{t(u.project)} · <span dir="ltr">{u.price}</span> · {status}</span></span>
                    {!s.active?.deposit && s.active?.broker !== me.name && <Btn variant="secondary" onClick={() => hold(i)}>{s.active ? t("Join queue") : t("Hold 48 h")}</Btn>}
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card>
            <CardHead title="Commission statement" />
            {myDeals.map((d) => (
              <div key={d.client} className="flex items-center justify-between gap-3 border-t border-hairline-soft py-2.5 first:border-0">
                <span><span className="pii block font-medium">{d.client}</span><span className="t-caption text-ink-2">{t(d.project)} · {d.unit} · {t(d.stage)}</span></span>
                <span className="tnum text-end font-semibold">{aed(d.commission)}<span className="t-caption block font-normal text-ink-2">{t("due after SPA")}</span></span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
