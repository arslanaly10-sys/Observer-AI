import { Fragment } from "react";
import { workspaceContext } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { Card, CardHead, PageHead } from "@/components/app/ui";
import { MarketTables } from "@/components/market/MarketTables";
import { AREAS, DEVELOPERS, EMIRATES, FEES, COMMON, MORTGAGE, RATES, GOLDEN_VISA, SOURCES, AS_OF, type SourceKey } from "@/lib/market/uae";

const range = (r: [number, number] | null | undefined, unit = "") => (!r ? "—" : r[0] === r[1] ? `${r[0]}${unit}` : `${r[0]}–${r[1]}${unit}`);

export default async function MarketPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = makeT(locale);
  await workspaceContext(locale);
  const used = new Set<SourceKey>([...AREAS.flatMap((a) => a.sources), ...DEVELOPERS.flatMap((d) => d.sources), ...FEES.dubai.sources, ...MORTGAGE.sources, ...RATES.sources, ...GOLDEN_VISA.sources, ...COMMON.sources]);
  return (
    <>
      <PageHead title={t("UAE market")} sub={`${t("The market data the AI uses with clients. Indicative ranges from public sources, checked")} ${AS_OF}. ${t("Quote them as ranges, not prices.")}`} />
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
            <dt className="text-ink-2">{t("UAE national, first home up to AED 5M")} <span className="text-warm">({t("not confirmed")})</span></dt><dd className="tnum">{MORTGAGE.ltv.nationalFirstUnder5m}%</dd>
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

      <div className="mt-5"><MarketTables /></div>

      <Card className="mt-5">
        <CardHead title="Sources" sub="Public pages these figures come from. Sources often disagree; check before you commit a client." />
        <ul className="grid gap-1.5 text-[14px] md:grid-cols-2">
          {[...used].map((k) => <li key={k}><a href={SOURCES[k].url} target="_blank" rel="noopener noreferrer" className="text-creek hover:underline">{SOURCES[k].name}</a></li>)}
        </ul>
      </Card>
    </>
  );
}
