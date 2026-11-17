"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { WhatsappLogo, Phone, ChatText, UserPlus, Robot, CaretRight, Lightning } from "@phosphor-icons/react";
import { leads, activity, nba, kanban, agents, dailyLeads, workspace, PROPERTY, type Temp } from "@/lib/data";
import { img } from "@/lib/img";
import { useT } from "../i18n";
import { Card, CardHead, PageHead, Stat, Stats, TempBadge, Monogram, ScoreBar, Btn, Segmented, Table, Bars, Meter, Dot, Pill, cx } from "../ui";

export const channelIcon: Record<string, typeof WhatsappLogo> = { WhatsApp: WhatsappLogo, Call: Phone, SMS: ChatText, Assign: UserPlus, "AI call": Robot };

export function Dashboard() {
  const { t, locale } = useT();
  const hot = leads.filter((l) => l.temp === "hot").sort((a, b) => b.score - a.score);
  return (
    <>
      <div className="relative mb-6 overflow-hidden rounded-[22px] bg-tile text-white">
        <Image src={img("skylineDusk", 1600)} alt="" fill sizes="(min-width:1024px) 1100px, 100vw" className="object-cover opacity-55" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent rtl:bg-gradient-to-l" />
        <div className="relative px-6 py-8 sm:px-10 sm:py-12">
          <p className="text-[15px] text-white/70">{t("Good evening")}, {workspace.user.first}</p>
          <h1 className="mt-2 max-w-[22ch] text-[30px] font-semibold leading-[1.08] tracking-[-0.024em] sm:text-[40px]">
            {t("While you were out, Observer booked 3 viewings and woke up 214 quiet leads.")}
          </h1>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-white/80">
            <span className="flex items-center gap-2"><Dot live /> {t("247 leads in view")}</span>
            <span><b className="tnum font-semibold text-white">34</b> {t("hot right now")}</span>
            <span><b className="tnum font-semibold text-white">AED 4.2M</b> {t("in pipeline")}</span>
          </div>
        </div>
      </div>

      <Stats>
        <Stat label="Total leads" value="247" delta="+18" note="this week" />
        <Stat label="Hot leads" value="34" delta="+5" note="today" />
        <Stat label="Viewings booked" value="21" delta="61.7%" note="booking rate" />
        <Stat label="Average first reply" value="4m" note="from enquiry to WhatsApp" />
      </Stats>
      <Stats>
        <Stat label="Average lead score" value="78" note="up from 61 last month" />
        <Stat label="WhatsApp open rate" value="89%" note="email: 28%" />
        <Stat label="Pipeline" value="AED 4.2M" delta="+12%" note="month on month" />
        <Stat label="Cost per lead" value="AED 42" delta="−18%" down note="vs last month" />
      </Stats>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHead title="Hot leads to call now" aside={<Link className="t-caption text-creek hover:underline" href={`/${locale}/app/leads`}>{t("See all leads")}</Link>} />
          <ul className="divide-y divide-hairline-soft">
            {hot.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-3">
                <Monogram name={l.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{l.name}</p>
                  <p className="t-caption truncate text-ink-2">{t(l.type)} · {l.area} · {l.budget} · {t(l.financing)}</p>
                </div>
                <span className="hidden sm:block"><ScoreBar score={l.score} /></span>
                <span className="t-caption hidden w-10 text-end text-ink-3 md:block">{l.lastContact}</span>
                <Btn variant="secondary" label={`${t("Call")} ${l.name}`} className="w-9 px-0"><Phone size={16} /></Btn>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHead title="What Observer did" aside={<span className="t-caption flex items-center gap-1.5 text-ink-2"><Dot live />{t("Live")}</span>} />
          <ol className="space-y-4">
            {activity.map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5"><Dot tone={a.tone} /></span>
                <p className="min-w-0 flex-1 text-[15px] leading-snug">
                  {a.who && <b className="font-medium">{a.who} </b>}
                  <span className="text-ink-2">{t(a.text)}</span>
                </p>
                <span className="t-caption text-ink-3">{a.time}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHead title="New leads, last 14 days" sub="One bar per day. Today is highlighted." />
          <Bars data={dailyLeads} height={150} labels={[t("2 weeks ago"), t("Today")]} />
        </Card>
        <Card>
          <CardHead title="Lead temperature" sub="All 247 leads, scored" />
          <TempSplit />
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHead title="Next best actions" aside={<Link className="t-caption text-creek hover:underline" href={`/${locale}/app/next-best-action`}>{t("See all")}</Link>} />
          <ul className="space-y-3">
            {nba.slice(0, 3).map((a) => {
              const Icon = channelIcon[a.channel] ?? Lightning;
              return (
                <li key={a.lead} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-creek-soft text-creek"><Icon size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{t(a.action)}</p>
                    <p className="t-caption text-ink-2">{a.lead}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <CardHead title="Agents today" />
          <ul className="space-y-3">
            {agents.slice(0, 4).map((a) => (
              <li key={a.name} className="flex items-center gap-3">
                <Monogram name={a.name} size={32} />
                <span className="flex-1 truncate text-[15px]">{a.name}</span>
                <span className="t-caption tnum text-ink-2">{a.booked} {t("booked")}</span>
                <Dot tone={a.status === "online" ? "ok" : a.status === "busy" ? "warm" : "cold"} />
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHead title="Channel mix today" />
          {[
            ["WhatsApp", 46, "ok"], ["Bayut", 22, "hot"], ["Property Finder", 17, "cold"], ["Social", 10, "creek"], ["Referral", 5, "warm"],
          ].map(([n, v, tone]) => (
            <div key={n as string} className="mb-3">
              <div className="mb-1 flex justify-between text-[14px]"><span>{n}</span><span className="tnum text-ink-2">{v}%</span></div>
              <Meter value={(v as number) * 2} tone={tone as "ok"} />
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

function TempSplit() {
  const { t } = useT();
  const parts: [string, number, string][] = [["Hot", 34, "var(--hot)"], ["Warm", 89, "var(--warm)"], ["Cold", 124, "var(--cold)"]];
  const total = 247;
  let acc = 0;
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 140 140" className="size-36 -rotate-90" role="img" aria-label={t("Lead temperature")}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--hairline-soft)" strokeWidth="16" />
        {parts.map(([k, n, col]) => {
          const len = (n / total) * c;
          const el = <circle key={k} cx="70" cy="70" r={r} fill="none" stroke={col} strokeWidth="16" strokeDasharray={`${len - 2} ${c}`} strokeDashoffset={-acc} />;
          acc += len;
          return el;
        })}
      </svg>
      <ul className="space-y-2.5">
        {parts.map(([k, n, col]) => (
          <li key={k} className="flex items-center gap-2.5 text-[15px]">
            <span className="size-2.5 rounded-full" style={{ background: col }} />
            <span className="w-14">{t(k)}</span>
            <b className="tnum font-semibold">{n}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Pipeline() {
  const { t } = useT();
  const stages = Object.keys(kanban);
  const prob: Record<string, number> = { New: 10, Qualified: 30, "Meeting Set": 60, "Offer Stage": 85, "Closed Won": 100 };
  return (
    <>
      <PageHead title="Pipeline" sub="Every deal by stage, weighted by how likely it is to close." />
      <Stats>
        <Stat label="Weighted pipeline" value="AED 6.84M" />
        <Stat label="Best case" value="AED 12.2M" />
        <Stat label="Commit" value="AED 4.1M" />
        <Stat label="Average deal" value="AED 2.44M" />
      </Stats>
      <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {stages.map((s) => (
          <section key={s} className="w-[280px] shrink-0 snap-start rounded-[18px] bg-pearl p-3">
            <header className="flex items-center justify-between px-2 pb-3 pt-1">
              <h2 className="text-[15px] font-semibold">{t(s)}</h2>
              <span className="t-caption tnum text-ink-2">{kanban[s].length} · {prob[s]}%</span>
            </header>
            <ul className="space-y-2">
              {kanban[s].map((d) => (
                <li key={d.name} className="lift rounded-[14px] border border-hairline-soft bg-canvas p-3.5">
                  <div className="flex items-center gap-2.5">
                    <Monogram name={d.name} size={30} />
                    <p className="flex-1 truncate text-[15px] font-medium">{d.name}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="tnum text-[15px] font-semibold">{d.value}</span>
                    <TempBadge temp={d.temp} />
                  </div>
                  <p className="t-caption mt-2 text-ink-3">{t(d.type)} · {t(d.time)}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

type Filter = "all" | Temp | "buyer" | "seller";

export function Leads() {
  const { t } = useT();
  const [f, setF] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);
  const rows = useMemo(() => leads.filter((l) => f === "all" || l.temp === f || l.type.toLowerCase() === f).sort((a, b) => b.score - a.score), [f]);
  const sel = leads.find((l) => l.id === open);
  return (
    <>
      <PageHead title="All leads" sub="Sorted by score. Select a lead to see why Observer scored them that way." />
      <Card>
        <div className="mb-4">
          <Segmented<Filter>
            label="Filter leads"
            value={f}
            onChange={setF}
            options={[
              { value: "all", label: "All" }, { value: "hot", label: "Hot" }, { value: "warm", label: "Warm" },
              { value: "cold", label: "Cold" }, { value: "buyer", label: "Buyers" }, { value: "seller", label: "Sellers" },
            ]}
          />
        </div>
        <Table head={["Lead", "Source", "Score", "Temperature", "Budget", "Agent", "Last contact"]} minWidth={820}>
          {rows.map((l) => (
            <tr key={l.id} className="cursor-pointer hover:bg-pearl" onClick={() => setOpen(l.id)}>
              <td>
                <button className="flex items-center gap-3 text-start" onClick={() => setOpen(l.id)}>
                  <Monogram name={l.name} size={32} />
                  <span><span className="block font-medium">{l.name}</span><span className="t-caption text-ink-2">{t(l.type)} · {l.area}</span></span>
                </button>
              </td>
              <td className="text-ink-2">{l.source}</td>
              <td><ScoreBar score={l.score} /></td>
              <td><TempBadge temp={l.temp} /></td>
              <td className="tnum">{l.budget}</td>
              <td className={cx(l.agent === "Unassigned" && "text-hot")}>{t(l.agent)}</td>
              <td className="tnum text-ink-2">{l.lastContact}</td>
            </tr>
          ))}
        </Table>
      </Card>
      {sel && <LeadDrawer lead={sel} onClose={() => setOpen(null)} />}
    </>
  );
}

import { scoreLead } from "@/lib/engine";
import { X } from "@phosphor-icons/react";
function LeadDrawer({ lead, onClose }: { lead: (typeof leads)[number]; onClose: () => void }) {
  const { t } = useT();
  const s = scoreLead(lead);
  const p = PROPERTY[lead.area];
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={lead.name}>
      <button className="absolute inset-0 bg-black/30" aria-label={t("Close")} onClick={onClose} />
      <aside className="absolute inset-y-0 end-0 w-full max-w-[440px] overflow-y-auto bg-canvas p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Monogram name={lead.name} size={48} />
            <div>
              <h2 className="text-[21px] font-semibold tracking-[-0.016em]">{lead.name}</h2>
              <p className="t-caption text-ink-2">{lead.phone} · {lead.source}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex size-9 items-center justify-center rounded-full hover:bg-parchment" aria-label={t("Close")}><X size={18} /></button>
        </div>
        {p && (
          <div className="zoom-frame relative mt-5 aspect-[16/9] overflow-hidden rounded-[14px]">
            <Image src={img(p.photo, 900)} alt={`${p.type}, ${p.label}`} fill sizes="440px" className="object-cover" />
          </div>
        )}
        {p && <p className="t-caption mt-2 text-ink-2">{t("Best match")}: {t(p.type)} · {p.label} · {lead.budget}</p>}
        <div className="mt-6 flex items-end gap-3">
          <span className="tnum text-[56px] font-semibold leading-none tracking-[-0.03em]">{s.score}</span>
          <div className="pb-1"><TempBadge temp={s.temp} /></div>
        </div>
        <h3 className="mt-6 text-[15px] font-semibold">{t("Why this score")}</h3>
        <ul className="mt-3 space-y-2.5">
          {s.parts.map((x) => (
            <li key={x.label} className="grid grid-cols-[120px_1fr_44px] items-center gap-3 text-[14px]">
              <span className="text-ink-2">{t(x.label)}</span>
              <Meter value={(x.pts / x.max) * 100} />
              <span className="tnum text-end">+{x.pts}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
          {[["Budget", lead.budget], ["Financing", t(lead.financing)], ["Moving within", lead.timeframe], ["Area", lead.area], ["Stage", t(lead.status)], ["Agent", t(lead.agent)]].map(([k, v]) => (
            <div key={k}><dt className="text-ink-2">{t(k)}</dt><dd className="font-medium">{v}</dd></div>
          ))}
        </dl>
        <div className="mt-7 flex gap-2">
          <Btn className="flex-1"><WhatsappLogo size={16} /> {t("Message")}</Btn>
          <Btn variant="secondary" className="flex-1"><Phone size={16} /> {t("Call")}</Btn>
        </div>
        <p className="mt-4"><Pill tone="creek"><CaretRight size={12} className="rtl:-scale-x-100" />{t("Observer suggests: book a viewing this week")}</Pill></p>
      </aside>
    </div>
  );
}
