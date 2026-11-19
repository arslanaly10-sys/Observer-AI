"use client";
import { useState } from "react";
import { ArrowSquareOut, Info } from "@phosphor-icons/react";
import { useT } from "../i18n";
import { Card, CardHead, PageHead, Pill, Segmented, cx } from "../ui";
import { field, labelCls } from "@/components/workspace/forms";
import { COUNTRIES, MARKETS_2025, RULES, GCC_DEVELOPERS, GCC_SOURCES, GCC_AS_OF, gccCosts, type Country, type GccSource } from "@/lib/market/gcc";

function Sources({ keys }: { keys: GccSource[] }) {
  const { t } = useT();
  if (!keys.length) return null;
  return (
    <ul className="t-fine mt-2 space-y-0.5 text-ink-3">
      {keys.map((k) => <li key={k}><a href={GCC_SOURCES[k].url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-ink hover:underline">{t("Source")}: {GCC_SOURCES[k].name}<ArrowSquareOut size={11} /></a></li>)}
    </ul>
  );
}

const num = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

/** Buying costs and lending limits for any GCC country. Shown on GCC intelligence and the calculator. */
export function GccCosts() {
  const { t, locale } = useT();
  const [country, setCountry] = useState<Country>("ksa");
  const [price, setPrice] = useState("1500000");
  const [first, setFirst] = useState(false);
  const [quick, setQuick] = useState(false);
  const c = COUNTRIES.find((x) => x.id === country)!;
  const value = Number(price.replace(/[^0-9.]/g, "")) || 0;
  const r = gccCosts(country, value, { firstHomeCitizen: first, within60Days: quick });
  const rules = country === "uae" ? null : RULES[country];
  return (
    <Card>
      <CardHead title="Buying costs across the GCC" sub="Fees and taxes on top of the price, by country. Where we couldn't confirm a rule, we say so instead of guessing." />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelCls}>{t("Country")}<select value={country} onChange={(e) => { setCountry(e.target.value as Country); setFirst(false); setQuick(false); }} className={field}>{COUNTRIES.map((x) => <option key={x.id} value={x.id}>{locale === "ar" ? x.nameAr : x.name}</option>)}</select></label>
        <label className={labelCls}>{t("Price")} ({c.currency})<input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" dir="ltr" className={field} /></label>
      </div>
      {country === "ksa" && <label className="mt-3 flex items-center gap-2 text-[14px]"><input type="checkbox" checked={first} onChange={(e) => setFirst(e.target.checked)} className="size-4" />{t("Saudi citizen buying a first home")}</label>}
      {country === "bahrain" && <label className="mt-3 flex items-center gap-2 text-[14px]"><input type="checkbox" checked={quick} onChange={(e) => setQuick(e.target.checked)} className="size-4" />{t("Registered within 60 days of signing")}</label>}
      {country === "uae" && <p className="t-caption mt-3 text-ink-2">{t("Shown for a ready home in Dubai. The broker calculator covers every emirate, off-plan, mortgages and resale.")}</p>}
      {!r.confirmed ? (
        <p className="mt-4 flex items-start gap-2 rounded-[12px] bg-parchment px-3 py-2.5 text-[14px]"><Info size={18} className="mt-0.5 shrink-0 text-warm" />{t("We couldn't confirm buying costs for this country from a reliable source. Check with the land registry before quoting a client.")}</p>
      ) : (
        <ul className="mt-4 divide-y divide-hairline-soft text-[14px]">
          {r.lines.map((l) => (
            <li key={l.label} className="py-2.5">
              <span className="flex justify-between gap-3"><span>{t(l.label)}</span><b className="tnum" dir="ltr">{c.currency} {num(l.amount)}</b></span>
              {l.note && <span className="t-caption block text-ink-2">{t(l.note)}</span>}
            </li>
          ))}
          <li className="flex justify-between gap-3 py-2.5 font-semibold"><span>{t("Total on top of the price")}</span><span className="tnum" dir="ltr">{c.currency} {num(r.fees)}</span></li>
        </ul>
      )}
      {rules?.ltv && (
        <div className="mt-4">
          <p className="font-medium">{t("How much a bank can lend")}</p>
          <ul className="mt-1.5 space-y-1.5 text-[14px]">
            {rules.ltv.map((l) => <li key={l.line} className="flex items-start gap-2">{locale === "ar" ? l.lineAr : l.line}{!l.confirmed && <Pill tone="warm">{t("not confirmed")}</Pill>}</li>)}
          </ul>
        </div>
      )}
      {rules?.ownership && <p className="t-caption mt-3 text-ink-2">{locale === "ar" ? rules.ownershipAr : rules.ownership}</p>}
      {rules && <Sources keys={rules.sources} />}
      <p className="t-fine mt-3 text-ink-3">{t("Estimates from public sources, checked")} {t(GCC_AS_OF)}. {t("Yield and appreciation are never added together as a “return”.")}</p>
    </Card>
  );
}

/** Six GCC markets with sourced 2025 figures, the leading developers, and buying costs per country. */
export function GccIntel() {
  const { t, locale } = useT();
  const [country, setCountry] = useState<"all" | Country>("all");
  const ar = locale === "ar";
  const markets = MARKETS_2025.filter((m) => country === "all" || m.country === country);
  const devs = GCC_DEVELOPERS.filter((d) => country === "all" || d.country === country);
  return (
    <>
      <PageHead title="GCC intelligence" sub={`${t("Six markets, with 2025 figures from land registries and named analyses. Every number links to its source. There's no GCC-wide total: each market measures different things, in its own currency. Checked")} ${t(GCC_AS_OF)}.`} />
      <div className="mb-5">
        <Segmented label="Country" value={country} onChange={setCountry} options={[{ value: "all", label: "All six" }, ...COUNTRIES.map((c) => ({ value: c.id, label: ar ? c.nameAr : c.name }))]} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {markets.map((m) => (
          <Card key={m.market}>
            <p className="t-eyebrow text-ink-3">{ar ? m.marketAr : m.market}</p>
            <p className="tnum mt-2 text-[30px] font-semibold leading-none tracking-[-0.025em]"><bdi>{m.currency} {num(m.valueBn!)}</bdi>{t("bn")}</p>
            {m.deals && <p className="t-caption mt-1.5 text-ink-2"><span className="tnum">{m.deals.toLocaleString("en-US")}</span> {t("transactions")}</p>}
            <p className="mt-3 text-[13.5px]">{ar ? m.scopeAr : m.scope}</p>
            {m.estimate && <span className="mt-2 inline-block"><Pill tone="warm">{t("Estimate, not official")}</Pill></span>}
            {m.note && <p className="t-caption mt-2 text-ink-2">{ar ? m.noteAr : m.note}</p>}
            <Sources keys={m.sources} />
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHead title="Leading developers and flagship projects" sub="Names and flagship projects only, as each developer markets them. No counts or values we couldn't verify, and no claim any of them uses Observer." />
          <ul className="divide-y divide-hairline-soft">
            {devs.map((d) => (
              <li key={d.name} className="py-3">
                <p className="flex flex-wrap items-center gap-2"><b className="font-medium">{ar ? d.nameAr : d.name}</b><span className="t-caption text-ink-3">{ar ? COUNTRIES.find((c) => c.id === d.country)!.nameAr : COUNTRIES.find((c) => c.id === d.country)!.name}</span></p>
                <p className={cx("mt-1.5 flex flex-wrap gap-1.5")}>{d.flagship.map((f) => <span key={f} className="rounded-full bg-parchment px-2.5 py-0.5 text-[12.5px]">{t(f)}</span>)}</p>
              </li>
            ))}
          </ul>
        </Card>
        <GccCosts />
      </div>
    </>
  );
}
