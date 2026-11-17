import { Fragment } from "react";
import { workspaceContext } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { Card, CardHead, PageHead, Pill } from "@/components/app/ui";
import { AREAS, DEVELOPERS, EMIRATES, FEES, COMMON, MORTGAGE, RATES, GOLDEN_VISA, SOURCES, AS_OF, type SourceKey } from "@/lib/market/uae";

const range = (r: [number, number] | null | undefined, unit = "") => (r ? `${r[0].toLocaleString("en-US")}–${r[1].toLocaleString("en-US")}${unit}` : "—");

export default async function MarketPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = makeT(locale);
  await workspaceContext(locale);
  const ar = locale === "ar";
  const used = new Set<SourceKey>([...AREAS.flatMap((a) => a.sources), ...DEVELOPERS.flatMap((d) => d.sources), ...FEES.dubai.sources, ...MORTGAGE.sources, ...RATES.sources, ...GOLDEN_VISA.sources, ...COMMON.sources]);
  const ph: Record<string, string> = { rare: "Rarely", sometimes: "On some launches", common: "Often" };
  return (
    <>
      <PageHead title={t("UAE market")} sub={`${t("What the AI knows about the market, and you can quote with care. Indicative ranges from public sources, checked")} ${AS_OF}.`} />
      <div className="grid gap-5 xl:grid-cols-3">
        <Card>
          <CardHead title="Buying fees" />
          <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-[14px]">
            {(Object.keys(FEES) as (keyof typeof FEES)[]).map((e) => (<Fragment key={e}><dt className="text-ink-2">{t(EMIRATES[e])} {t("transfer fee")}</dt><dd className="tnum">{FEES[e].transferPct}%</dd></Fragment>))}
            <dt className="text-ink-2">{t("Dubai trustee fee")}</dt><dd className="tnum" dir="ltr">AED 2,000 / 4,000 + VAT</dd>
            <dt className="text-ink-2">{t("Mortgage registration (Dubai)")}</dt><dd className="tnum" dir="ltr">0.25% + AED 290</dd>
            <dt className="text-ink-2">{t("Agency commission (resale)")}</dt><dd className="tnum">{COMMON.agencyPct}% + VAT</dd>
            <dt className="text-ink-2">{t("Rental agency fee")}</dt><dd className="tnum">{COMMON.rentalAgencyPct}%</dd>
          </dl>
        </Card>
        <Card>
          <CardHead title="Mortgage rules" />
          <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-[14px]">
            <dt className="text-ink-2">{t("Expat, first home up to AED 5M")}</dt><dd className="tnum">{MORTGAGE.ltv.expatFirstUnder5m}%</dd>
            <dt className="text-ink-2">{t("Expat, first home over AED 5M")}</dt><dd className="tnum">{MORTGAGE.ltv.expatFirstOver5m}%</dd>
            <dt className="text-ink-2">{t("UAE national, first home up to AED 5M")}</dt><dd className="tnum">{MORTGAGE.ltv.nationalFirstUnder5m}%</dd>
            <dt className="text-ink-2">{t("Off-plan")}</dt><dd className="tnum">{MORTGAGE.ltv.offPlan}%</dd>
            <dt className="text-ink-2">{t("Debt burden cap")}</dt><dd className="tnum">{MORTGAGE.dbrMaxPct}%</dd>
            <dt className="text-ink-2">{t("Longest term")}</dt><dd className="tnum">{MORTGAGE.maxYears} {t("years")}</dd>
          </dl>
          <p className="t-fine mt-3 text-ink-3">{t(MORTGAGE.note)}</p>
        </Card>
        <Card>
          <CardHead title="Rates and visas" />
          <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-[14px]">
            <dt className="text-ink-2">{t("Central Bank base rate")}</dt><dd className="tnum">{RATES.baseRatePct}%</dd>
            <dt className="text-ink-2">{t("3-month EIBOR")} ({RATES.eiborDate})</dt><dd className="tnum">{RATES.eibor3mPct}%</dd>
            <dt className="text-ink-2">{t("Typical fixed rates")}</dt><dd className="tnum">{range(RATES.fixedRangePct, "%")}</dd>
            <dt className="text-ink-2">{t("Golden Visa through property")}</dt><dd className="tnum" dir="ltr">AED 2M+</dd>
          </dl>
          <p className="t-fine mt-3 text-ink-3">{t(GOLDEN_VISA.note)}</p>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHead title="Areas" sub="Price per sq ft and gross rental yield. Ranges, because sources measure differently." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[14px]">
            <thead><tr className="t-caption text-ink-2">{["Area", "Emirate", "Type", "AED per sq ft", "Gross yield", "Service charge / sq ft"].map((h) => <th key={h} className="pb-2 text-start font-normal">{t(h)}</th>)}</tr></thead>
            <tbody>
              {AREAS.map((a) => (
                <tr key={a.id} className="border-t border-hairline-soft align-top">
                  <td className="py-2.5 font-medium">{ar ? a.nameAr : a.name}{a.note && <span className="t-fine block font-normal text-ink-3">{a.note}</span>}</td>
                  <td>{t(EMIRATES[a.emirate])}</td><td>{t(a.type === "apartments" ? "Apartments" : a.type === "villas" ? "Villas" : "Mixed")}</td>
                  <td className="tnum" dir="ltr">{range(a.pricePsf)}</td><td className="tnum" dir="ltr">{range(a.yieldPct, "%")}</td><td className="tnum" dir="ltr">{range(a.serviceChargePsf)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-5">
        <CardHead title="Developers" sub="Who builds what, and the payment plans they usually offer. Every launch sets its own terms." />
        <ul className="grid gap-3 md:grid-cols-2">
          {DEVELOPERS.map((d) => (
            <li key={d.id} className="rounded-[14px] bg-parchment p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[16px] font-semibold">{d.name}</span>
                <Pill tone="cold">{t(EMIRATES[d.emirate])}</Pill>
                <Pill tone={d.postHandover === "common" ? "ok" : d.postHandover === "sometimes" ? "warm" : "creek"}>{t("Post-handover")}: {t(ph[d.postHandover])}</Pill>
                {d.salesJanAug2026Bn && <span className="t-caption text-ink-2">AED {d.salesJanAug2026Bn}bn {t("sold Jan–Aug 2026")}</span>}
              </div>
              <p className="mt-1.5 text-[14px] text-ink-2">{d.knownFor}</p>
              <p className="mt-1 text-[14px]"><b className="font-medium">{t("Usual plans")}:</b> {d.plans}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-5">
        <CardHead title="Sources" sub="Public pages these figures come from. Sources often disagree; check before you commit a client." />
        <ul className="grid gap-1.5 text-[14px] md:grid-cols-2">
          {[...used].map((k) => <li key={k}><a href={SOURCES[k].url} target="_blank" rel="noopener noreferrer" className="text-creek hover:underline">{SOURCES[k].name}</a></li>)}
        </ul>
      </Card>
    </>
  );
}
