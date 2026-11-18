"use client";
import { useState } from "react";
import { useT } from "@/components/app/i18n";
import { Pill } from "@/components/app/ui";
import { TabList } from "@/components/app/TabList";
import { AREAS, DEVELOPERS, EMIRATES, dataAge, type Emirate } from "@/lib/market/uae";

const range = (r: [number, number] | null | undefined, unit = "") =>
  !r ? "—" : r[0] === r[1] ? `${r[0].toLocaleString("en-US")}${unit}` : `${r[0].toLocaleString("en-US")}–${r[1].toLocaleString("en-US")}${unit}`;
const PH: Record<string, string> = { rare: "Rarely", sometimes: "On some launches", common: "Often", unknown: "Not known" };

/** Areas and developers from lib/market/uae, shared by the workspace Market page and the demo. */
export function MarketTables() {
  const { t, locale } = useT();
  const [em, setEm] = useState<"all" | Emirate>("all");
  const areas = AREAS.filter((a) => em === "all" || a.emirate === em);
  const devs = DEVELOPERS.filter((d) => em === "all" || d.emirate === em);
  const tabs: ["all" | Emirate, string][] = [["all", "All"], ["dubai", "Dubai"], ["abu_dhabi", "Abu Dhabi"], ["sharjah", "Sharjah"]];
  const age = dataAge();
  return (
    <div className="grid gap-5">
      {age.stale && <p role="note" className="rounded-[12px] bg-warm-soft px-4 py-3 text-[15px] text-warm">{t("This market data is more than three months old. Check current figures before quoting them.")} ({age.days} {t("days")})</p>}
      <TabList id="market" label={t("Emirate")} tabs={tabs.map(([v, l]) => [v, t(l)] as ["all" | Emirate, string])} value={em} onChange={setEm} />
      <div id="market-panel" role="tabpanel" aria-labelledby={`market-tab-${em}`} className="grid gap-5">
      <section className="rounded-[18px] bg-canvas p-5 sm:p-6">
        <h2 className="text-[19px] font-semibold">{t("Areas")}</h2>
        <p className="t-caption mb-4 text-ink-2">{t("Price per sq ft and gross rental yield. Ranges, because sources measure differently.")}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-[14px]">
            <thead><tr className="t-caption text-ink-2">{["Area", "Emirate", "Type", "AED per sq ft", "Gross yield", "Service charge / sq ft"].map((h) => <th key={h} className="pb-2 text-start font-normal">{t(h)}</th>)}</tr></thead>
            <tbody>
              {areas.map((a) => (
                <tr key={a.id} className="border-t border-hairline-soft align-top">
                  <td className="py-2.5 font-medium">{locale === "ar" ? a.nameAr : a.name}{a.note && <span className="t-fine block font-normal text-ink-3">{locale === "ar" ? a.noteAr ?? a.note : a.note}</span>}</td>
                  <td>{t(EMIRATES[a.emirate])}</td><td>{t(a.type === "apartments" ? "Apartments" : a.type === "villas" ? "Villas" : "Mixed")}</td>
                  <td className="tnum" dir="ltr">{range(a.pricePsf)}</td><td className="tnum" dir="ltr">{range(a.yieldPct, "%")}</td><td className="tnum" dir="ltr">{range(a.serviceChargePsf)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-[18px] bg-canvas p-5 sm:p-6">
        <h2 className="text-[19px] font-semibold">{t("Developers")}</h2>
        <p className="t-caption mb-4 text-ink-2">{t("Who builds what, and the payment plans they usually offer. Every launch sets its own terms.")}</p>
        <ul className="grid gap-3 md:grid-cols-2">
          {devs.map((d) => (
            <li key={d.id} className="rounded-[14px] bg-parchment p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[16px] font-semibold">{d.name}</span>
                <Pill tone="cold">{t(EMIRATES[d.emirate])}</Pill>
                <Pill tone={d.postHandover === "common" ? "ok" : d.postHandover === "sometimes" ? "warm" : d.postHandover === "unknown" ? "cold" : "creek"}>{t("Post-handover")}: {t(PH[d.postHandover])}</Pill>
                {d.salesJanAug2026Bn && <span className="t-caption text-ink-2">AED {d.salesJanAug2026Bn}bn {t("sold Jan–Aug 2026")}</span>}
              </div>
              <p className="mt-1.5 text-[14px] text-ink-2">{locale === "ar" ? d.knownForAr : d.knownFor}</p>
              <p className="mt-1 text-[14px]"><b className="font-medium">{t("Usual plans")}:</b> {locale === "ar" ? d.plansAr : d.plans}</p>
            </li>
          ))}
        </ul>
      </section>
      </div>
    </div>
  );
}
