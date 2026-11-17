"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Sparkle } from "@phosphor-icons/react";
import { funnel, dropoff, channelROI, agents, developers, type Developer } from "@/lib/data";
import { fmtAED, fmtNum } from "@/lib/engine";
import { img } from "@/lib/img";
import { useT } from "../i18n";
import { Card, CardHead, PageHead, Stat, Stats, Monogram, Btn, Segmented, Table, Meter, Pill, Dot, cx } from "../ui";

export function Funnel() {
  const { t } = useT();
  const max = funnel[0].n;
  return (
    <>
      <PageHead title="Conversion funnel" sub="Where leads go quiet, and the most common reason why." />
      <Stats>
        <Stat label="Leads" value="247" />
        <Stat label="Qualified" value="64%" note="industry average 45%" />
        <Stat label="Reached a meeting" value="38%" delta="+6 pts" note="month on month" />
        <Stat label="Closed" value="12%" note="top quartile" />
      </Stats>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHead title="From enquiry to keys" />
          <ol className="space-y-3">
            {funnel.map((f) => (
              <li key={f.stage} className="grid grid-cols-[100px_1fr_48px] items-center gap-4">
                <span className="text-[15px]">{t(f.stage)}</span>
                <span className="relative h-10 overflow-hidden rounded-[10px] bg-pearl">
                  <span className="bar-in absolute inset-y-0 start-0 rounded-[10px] bg-creek" style={{ width: `${(f.n / max) * 100}%`, opacity: 0.35 + (f.n / max) * 0.65 }} />
                </span>
                <span className="tnum text-end font-semibold">{f.n}</span>
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <CardHead title="Where leads drop off" />
          <ul className="space-y-4">
            {dropoff.map((d) => (
              <li key={d.from}>
                <div className="flex justify-between"><span className="font-medium">{t(d.from)}</span><span className="tnum font-semibold text-hot">{d.pct}%</span></div>
                <p className="t-caption text-ink-2">{t(d.why)}</p>
              </li>
            ))}
          </ul>
          <p className="t-caption mt-5 rounded-[12px] bg-creek-soft p-3 text-ink">{t("The biggest fix is the first reply. Leads answered within five minutes qualify at nearly twice the rate.")}</p>
        </Card>
      </div>
    </>
  );
}

export function ChannelROI() {
  const { t } = useT();
  const maxRev = Math.max(...channelROI.map((c) => c.revenue));
  return (
    <>
      <PageHead title="Channel ROI" sub="What each source costs you, and what it brings back." />
      <Stats>
        <Stat label="Best channel" value="WhatsApp" note="412% ROI · AED 18 per lead" />
        <Stat label="Ad spend" value="AED 10.4K" note="this month" />
        <Stat label="Revenue attributed" value="AED 4.2M" />
        <Stat label="Blended cost per lead" value="AED 42" delta="−18%" note="month on month" />
      </Stats>
      <Card>
        <CardHead title="By channel" />
        <Table head={["Channel", "Leads", "Cost per lead", "Revenue", "ROI"]} minWidth={640}>
          {channelROI.map((c) => (
            <tr key={c.name}>
              <td className="font-medium">{t(c.name)}</td>
              <td className="tnum">{c.leads}</td>
              <td className="tnum">{c.cpl ? `AED ${c.cpl}` : "—"}</td>
              <td>
                <div className="flex items-center gap-3">
                  <span className="tnum w-24">{fmtAED(c.revenue)}</span>
                  <Meter value={(c.revenue / maxRev) * 100} className="w-32" />
                </div>
              </td>
              <td className="tnum font-semibold">{c.roi === null ? t("No spend") : `${c.roi}%`}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

export function Agents() {
  const { t } = useT();
  return (
    <>
      <PageHead title="Agent performance" sub="Who replies fastest, who books the most viewings, and who needs help today." />
      <Stats>
        <Stat label="Active agents" value="8" note="3 online now" />
        <Stat label="Top converter" value="Layla H." note="32% conversion" />
        <Stat label="Average first reply" value="6m 12s" note="target: under 5 minutes" />
        <Stat label="SLA breaches" value="2" note="needs attention" />
      </Stats>
      <Card>
        <CardHead title="Leaderboard" />
        <Table head={["#", "Agent", "Status", "Hot leads", "Booked", "Conversion", "First reply", "Score", "SLA"]} minWidth={860}>
          {agents.map((a, i) => (
            <tr key={a.name}>
              <td className="tnum text-ink-3">{i + 1}</td>
              <td><span className="flex items-center gap-3"><Monogram name={a.name} size={32} /><span className="font-medium">{a.name}</span></span></td>
              <td><span className="flex items-center gap-2 text-ink-2"><Dot tone={a.status === "online" ? "ok" : a.status === "busy" ? "warm" : "cold"} />{t(a.status[0].toUpperCase() + a.status.slice(1))}</span></td>
              <td className="tnum">{a.hot}</td>
              <td className="tnum">{a.booked}</td>
              <td className="tnum">{a.conv}%</td>
              <td className="tnum">{a.resp}</td>
              <td><span className="flex items-center gap-2"><span className="tnum w-6 font-semibold">{a.score}</span><Meter value={a.score} className="w-14" /></span></td>
              <td><Pill tone={a.sla === "OK" ? "ok" : a.sla === "WARN" ? "warm" : "hot"}>{t(a.sla === "OK" ? "On time" : a.sla === "WARN" ? "At risk" : "Breach")}</Pill></td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

type Country = "all" | Developer["country"];
export function GccDevelopers() {
  const { t } = useT();
  const [c, setC] = useState<Country>("all");
  const list = developers.filter((d) => c === "all" || d.country === c);
  return (
    <>
      <div className="relative mb-6 overflow-hidden rounded-[22px] bg-tile text-white">
        <Image src={img("skylineNight", 1600)} alt="" fill sizes="100vw" className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
        <div className="relative px-6 pb-8 pt-24 sm:px-10">
          <h1 className="text-[30px] font-semibold leading-[1.08] tracking-[-0.024em] sm:text-[40px]">{t("GCC developers")}</h1>
          <p className="mt-2 max-w-[56ch] text-white/75">{t("The region’s developers and flagship projects, in one place. Match a buyer to the right launch in seconds.")}</p>
        </div>
      </div>
      <Stats>
        <Stat label="Developers" value="42" note="across six countries" />
        <Stat label="Projects" value="187" note="active and upcoming" />
        <Stat label="Average unit price" value="AED 2.8M" delta="+12%" note="year on year" />
        <Stat label="Off-plan share" value="68%" note="of inventory" />
      </Stats>
      <div className="mb-4">
        <Segmented<Country> label="Filter by country" value={c} onChange={setC} options={[{ value: "all", label: "All GCC" }, { value: "UAE", label: "UAE" }, { value: "KSA", label: "Saudi Arabia" }, { value: "Qatar", label: "Qatar" }, { value: "Kuwait", label: "Kuwait" }, { value: "Bahrain", label: "Bahrain" }, { value: "Oman", label: "Oman" }]} />
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => (
          <li key={d.id} className="lift overflow-hidden rounded-[18px] border border-hairline-soft bg-canvas">
            <div className="zoom-frame relative aspect-[16/9] bg-tile">
              {d.photo ? (
                <Image src={img(d.photo, 800)} alt={d.place} fill sizes="(min-width:1280px) 400px, 50vw" className="object-cover" />
              ) : (
                <MonoArt name={d.name} />
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{d.name}</p>
                  <p className="t-caption text-ink-2">{d.place} · {t(d.country === "KSA" ? "Saudi Arabia" : d.country)} · {t("since")} {d.founded}</p>
                </div>
              </div>
              <p className="t-caption mt-2 text-ink-2">{t(d.desc)}</p>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[["Projects", d.projects], ["Units", d.units], ["Value", d.value]].map(([k, v]) => (
                  <div key={k as string} className="rounded-[10px] bg-pearl py-2"><dt className="t-fine text-ink-2">{t(k as string)}</dt><dd className="tnum text-[14px] font-semibold">{v}</dd></div>
                ))}
              </dl>
              <p className="t-caption mt-3 text-ink-2">{d.flagship.join(" · ")}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="t-fine mt-4 text-ink-3">{t("Directory figures are indicative, for demonstration only.")}</p>
    </>
  );
}

/** Drawn cover for developers we have no verified photograph of: a skyline silhouette from the name. */
function MonoArt({ name }: { name: string }) {
  let h = 7;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  const bars = Array.from({ length: 14 }, (_, i) => 20 + ((h * (i + 3)) % 60));
  return (
    <svg viewBox="0 0 280 158" className="absolute inset-0 size-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`g${h}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f3c44" /><stop offset="1" stopColor="#0b1416" /></linearGradient>
      </defs>
      <rect width="280" height="158" fill={`url(#g${h})`} />
      <circle cx={60 + (h % 160)} cy="46" r="14" fill="#e9c88a" opacity=".85" />
      {bars.map((b, i) => <rect key={i} x={i * 20 + 2} y={158 - b} width="16" height={b} fill="#06292f" opacity={0.75 + (i % 3) * 0.08} />)}
    </svg>
  );
}
