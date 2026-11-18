"use client";
import Image from "next/image";
import Link from "next/link";
import { RocketLaunch, Sparkle, ArrowRight } from "@phosphor-icons/react";
import { img } from "@/lib/img";
import { useT } from "../i18n";
import { Card, CardHead, PageHead, Stat, Stats, Meter, Pill, Dot } from "../ui";
import { group, kpi, projects, deals, aiEvents, ledger } from "@/lib/demo/group";

export const aed = (m: number) => (m >= 1000 ? `AED ${(m / 1000).toFixed(1)}B` : m >= 1 ? `AED ${m.toFixed(m >= 10 ? 0 : 1)}M` : `AED ${Math.round(m * 1000)}K`);

/** Chairman's home: the group on one page. */
export function Board() {
  const { t, locale } = useT();
  const pending = aiEvents.filter((e) => e.approval);
  const top = [...deals].sort((a, b) => b.value - a.value).slice(0, 5);
  return (
    <>
      <section className="relative isolate mb-6 overflow-hidden bg-black text-white">
        <Image src={img("palmAerial", 1800)} alt="" fill priority sizes="(min-width:1024px) 1100px, 100vw" className="-z-10 object-cover opacity-55" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/70 to-black/10 rtl:bg-gradient-to-l" />
        <div className="p-6 sm:p-10 lg:p-12">
          <p className="t-eyebrow !text-[#cdb284]">{t("Good evening")}, {t("Rashid")} · {t(group.name)}</p>
          <h1 className="mt-4 max-w-[18ch] text-[40px] leading-[1] sm:text-[60px]">{t("AED 1.02 billion sold this month. Riyadh Gate opens at nine.")}</h1>
          <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-[14px] text-white/75">
            <span><b className="tnum font-semibold text-white">{kpi.enquiries.toLocaleString("en")}</b> {t("enquiries this month")}</span>
            <span><b className="tnum font-semibold text-white">{kpi.medianReply}s</b> {t("median first reply")}</span>
            <span><b className="tnum font-semibold text-white">{kpi.agentsOnline}</b> {t("consultants online")}</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/app/launch`} className="btn bg-[#cdb284] text-[#15120e] hover:bg-[#e0c99f]"><RocketLaunch size={18} weight="fill" />{t("Open launch night")}</Link>
            <Link href={`/${locale}/app/ai-activity`} className="btn btn-ghost btn-on-dark !px-5"><span>{pending.length} {t("AI actions await approval")}</span></Link>
          </div>
        </div>
      </section>

      <Stats>
        <Stat label="Sales this year" value={`AED ${kpi.salesYTD}B`} delta="+18%" note="on last year" />
        <Stat label="Open pipeline" value={`AED ${kpi.pipeline}B`} note="across 12 projects" />
        <Stat label="SPAs signed this month" value={kpi.spas} delta="+41" note="on October" />
        <Stat label="First replies by AI" value={`${kpi.aiFirstReplies}%`} note={`median ${kpi.medianReply} seconds`} />
      </Stats>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHead title="Projects" sub="Own developments and partner launches, sell-through to date" aside={<Link href={`/${locale}/app/projects`} className="t-caption text-creek hover:underline">{t("Inventory")}</Link>} />
          <ul className="divide-y divide-hairline-soft">
            {projects.map((p) => (
              <li key={p.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_110px_auto]">
                <div className="min-w-0">
                  <p className="truncate font-medium">{t(p.name)}</p>
                  <p className="t-caption truncate text-ink-2">{p.own ? t("Nawafir development") : `${t("By")} ${t(p.developer)}`} · {t(p.area)}, {t(p.city)}</p>
                </div>
                <div className="col-span-2 flex items-center gap-3 sm:col-span-1">
                  <Meter value={p.sold} tone={p.sold >= 75 ? "hot" : "creek"} className="flex-1" />
                  <span className="tnum w-10 text-end text-[13px] text-ink-2">{p.sold}%</span>
                </div>
                <span className="tnum hidden text-[13px] text-ink-2 sm:block">{p.fromPrice}</span>
                <span className="row-start-1 sm:row-auto">{p.status === "Launching tonight" ? <Pill tone="hot"><Dot tone="hot" live />{t("Tonight")}</Pill> : p.status === "Sold out soon" ? <Pill tone="warm">{t("Last units")}</Pill> : <Pill tone="ok">{t("Selling")}</Pill>}</span>
              </li>
            ))}
          </ul>
          <p className="t-fine mt-3 text-ink-3">{t("Partner developers' projects are shown by name as market data, with indicative prices.")}</p>
        </Card>

        <div className="grid content-start gap-5">
          <Card>
            <CardHead title="Sales by market" sub="Share of this year's sales value" />
            <ul className="space-y-3">
              {group.markets.map((m) => (
                <li key={m.city}>
                  <div className="mb-1 flex justify-between text-[14px]"><span>{t(m.city)}</span><span className="tnum text-ink-2">{m.share}% · AED {((kpi.salesYTD * m.share) / 100).toFixed(1)}B</span></div>
                  <Meter value={m.share} />
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHead title="Largest deals this week" />
            <ul className="divide-y divide-hairline-soft">
              {top.map((d) => (
                <li key={d.client} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="pii truncate text-[14.5px] font-medium">{d.client}</p>
                    <p className="t-caption truncate text-ink-2">{t(d.project)} · {t(d.stage)}</p>
                  </div>
                  <span className="tnum text-[14px] font-semibold">{aed(d.value)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHead title="Waiting for your approval" sub="The AI asks first on holds, prices and VIP clients" aside={<Link href={`/${locale}/app/ai-activity`} className="t-caption text-creek hover:underline">{t("Review all")}</Link>} />
          <ul className="space-y-3">
            {pending.map((e) => (
              <li key={e.id} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center bg-creek-soft text-creek"><Sparkle size={16} weight="fill" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] leading-snug">{t(e.text)}</p>
                  <p className="t-caption mt-0.5 text-ink-2"><span className="pii">{e.client}</span> · {t(e.time)}</p>
                </div>
                <Pill tone={e.risk === "high" ? "hot" : "warm"}>{t(e.risk === "high" ? "Price" : "Hold")}</Pill>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHead title="The AI this month" sub="What it did, and what it was worth" aside={<Link href={`/${locale}/app/voice`} className="t-caption text-creek hover:underline">{t("Ledger")}</Link>} />
          <dl className="grid grid-cols-2 gap-4">
            {([
              [ledger.conversations.toLocaleString("en"), "conversations handled"],
              [ledger.hoursSaved.toLocaleString("en"), "consultant hours saved"],
              [ledger.revived.toLocaleString("en"), "quiet leads revived"],
              [`AED ${ledger.attributedM}M`, "sales it touched"],
            ] as [string, string][]).map(([n, l]) => (
              <div key={l} className="border-t border-hairline pt-3">
                <dd className="tnum text-[26px] font-semibold leading-none tracking-[-0.02em]">{n}</dd>
                <dt className="t-caption mt-1.5 text-ink-2">{t(l)}</dt>
              </div>
            ))}
          </dl>
          <Link href={`/${locale}/app/voice`} className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-creek hover:underline">{t("Listen to tonight's calls")}<ArrowRight size={14} className="rtl:-scale-x-100" /></Link>
        </Card>
      </div>
    </>
  );
}
