"use client";
import { useState } from "react";
import { Users, UsersFour, Hourglass, Robot, WhatsappLogo, CurrencyCircleDollar, CheckCircle, Warning } from "@phosphor-icons/react";
import { useT } from "../i18n";
import { useStore } from "../store";
import { Card, CardHead, PageHead, Stat, Stats, Pill, Btn, cx } from "../ui";
import { planHour, callbackSlots, broadcastCheck, pickOrder } from "@/lib/launch/capacity";

/** Share of enquiries at or above each score threshold, from the last three launches (sample data). */
const SHARE: Record<number, number> = { 60: 0.42, 70: 0.3, 80: 0.2, 90: 0.08 };
const TIERS = [1_000, 10_000, 100_000];

const eois = pickOrder([
  { name: "Abdullah Al Qahtani", paidAt: 1, score: 91, units: "Gate 1, whole floor 28" },
  { name: "Turki Al Otaibi", paidAt: 2, score: 84, units: "Gate 1 · 2804" },
  { name: "Nasser Al Harthy", paidAt: 3, score: 88, units: "Gate 2 · 1507" },
  { name: "Faris Al Dosari", paidAt: 3, score: 79, units: "Any 3-bed, Gate 1" },
  { name: "Reem Al Shehri", paidAt: 5, score: 72, units: "Any 2-bed" },
]);

function Slider({ label, value, min, max, step = 1, onChange, suffix }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void; suffix?: string }) {
  const { t } = useT();
  return (
    <label className="t-caption grid gap-1.5 text-ink-2">
      <span className="flex justify-between gap-2"><span>{t(label)}</span><b className="tnum text-ink">{value.toLocaleString("en-US")}{suffix}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="accent-[var(--color-creek)]" />
    </label>
  );
}

/** When far more clients arrive than the team can handle: who gets a person, a broker, a callback or the AI. */
export function LaunchControls() {
  const { t } = useT();
  const { toast } = useStore();
  const [rate, setRate] = useState(2900);
  const [people, setPeople] = useState(40);
  const [per, setPer] = useState(6);
  const [threshold, setThreshold] = useState(80);
  const [overflow, setOverflow] = useState(true);
  const [brokerCap, setBrokerCap] = useState(200);
  const [tier, setTier] = useState(10_000);
  const recipients = 25_000;

  const p = planHour({ enquiriesPerHour: rate, qualifiedShare: SHARE[threshold], consultants: people, perConsultantHour: per, brokerCapacityHour: brokerCap, overflowToBrokers: overflow });
  const slots = callbackSlots(p.waitlist, people, 10);
  const lastCallback = slots.length ? slots[slots.length - 1] + 10 : 0;
  const b = broadcastCheck(recipients, tier);
  const qualified = p.toPeople + p.toBrokers + p.waitlist;
  const bars = [
    { label: "Consultants", n: p.toPeople, icon: Users, cls: "bg-creek" },
    { label: "Partner brokers", n: p.toBrokers, icon: UsersFour, cls: "bg-warm" },
    { label: "Waitlist with a promised callback", n: p.waitlist, icon: Hourglass, cls: "bg-hot" },
  ];

  return (
    <>
      <PageHead title="Launch controls" sub="Every enquiry gets an instant AI reply. These rules decide who gets a person next when the team can't reach everyone." />
      <Stats>
        <Stat label="Enquiries this hour" value={rate.toLocaleString("en-US")} />
        <Stat label="Qualified (score ≥ threshold)" value={qualified.toLocaleString("en-US")} />
        <Stat label="Reached by a person within the hour" value={`${Math.round(p.coverage * 100)}%`} note="consultants and brokers" />
        <Stat label="Kept warm by the AI" value={p.aiOnly.toLocaleString("en-US")} note="until they qualify" />
      </Stats>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHead title="Rules for tonight" />
          <div className="grid gap-5">
            <Slider label="Enquiries per hour" value={rate} min={200} max={6000} step={100} onChange={setRate} />
            <Slider label="Consultants on shift" value={people} min={5} max={120} onChange={setPeople} />
            <Slider label="Qualified conversations per consultant per hour" value={per} min={2} max={12} onChange={setPer} />
            <div className="t-caption grid gap-1.5 text-ink-2">
              <span>{t("People take clients scoring at least")}</span>
              <div className="flex gap-1">{[60, 70, 80, 90].map((s) => <button key={s} onClick={() => setThreshold(s)} className={cx("h-9 flex-1 rounded-full text-[13px] font-medium", threshold === s ? "bg-ink text-canvas" : "bg-parchment text-ink-2")}>{s}</button>)}</div>
            </div>
            <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={overflow} onChange={(e) => setOverflow(e.target.checked)} className="size-4 accent-[var(--color-creek)]" />{t("Send qualified clients the team can't reach to registered brokers")}</label>
            {overflow && <Slider label="Broker capacity per hour" value={brokerCap} min={0} max={1000} step={20} onChange={setBrokerCap} />}
          </div>
        </Card>

        <Card>
          <CardHead title="This hour, qualified clients go to" />
          <div className="flex h-4 overflow-hidden rounded-full bg-parchment">
            {bars.map((x) => <div key={x.label} className={x.cls} style={{ width: `${qualified ? (x.n / qualified) * 100 : 0}%` }} />)}
          </div>
          <ul className="mt-5 space-y-3">
            {bars.map((x) => (
              <li key={x.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2"><x.icon size={18} className="text-ink-2" />{t(x.label)}</span>
                <b className="tnum">{x.n.toLocaleString("en-US")}</b>
              </li>
            ))}
            <li className="flex items-center justify-between gap-3 border-t border-hairline-soft pt-3 text-ink-2">
              <span className="flex items-center gap-2"><Robot size={18} />{t("Below the threshold: the AI answers, qualifies and keeps them warm")}</span>
              <b className="tnum text-ink">{p.aiOnly.toLocaleString("en-US")}</b>
            </li>
          </ul>
          {p.waitlist > 0 ? (
            <p className="mt-4 rounded-[12px] bg-parchment px-3 py-2.5 text-[14px]">{t("Each waiting client gets a callback time from the AI in their language. The last promised callback is")} <b className="tnum">{lastCallback}</b> {t("minutes after the hour.")}</p>
          ) : <p className="mt-4 flex items-center gap-1.5 text-[14px] text-ok"><CheckCircle size={16} weight="fill" />{t("Every qualified client reaches a person this hour.")}</p>}
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHead title="Expressions of interest and deposits" sub="Refundable booking deposits paid online before units open. First to pay picks first." aside={<Pill tone="creek"><CurrencyCircleDollar size={14} />SAR 50,000</Pill>} />
          <ol className="divide-y divide-hairline-soft">
            {eois.map((e, i) => (
              <li key={e.name} className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex items-center gap-3"><span className="tnum grid size-7 place-items-center rounded-full bg-ink text-[12px] text-canvas">{i + 1}</span><span><span className="pii block font-medium">{e.name}</span><span className="t-caption text-ink-2">{t(e.units)}</span></span></span>
                <Pill tone={e.score >= 80 ? "hot" : "warm"}>{e.score}</Pill>
              </li>
            ))}
          </ol>
          <p className="t-caption mt-3 text-ink-2">{t("1,318 paid deposits for 720 units. Payment links come from your own payment provider; refunds go back automatically if a client doesn't pick.")}</p>
        </Card>

        <Card>
          <CardHead title="WhatsApp launch broadcast" sub="WhatsApp limits how many people you can start conversations with in 24 hours. Replies to clients who wrote first don't count." />
          <div className="t-caption mb-4 grid gap-1.5 text-ink-2">
            <span>{t("Your number's current limit (from WhatsApp Manager)")}</span>
            <div className="flex gap-1">{TIERS.map((x) => <button key={x} onClick={() => setTier(x)} className={cx("h-9 flex-1 rounded-full text-[13px] font-medium", tier === x ? "bg-ink text-canvas" : "bg-parchment text-ink-2")}>{x.toLocaleString("en-US")}</button>)}</div>
          </div>
          <p className="text-[14.5px]">{t("Launch invitation to")} <b className="tnum">{recipients.toLocaleString("en-US")}</b> {t("registered clients")}</p>
          {b.fits ? <p className="mt-2 flex items-start gap-1.5 text-[14px] text-ok"><CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0" />{t("Fits in one day.")}</p> : (
            <p className="mt-2 flex items-start gap-1.5 text-[14px] text-warm"><Warning size={16} className="mt-0.5 shrink-0" /><span>{t("Over the limit by")} <b className="tnum">{b.overBy.toLocaleString("en-US")}</b>. {t("Observer sends to the highest scores first and spreads the rest over")} <b className="tnum">{b.days}</b> {t("days, so the number isn't restricted.")}</span></p>
          )}
          <ul className="mt-4 space-y-2 text-[14px]">
            {[["Launch invitation (Arabic)", true], ["Launch invitation (English)", true], ["Callback time confirmation", true], ["Deposit receipt", false]].map(([n, ok]) => (
              <li key={String(n)} className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><WhatsappLogo size={16} className="text-wa" />{t(String(n))}</span><Pill tone={ok ? "ok" : "warm"}>{t(ok ? "Template approved" : "Awaiting approval")}</Pill></li>
            ))}
          </ul>
          <Btn variant="secondary" className="mt-4" onClick={() => toast(t("Deposit receipt template resubmitted to WhatsApp"))}>{t("Resubmit template")}</Btn>
        </Card>
      </div>
    </>
  );
}
