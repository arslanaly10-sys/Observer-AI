"use client";
import { useMemo, useState } from "react";
import { Moon, CheckCircle, Warning, IdentificationCard, Bank, CurrencyCircleDollar, Queue, PaperPlaneRight, Robot, ChatsCircle, Handshake, ArrowRight, Broadcast, Database, LinkSimple, EnvelopeSimple, WhatsappLogo, LockKey } from "@phosphor-icons/react";
import { useT } from "../i18n";
import { useStore } from "../store";
import { Card, CardHead, PageHead, Stat, Stats, Pill, Btn, Table, cx } from "../ui";
import { confidence, nightAnswer, parseDesk, dealPack, demandRadar, NIGHT_MIN, MIN_GROUP, type Listing, type SignalKind, type DeskUpdate } from "@/lib/market/marketplace";
import { NIGHT, PACE, units as seedUnits, night, deskSamples, developerAi, dealRoom, sampleAsks, feeds, type DemoUnit } from "@/lib/demo/marketplace";

const SOURCE: Record<SignalKind, string> = {
  "developer-desk": "Developer reply desk", portal: "Developer portal", "price-list": "Price list", aggregator: "Aggregator feed", "whatsapp-group": "Developer WhatsApp group", "form-a": "Form A resale",
};
const money = (n: number, c: string) => `${c} ${n >= 1e6 ? (n / 1e6).toFixed(2).replace(/0$/, "") + "M" : n.toLocaleString("en-US")}`;
const hoursAgo = (at: number) => Math.max(0, Math.round((NIGHT - at) / 3_600_000));

function toListing(u: DemoUnit): Listing {
  return { code: u.code, project: u.project, area: u.area, developer: u.developer, beds: u.beds, price: u.price, conf: confidence(u.signals, PACE[u.project], NIGHT) };
}

function ConfPill({ l }: { l: Listing }) {
  const { t } = useT();
  const c = l.conf;
  if (!c) return <Pill tone="cold">{t("No data")}</Pill>;
  if (c.state !== "available") return <Pill tone="cold">{t(c.state === "sold" ? "Sold" : c.state === "held" ? "Held" : "Booked")}</Pill>;
  return <Pill tone={c.confidence >= NIGHT_MIN ? "ok" : c.confidence >= 60 ? "warm" : "hot"}>{c.confidence}% {t("sure")}</Pill>;
}

function MarketNote() {
  const { t } = useT();
  return <p className="t-fine mt-3 text-ink-3">{t("Emaar is the permitted workspace. Other developers are shown by name as market data only, with sample units and illustrative prices; no partnership is implied.")}</p>;
}

/** Midnight in Dubai: what the AI may do on its own, and the deal pack ready by morning. */
export function Overnight() {
  const { t } = useT();
  const listings = useMemo(() => seedUnits.map(toListing), []);
  const wanted = listings.find((l) => l.code === night.unit)!;
  const answer = nightAnswer(wanted, listings);
  const pack = dealPack({ unitRequested: night.unit, passport: night.passport, proofOfFunds: night.funds, eoiPaid: night.eoi, holdQueued: { position: 1, opensAt: "09:00" } }, new Date("2026-11-19"), wanted.price);
  const steps = [
    { icon: Robot, h: "Quoted only what it was sure of", t: `${night.unit} ${t("is")} ${wanted.conf?.confidence}% ${t("sure, under the 80% night limit. The AI said so, and offered")} ${answer.alternatives.map((a) => a.code).join(` ${t("and")} `)}.` },
    { icon: IdentificationCard, h: "Read the passport", t: "Valid until March 2031; name matches the booking form." },
    { icon: Bank, h: "Checked proof of funds", t: "Bank statement covers the 20% due at booking." },
    { icon: CurrencyCircleDollar, h: "Sent the developer's deposit link", t: "AED 50,000 refundable EOI, paid to Emaar directly. No money passed through Observer or the broker." },
    { icon: Queue, h: "Queued the hold request", t: "First in line for A-2207 when Emaar's desk opens at 9:00, with A-2309 as the backup." },
  ];
  return (
    <>
      <PageHead title="Overnight desk" sub="00:30 in Dubai. A buyer wants to secure a unit before flying home. Nobody at the developer can confirm it until 9:00, so the AI captures the commitment and makes the morning a formality." />
      <Stats>
        <Stat label="Enquiries since midnight" value="214" note="every one answered" />
        <Stat label="Quoted (80%+ sure)" value="131" />
        <Stat label="Confirm first, with alternatives" value="69" note="below the night limit" />
        <Stat label="Deal packs ready for 9:00" value="14" note="deposit paid to the developer" />
      </Stats>
      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHead title="The conversation" sub={`${night.client} · ${t(night.from)} · ${t("for")} ${t(night.broker)}`} aside={<Pill tone="cold"><Moon size={13} />00:31</Pill>} />
          <ol className="space-y-2.5">
            {night.thread.map((m, i) => (
              <li key={i} className={cx("flex", m.who === "client" ? "justify-end" : "justify-start")}>
                <div className={cx("max-w-[85%] rounded-[14px] px-3.5 py-2.5 text-[14px]", m.who === "client" ? "bg-ink text-canvas" : "bg-parchment")}>
                  <p>{t(m.text)}</p>
                  <p className={cx("t-fine mt-1", m.who === "client" ? "text-canvas/60" : "text-ink-3")}>{m.at}{m.who === "ai" ? ` · ${t("AI assistant")}` : ""}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
        <div className="grid content-start gap-5">
          <Card>
            <CardHead title="What the AI did on its own" sub="Inside the limits you set: quote only when sure, never take money, never confirm a hold" />
            <ul className="space-y-3.5">
              {steps.map((s) => <li key={s.h} className="flex gap-3"><s.icon size={20} className="mt-0.5 shrink-0 text-creek" /><span><b className="block font-medium">{t(s.h)}</b><span className="t-caption text-ink-2">{t(s.t)}</span></span></li>)}
            </ul>
          </Card>
          <Card>
            <CardHead title="Deal pack for 9:00" aside={<Pill tone={pack.ready ? "ok" : "warm"}>{t(pack.ready ? "Ready" : "Incomplete")}</Pill>} />
            <ul className="divide-y divide-hairline-soft text-[14px]">
              {pack.items.map((x) => <li key={x.label} className="flex items-center justify-between gap-3 py-2"><span>{t(x.label)}</span>{x.ok ? <CheckCircle size={18} weight="fill" className="text-ok" /> : <span className="t-caption text-warm">{t(x.note ?? "")}</span>}</li>)}
            </ul>
          </Card>
        </div>
      </div>
      <Card className="mt-5">
        <CardHead title="What the AI can say about each unit tonight" sub="Confidence from every signal: the latest source, how old it is, how fast the project sells, and sales the Land Department registered since" />
        <Table head={["Unit", "Developer", "Price", "Latest source", "Tonight"]} minWidth={820}>
          {listings.map((l) => {
            const u = seedUnits.find((x) => x.code === l.code)!;
            const a = nightAnswer(l, listings);
            return (
              <tr key={l.code}>
                <td><bdi className="font-medium">{l.code}</bdi><span className="t-caption block text-ink-2">{t(l.project)} · {l.beds} {t("bed")}</span></td>
                <td>{t(u.developer)}{!u.partner && <span className="t-caption block text-ink-3">{t("Market data")}</span>}</td>
                <td className="tnum"><bdi>{money(u.price, u.currency)}</bdi></td>
                <td className="text-ink-2">{t(SOURCE[l.conf!.basis])}<span className="t-caption block">{hoursAgo(l.conf!.at)} {t("h ago")}</span></td>
                <td><span className="flex flex-wrap items-center gap-2"><ConfPill l={l} /><span className="t-caption text-ink-2">{t(a.action === "quote" ? "Quotes it" : a.action === "sold" ? "Offers alternatives" : "Confirms at 9:00")}</span></span></td>
              </tr>
            );
          })}
        </Table>
        <MarketNote />
      </Card>
    </>
  );
}

/** The developer's side: update units in plain words, and an AI that answers brokers overnight. */
export function ReplyDesk() {
  const { t } = useT();
  const { toast } = useStore();
  const [text, setText] = useState(deskSamples.join("\n"));
  const [log, setLog] = useState<{ at: string; via: string; u: DeskUpdate }[]>([]);
  const [approved, setApproved] = useState<string[]>([]);
  const updates = parseDesk(text);
  const apply = () => {
    if (!updates.length) { toast(t("No unit updates found in that message.")); return; }
    setLog((l) => [...updates.map((u) => ({ at: "09:12", via: "WhatsApp", u })), ...l]);
    toast(`${updates.length} ${t("units updated for every agency.")}`);
  };
  return (
    <>
      <PageHead title="Developer reply desk" sub="No integration and no API. The developer's sales admin updates units the way they already work: a WhatsApp message, a private web link, or a forwarded price list. Every agency sees it within a minute." />
      <Stats>
        <Stat label="Updates today" value={log.length + 86} />
        <Stat label="Broker calls avoided" value="412" note="estimated from questions the AI answered" />
        <Stat label="Developer AI answers overnight" value={developerAi.length} />
        <Stat label="Holds waiting for a person" value={developerAi.filter((d) => d.needs).length - approved.length} />
      </Stats>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHead title="Message the desk" sub="Write as you would to a colleague, in English or Arabic" aside={<Pill tone="wa"><WhatsappLogo size={13} />WhatsApp</Pill>} />
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="w-full rounded-[12px] border border-hairline bg-canvas p-3 text-[14.5px] outline-none focus:border-creek" dir="auto" />
          <p className="t-caption mt-3 text-ink-2">{t("Observer reads")}:</p>
          <ul className="mt-1.5 space-y-1.5 text-[14px]">
            {updates.map((u, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2">
                <bdi className="font-medium">{u.code}</bdi>
                {u.state && <Pill tone={u.state === "sold" ? "hot" : u.state === "available" ? "ok" : "warm"}>{t(u.state === "sold" ? "Sold" : u.state === "held" ? "Held" : u.state === "booked" ? "Booked" : "Available")}</Pill>}
                {u.price && <span className="tnum text-ink-2"><bdi>AED {u.price.toLocaleString("en-US")}</bdi></span>}
              </li>
            ))}
            {!updates.length && <li className="text-ink-2">{t("No unit updates found in that message.")}</li>}
          </ul>
          <Btn className="mt-4" onClick={apply}><PaperPlaneRight size={16} />{t("Send")}</Btn>
          <div className="mt-5 grid gap-3 border-t border-hairline-soft pt-4 text-[14px] sm:grid-cols-2">
            <p className="flex gap-2"><LinkSimple size={18} className="shrink-0 text-creek" /><span><b className="block font-medium">{t("Private web link")}</b><span className="t-caption text-ink-2">{t("One link per project, no login: tick sold, held or available.")}</span></span></p>
            <p className="flex gap-2"><EnvelopeSimple size={18} className="shrink-0 text-creek" /><span><b className="block font-medium">{t("Forward the price list")}</b><span className="t-caption text-ink-2">{t("Send the usual email to the project's address; only the changes go live.")}</span></span></p>
          </div>
        </Card>
        <Card>
          <CardHead title="Developer AI, overnight" sub="Answers agencies from the developer's latest inventory and rules. A person approves every hold." />
          <ul className="space-y-4">
            {developerAi.map((d) => (
              <li key={d.at + d.broker} className="border-t border-hairline-soft pt-3 first:border-0 first:pt-0">
                <p className="t-caption text-ink-3">{d.at} · {t(d.broker)}</p>
                <p className="mt-0.5 font-medium">{t(d.q)}</p>
                <p className="mt-1 flex gap-2 text-[14px] text-ink-2"><Robot size={16} className="mt-0.5 shrink-0 text-creek" />{t(d.a)}</p>
                {d.needs && (approved.includes(d.at) ? <p className="mt-2 text-[13.5px] text-ok">{t("Approved by sales admin")}</p> : <Btn variant="secondary" className="mt-2" onClick={() => { setApproved((a) => [...a, d.at]); toast(t("Hold approved. The agency is told on WhatsApp.")); }}>{t("Approve hold")}</Btn>)}
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {log.length > 0 && (
        <Card className="mt-5">
          <CardHead title="Updates published" />
          <ul className="space-y-1.5 text-[14px]">{log.map((l, i) => <li key={i}><span className="tnum text-ink-3">{l.at}</span> · <bdi className="font-medium">{l.u.code}</bdi> · {l.u.state ? t(l.u.state[0].toUpperCase() + l.u.state.slice(1)) : ""}{l.u.price ? <bdi> AED {l.u.price.toLocaleString("en-US")}</bdi> : ""} · {t("via")} {l.via}</li>)}</ul>
        </Card>
      )}
    </>
  );
}

/** Client, broker and developer in one thread, with the requests their AIs sent each other. */
export function DealRoom() {
  const { t } = useT();
  return (
    <>
      <PageHead title="Deal room" sub="When a client commits, one thread opens for the client, the broker and the developer's salesperson, as the developer's desk opens. Nobody repeats anything, and every request between the two sides is on record." />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHead title="A-2207 · Dubai Creek Harbour" sub="Opened 09:00 · Olivia Bennett" aside={<Pill tone="ok"><LockKey size={13} />{t("Held 48 hours")}</Pill>} />
          <ul className="mb-4 flex flex-wrap gap-2">{dealRoom.members.map((m) => <li key={m.name} className="rounded-full bg-parchment px-3 py-1 text-[13px]"><b className="font-medium">{t(m.name)}</b> · <span className="text-ink-2">{t(m.role)}</span></li>)}</ul>
          <ol className="space-y-3">
            {dealRoom.thread.map((m, i) => (
              <li key={i} className="flex gap-3">
                <span className="tnum w-11 shrink-0 pt-0.5 text-[12.5px] text-ink-3">{m.at}</span>
                <span className="min-w-0 text-[14px]"><b className={cx("font-medium", m.who === "Observer AI" && "text-creek")}>{t(m.who)}</b><span className="block">{t(m.text)}</span></span>
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <CardHead title="AI-to-AI requests" sub="Structured, so both sides see the request, its place in the queue and the answer" />
          <ol className="relative space-y-5 border-s border-hairline ps-5">
            {dealRoom.requests.map((r) => (
              <li key={r.at + r.kind}>
                <span className="absolute -start-[7px] mt-1.5 size-3 rounded-full bg-creek" />
                <p className="t-caption text-ink-3">{r.at} · {t(r.from)} <ArrowRight size={11} className="inline rtl:-scale-x-100" /> {t(r.to)}</p>
                <p className="font-medium">{t(r.kind)} · <bdi>{r.unit}</bdi></p>
                <Pill tone={r.status.startsWith("Queued") ? "warm" : "ok"}>{t(r.status)}</Pill>
                <p className="t-caption mt-1 text-ink-2">{t(r.detail)}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}

/** What buyers are asking for, anonymised, for developers. Plus the data feeds behind confidence. */
export function DemandRadar() {
  const { t } = useT();
  const r = useMemo(() => demandRadar(sampleAsks()), []);
  const max = r.rows[0]?.count ?? 1;
  return (
    <>
      <PageHead title="Demand radar" sub="Why developers keep Observer up to date: they see what qualified buyers are asking for this week. Counts and ranges only, from clients who agreed to it; groups smaller than five are never shown." />
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHead title="This week's qualified demand" aside={<Pill tone="creek"><Broadcast size={13} />{t("Anonymised")}</Pill>} />
          <ul className="space-y-4">
            {r.rows.map((g) => (
              <li key={g.area + g.beds + g.under}>
                <p className="flex flex-wrap items-baseline justify-between gap-2 text-[14.5px]"><span><b className="font-medium">{t(g.area)}</b> · {g.beds} {t("bed")} · {t("under")} <bdi>{g.area === "North Riyadh" ? "SAR" : "AED"} {(g.under / 1e6).toLocaleString("en-US")}M</bdi></span><span className="tnum font-semibold">{g.count} {t("buyers")}</span></p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-parchment"><div className="h-full bg-creek" style={{ width: `${(g.count / max) * 100}%` }} /></div>
                <p className="t-caption mt-1 text-ink-2">{t("Median budget")} <bdi>{(g.median / 1e6).toFixed(2)}M</bdi></p>
              </li>
            ))}
          </ul>
          <p className="t-fine mt-4 text-ink-3">{r.hidden} {t("buyers in groups smaller than")} {MIN_GROUP} {t("are not shown, so nobody can be identified. Sample data.")}</p>
        </Card>
        <Card>
          <CardHead title="Where availability comes from" sub="No developer API needed" />
          <ul className="space-y-4">
            {feeds.map((f) => (
              <li key={f.name} className="flex gap-3">
                <Database size={20} className="mt-0.5 shrink-0 text-creek" />
                <span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><b className="font-medium">{t(f.name)}</b><Pill tone={f.status === "live" ? "ok" : "warm"}>{t(f.status === "live" ? "Live" : "Limited")}</Pill></span><span className="t-caption block text-ink-2">{t(f.detail)}</span><span className="t-caption block">{t(f.signal)} · {t(f.last)}</span></span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHead title="What developers get in return" />
        <ul className="grid gap-4 sm:grid-cols-3">
          {[[ChatsCircle, "Fewer broker calls", "The AI answers agencies' availability questions from the developer's latest update."], [Handshake, "Committed buyers at 9:00", "Overnight enquiries arrive with documents read and the developer's own deposit paid."], [Broadcast, "Launch and pricing signals", "Anonymised demand by area, size and budget, before the next launch is priced."]].map(([I, h, d]) => {
            const Icon = I as typeof ChatsCircle;
            return <li key={h as string} className="flex gap-3"><Icon size={22} className="mt-0.5 shrink-0 text-creek" /><span><b className="block font-medium">{t(h as string)}</b><span className="t-caption text-ink-2">{t(d as string)}</span></span></li>;
          })}
        </ul>
      </Card>
    </>
  );
}

export { Warning };
