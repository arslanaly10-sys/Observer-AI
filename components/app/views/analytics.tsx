"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Sparkle } from "@phosphor-icons/react";
import { funnel, dropoff, channelROI, agents } from "@/lib/data";
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
