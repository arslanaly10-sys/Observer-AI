"use client";
import { useMemo, useState, useTransition } from "react";
import { Copy, Check, PaperPlaneTilt } from "@phosphor-icons/react";
import { useT } from "@/components/app/i18n";
import { cx } from "@/components/app/ui";
import { field, labelCls } from "./forms";
import { purchaseCosts, mortgageEligibility, offplanSchedule, parsePlan, monthlySchedule, parseMonthlyPlan, rentalYield, commissionSplit, goldenVisaCheck } from "@/lib/market/calc";
import { AREAS, RATES, AS_OF, type Emirate } from "@/lib/market/uae";
import { fmtAED } from "@/lib/engine";
import * as G from "@/app/[locale]/workspace/growth-actions";

type Tab = "costs" | "mortgage" | "schedule" | "yield" | "commission" | "visa";
const TABS: [Tab, string][] = [["costs", "Buying costs"], ["mortgage", "Mortgage"], ["schedule", "Payment plan"], ["yield", "Rental yield"], ["commission", "Commission"], ["visa", "Golden Visa"]];
const aed = (n: number) => `AED ${Math.round(n).toLocaleString("en-US")}`;
const money = (s: string) => {
  const n = parseFloat(s.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return /m/i.test(s) ? n * 1e6 : /k/i.test(s) ? n * 1e3 : n;
};

function Num({ label, value, onChange, suffix, hint }: { label: string; value: string; onChange: (v: string) => void; suffix?: string; hint?: string }) {
  const { t } = useT();
  return (
    <label className={labelCls}>{t(label)}{hint && <span className="text-ink-3"> · {t(hint)}</span>}
      {/* Numbers read left to right in both languages, so the unit sits on the right */}
      <span className="relative block" dir="ltr">
        <input value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal" dir="ltr" className={cx(field, suffix && "pr-14")} />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 mt-[3px] -translate-y-1/2 text-[13px] text-ink-3">{suffix}</span>}
      </span>
    </label>
  );
}
function Pick<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  const { t } = useT();
  return (
    <label className={labelCls}>{t(label)}
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className={field}>{options.map(([v, l]) => <option key={v} value={v}>{t(l)}</option>)}</select>
    </label>
  );
}
/** Calculator labels carry numbers ("Transfer fee (4%)", "Construction 2 of 5"); translate the words around them. */
function useLabel() {
  const { t, locale } = useT();
  return (s: string) => {
    if (locale !== "ar") return s;
    const direct = t(s);
    if (direct !== s) return direct;
    return s
      .replace(/^Transfer fee \((.+)\)$/, "رسوم التسجيل ($1)")
      .replace(/^DLD Oqood registration \((.+)\)$/, "تسجيل أوقود لدى دائرة الأراضي ($1)")
      .replace(/^Agency commission \((.+) \+ VAT\)$/, "عمولة الوساطة ($1 + الضريبة)")
      .replace(/^Mortgage registration \((.+)\)$/, "تسجيل الرهن ($1)")
      .replace(/^Construction (\d+) of (\d+)$/, "دفعة البناء $1 من $2")
      .replace(/^Post-handover: (\d+) monthly payments$/, "بعد التسليم: $1 دفعة شهرية")
      .replace(/^Monthly (.+)%: (\d+) payments before handover$/, "$1% شهرياً: $2 دفعة قبل التسليم")
      .replace(/^Monthly (.+)%: (\d+) payments after handover$/, "$1% شهرياً: $2 دفعة بعد التسليم");
  };
}

function Row({ label, value, strong, note }: { label: string; value: string; strong?: boolean; note?: string }) {
  const tl = useLabel();
  const t = tl;
  return (
    <div className={cx("flex items-baseline justify-between gap-4 border-b border-hairline-soft py-2.5", strong && "text-[17px] font-semibold")}>
      <span>{t(label)}{note && <span className="t-fine block text-ink-3">{t(note)}</span>}</span><span className="tnum shrink-0" dir="ltr">{value}</span>
    </div>
  );
}

export function Calculator({ leads, demo }: { leads: { id: string; name: string }[]; demo?: boolean }) {
  const { t, locale } = useT();
  const [tab, setTab] = useState<Tab>("costs");
  // Shared inputs
  const [price, setPrice] = useState("2,000,000");
  const [emirate, setEmirate] = useState<Emirate>("dubai");
  const [status, setStatus] = useState<"ready" | "offplan">("ready");
  const [financing, setFinancing] = useState<"cash" | "mortgage">("mortgage");
  const [residency, setResidency] = useState<"expat" | "national">("expat");
  const [income, setIncome] = useState("45,000");
  const [debts, setDebts] = useState("0");
  const [age, setAge] = useState("38");
  const [rate, setRate] = useState(String((RATES.fixedRangePct[0] + RATES.fixedRangePct[1]) / 2));
  const [plan, setPlan] = useState("10/50/40");
  const [months, setMonths] = useState("30");
  const [postMonths, setPostMonths] = useState("24");
  const [rent, setRent] = useState("130,000");
  const [size, setSize] = useState("1,100");
  const [areaId, setAreaId] = useState("marina");
  const [mgmt, setMgmt] = useState("5");
  const [commPct, setCommPct] = useState("2");
  const [coBroke, setCoBroke] = useState(true);
  const [agentShare, setAgentShare] = useState("50");

  const P = money(price);
  const area = AREAS.find((a) => a.id === areaId);
  const sc = area?.serviceChargePsf ? (area.serviceChargePsf[0] + area.serviceChargePsf[1]) / 2 : 12;

  const result = useMemo(() => {
    try {
      if (P < 50_000) return { error: "Enter a price." };
      if (tab === "costs") {
        const m = mortgageEligibility({ price: P, residency, offplan: status === "offplan", monthlyIncome: money(income) || 1e9, monthlyDebts: money(debts), age: Number(age) || 35, ratePct: Number(rate) || 4.5 });
        const c = purchaseCosts({ price: P, emirate, status, financing, loan: financing === "mortgage" ? m.maxLoanByLtv : 0 });
        return { kind: "costs" as const, c, loan: financing === "mortgage" ? m.maxLoanByLtv : 0 };
      }
      if (tab === "mortgage") return { kind: "mortgage" as const, m: mortgageEligibility({ price: P, residency, offplan: status === "offplan", monthlyIncome: money(income), monthlyDebts: money(debts), age: Number(age), ratePct: Number(rate) }) };
      if (tab === "schedule") {
        const mp = parseMonthlyPlan(plan);
        if (mp) {
          const m = monthlySchedule({ price: P, ...mp, monthsToHandover: Number(months) || 24 });
          return { kind: "schedule" as const, s: { rows: m.rows, beforeHandover: m.beforeHandover, monthlyPostHandover: 0, monthly: m.monthlyAmount, endsOn: m.endsOn } };
        }
        const p = parsePlan(plan);
        if (!p) return { error: "Write the plan like 60/40, 10/50/40, 20/40/40 post or 20% + 1% monthly." };
        return { kind: "schedule" as const, s: { ...offplanSchedule({ price: P, ...p, monthsToHandover: Number(months) || 24, postHandoverMonths: Number(postMonths) || 24 }), monthly: 0, endsOn: "" } };
      }
      if (tab === "yield") return { kind: "yield" as const, y: rentalYield({ price: P, annualRent: money(rent), sizeSqft: money(size), serviceChargePsf: sc, managementPct: Number(mgmt) || 0 }) };
      if (tab === "commission") return { kind: "commission" as const, x: commissionSplit({ price: P, ratePct: Number(commPct) || 2, coBroke, ourSharePct: 50, agentSharePct: Number(agentShare) || 0 }) };
      return { kind: "visa" as const, v: goldenVisaCheck({ value: P, mortgaged: financing === "mortgage", offplan: status === "offplan", emirate }) };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [tab, P, emirate, status, financing, residency, income, debts, age, rate, plan, months, postMonths, rent, size, sc, mgmt, commPct, coBroke, agentShare]);

  // A plain-text summary an agent can paste or send to the lead.
  const summary = useMemo(() => {
    if ("error" in result) return "";
    const head = `${t("Estimate for")} ${aed(P)} (${t("indicative, as of")} ${AS_OF}):`;
    if (result.kind === "costs") return [head, ...result.c.lines.map((l) => `• ${t(l.label)}: ${aed(l.amount)}`), `${t("Total fees")}: ${aed(result.c.fees)} (${result.c.feesPct}%)`, `${t("Cash needed")}: ${aed(result.c.cashNeeded)}`].join("\n");
    if (result.kind === "mortgage") return [head, `${t("Loan up to")}: ${aed(result.m.loan)} (${result.m.ltvPct}% ${t("loan-to-value")})`, `${t("Monthly payment")}: ${aed(result.m.payment)} ${t("over")} ${result.m.years} ${t("years at")} ${rate}%`, `${t("Down payment")}: ${aed(result.m.downPayment)}`].join("\n");
    if (result.kind === "schedule") return [head, ...result.s.rows.map((r) => `• ${r.date}: ${t(r.label)}, ${aed(r.amount)} (${r.pct}%)`)].join("\n");
    if (result.kind === "yield") return [head, `${t("Gross yield")}: ${result.y.grossPct}%`, `${t("Net yield")}: ${result.y.netPct}%`].join("\n");
    if (result.kind === "visa") return [head, result.v.likelyEligible ? t("Likely to qualify for the 10-year Golden Visa.") : t("Below the AED 2 million Golden Visa line."), ...result.v.notes.map((n) => `• ${n}`)].join("\n");
    return "";
  }, [result, P, rate, t]);

  const [copied, setCopied] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [sendState, setSendState] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const send = () => start(async () => {
    const f = new FormData();
    f.set("body", summary); f.set("channel", "auto"); f.set("subject", t("Your property estimate")); f.set("keep_ai", "1");
    const r = await G.sendAgentMessage(locale, leadId, null, f);
    setSendState(r.ok ? t(r.message ?? "Sent.") : t(r.error));
  });

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-[18px] bg-canvas p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap gap-1.5" role="tablist" aria-label={t("Calculators")}>
          {TABS.map(([v, l]) => <button key={v} role="tab" aria-selected={tab === v} onClick={() => setTab(v)} className={cx("h-9 rounded-full px-3.5 text-[14px]", tab === v ? "bg-ink text-canvas" : "bg-parchment text-ink-2")}>{t(l)}</button>)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Num label={tab === "visa" ? "Official valuation (DLD)" : "Price"} value={price} onChange={setPrice} suffix="AED" hint={tab === "visa" ? "not the asking price" : "e.g. 2.4M"} />
          {tab !== "commission" && <Pick label="Emirate" value={emirate} onChange={setEmirate} options={[["dubai", "Dubai"], ["abu_dhabi", "Abu Dhabi"], ["sharjah", "Sharjah"], ["rak", "Ras Al Khaimah"]]} />}
          {(tab === "costs" || tab === "mortgage" || tab === "visa") && <Pick label="Property" value={status} onChange={setStatus} options={[["ready", "Ready (resale)"], ["offplan", "Off-plan"]]} />}
          {(tab === "costs" || tab === "visa") && <Pick label="Paying by" value={financing} onChange={setFinancing} options={[["mortgage", "Mortgage"], ["cash", "Cash"]]} />}
          {(tab === "costs" || tab === "mortgage") && <Pick label="Buyer" value={residency} onChange={setResidency} options={[["expat", "Expat resident"], ["national", "UAE national"]]} />}
          {tab === "mortgage" && <>
            <Num label="Monthly income" value={income} onChange={setIncome} suffix="AED" />
            <Num label="Existing monthly debts" value={debts} onChange={setDebts} suffix="AED" />
            <Num label="Age" value={age} onChange={setAge} />
            <Num label="Interest rate" value={rate} onChange={setRate} suffix="%" hint={`${RATES.fixedRangePct[0]}–${RATES.fixedRangePct[1]}% now`} />
          </>}
          {tab === "schedule" && <>
            <Num label="Plan" value={plan} onChange={setPlan} hint="60/40, 10/50/40, 20/40/40 post, 20% + 1% monthly" />
            <Num label="Months to handover" value={months} onChange={setMonths} />
            <Num label="Post-handover months" value={postMonths} onChange={setPostMonths} />
          </>}
          {tab === "yield" && <>
            <Pick label="Area" value={areaId} onChange={setAreaId} options={AREAS.map((a) => [a.id, a.name] as [string, string])} />
            <Num label="Annual rent" value={rent} onChange={setRent} suffix="AED" />
            <Num label="Size" value={size} onChange={setSize} suffix="sq ft" />
            <Num label="Management fee" value={mgmt} onChange={setMgmt} suffix="%" />
          </>}
          {tab === "commission" && <>
            <Num label="Commission rate" value={commPct} onChange={setCommPct} suffix="%" />
            <Num label="Agent's share" value={agentShare} onChange={setAgentShare} suffix="%" />
            <label className="flex items-center gap-2 text-[15px] sm:col-span-2"><input type="checkbox" checked={coBroke} onChange={(e) => setCoBroke(e.target.checked)} className="size-5 accent-[var(--creek)]" />{t("Shared 50/50 with another agency")}</label>
          </>}
        </div>
      </div>

      <div className="rounded-[18px] bg-canvas p-5 sm:p-6" aria-live="polite">
        {"error" in result ? <p className="text-ink-2">{t(result.error ?? "")}</p> : (
          <>
            {result.kind === "costs" && <>
              {result.c.lines.map((l) => <Row key={l.label} label={l.label} value={aed(l.amount)} note={l.note} />)}
              <Row label="Total fees" value={`${aed(result.c.fees)} · ${result.c.feesPct}%`} strong />
              {financing === "mortgage" && <Row label="Down payment" value={aed(result.c.downPayment)} note={`${t("Loan of")} ${aed(result.loan)}`} />}
              <Row label="Cash needed" value={aed(result.c.cashNeeded)} strong />
            </>}
            {result.kind === "mortgage" && <>
              <Row label="Loan-to-value limit" value={`${result.m.ltvPct}%`} />
              <Row label="Longest term at this age" value={`${result.m.years} ${t("years")}`} />
              <Row label="Max loan by value" value={aed(result.m.maxLoanByLtv)} />
              <Row label="Max loan by income (50% debt rule)" value={aed(result.m.maxLoanByIncome)} />
              <Row label="Loan they can get" value={aed(result.m.loan)} strong note={result.m.limitedBy === "income" ? "Limited by income" : result.m.limitedBy === "age" ? "Limited by age" : "Limited by loan-to-value"} />
              <Row label="Monthly payment" value={aed(result.m.payment)} strong />
              <Row label="Down payment" value={aed(result.m.downPayment)} />
              <Row label="Debt burden after" value={`${result.m.dbrPct}%`} />
              {result.m.unconfirmed && <p className="t-caption mt-3 rounded-[10px] bg-warm-soft px-3 py-2 text-warm">{t("The loan limits for UAE nationals and second homes are common practice but not confirmed by our sources. Check with the bank.")}</p>}
            </>}
            {result.kind === "schedule" && <>
              {result.s.rows.map((r) => <Row key={r.label + r.month} label={r.label} value={`${aed(r.amount)} · ${r.pct}%`} note={r.date} />)}
              <Row label="Paid before handover" value={aed(result.s.beforeHandover)} strong />
              {result.s.monthlyPostHandover > 0 && <Row label="Monthly after handover" value={aed(result.s.monthlyPostHandover)} strong />}
              {result.s.monthly > 0 && <Row label="Each monthly payment" value={aed(result.s.monthly)} strong note={`${t("Last payment")} ${result.s.endsOn}`} />}
            </>}
            {result.kind === "yield" && <>
              <Row label="Gross yield" value={`${result.y.grossPct}%`} strong />
              <Row label="Service charges" value={aed(result.y.serviceCharges)} note={`${t("About AED")} ${sc} ${t("per sq ft a year in")} ${area?.name ?? ""}`} />
              <Row label="Management" value={aed(result.y.management)} />
              <Row label="Net income" value={aed(result.y.netIncome)} />
              <Row label="Net yield" value={`${result.y.netPct}%`} strong />
              {area?.yieldPct && <p className="t-caption mt-3 text-ink-2">{t("Market gross yield in")} {area.name}: {area.yieldPct[0]}–{area.yieldPct[1]}%</p>}
            </>}
            {result.kind === "commission" && <>
              <Row label="Gross commission" value={aed(result.x.gross)} />
              <Row label="VAT charged on top" value={aed(result.x.vatOnGross)} />
              <Row label="Our share" value={aed(result.x.ourShare)} strong />
              <Row label="Agent" value={aed(result.x.agent)} />
              <Row label="Brokerage" value={aed(result.x.brokerage)} strong />
            </>}
            {result.kind === "visa" && <>
              <p className={cx("rounded-[12px] px-4 py-3 text-[17px] font-semibold", result.v.likelyEligible ? "bg-ok-soft text-ok" : "bg-warm-soft text-warm")}>{t(result.v.likelyEligible ? "Likely to qualify for the 10-year Golden Visa" : "Below the AED 2 million line")}</p>
              <ul className="mt-3 grid gap-2 text-[15px]">{result.v.notes.map((n) => <li key={n}>{n}</li>)}</ul>
              <p className="t-caption mt-3 text-ink-3">{result.v.confirm}</p>
            </>}
            <p className="t-fine mt-4 text-ink-3">{t("Estimates from public sources, as of")} {AS_OF}. {t("Banks, developers and the land department set the final figures.")}</p>
            {summary && (
              <div className="mt-5 grid gap-2 border-t border-hairline-soft pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-parchment px-3.5 text-[14px]">
                    {copied ? <Check size={15} /> : <Copy size={15} />}{t(copied ? "Copied" : "Copy for WhatsApp")}
                  </button>
                  {!demo && <><select value={leadId} onChange={(e) => { setLeadId(e.target.value); setSendState(null); }} aria-label={t("Send to a lead")} className={cx(field, "mt-0 h-9 w-auto text-[14px]")}>
                    <option value="">{t("Send to a lead…")}</option>{leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  <button type="button" disabled={!leadId || pending} onClick={send} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-creek px-3.5 text-[14px] font-medium text-on-creek disabled:opacity-50"><PaperPlaneTilt size={15} className="rtl:-scale-x-100" />{t("Send")}</button></>}
                </div>
                {sendState && <p className="t-caption text-ink-2">{sendState}</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
