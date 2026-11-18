"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ShieldCheck, Warning, CheckCircle, UserPlus, ArrowRight } from "@phosphor-icons/react";
import { useT } from "../i18n";
import { useStore } from "../store";
import { Card, CardHead, PageHead, Stat, Stats, Pill, Btn, Table, Meter, cx } from "../ui";
import { brokers, clients, deals, projects, kpi } from "@/lib/demo/group";
import { aed } from "./exec";

const tiers = [
  { tier: "Platinum", rate: "4%", days: 90, rule: "AED 120M+ a year" },
  { tier: "Gold", rate: "3.5%", days: 60, rule: "AED 50M+ a year" },
  { tier: "Silver", rate: "3%", days: 30, rule: "Registered with RERA" },
];

const requests = [
  { agency: "Marina Bay Properties", client: "Viktor Sokolov", project: "Sobha Hartland II", verdict: "duplicate", detail: "Already a Nawafir client since 9 November, with Mariam Al Hashimi." },
  { agency: "Desert Rose Real Estate", client: "Lina Haddad", project: "Nawafir Harbour One", verdict: "clear", detail: "No match across 41,280 enquiries. Ready to protect for 60 days." },
  { agency: "Najd Horizon Realty (KSA)", client: "Turki Al Otaibi", project: "Nawafir Riyadh Gate", verdict: "clear", detail: "No match. FAL licence verified. Ready to protect for 60 days." },
];

/** Partner agencies: registration, protection, tiers and commission. */
export function Brokers() {
  const { t } = useT();
  const { toast } = useStore();
  const [decided, setDecided] = useState<string[]>([]);
  return (
    <>
      <PageHead title="Broker network" sub="184 partner agencies. Clients registered once, protected for the agreed period, and commission paid on time." />
      <Stats>
        <Stat label="Partner agencies" value={kpi.agencies} note="RERA and FAL licensed" />
        <Stat label="Registrations this month" value="4,120" note="duplicates checked by the AI" />
        <Stat label="Sales through partners" value="AED 3.1B" note="this year" />
        <Stat label="Commission paid" value="AED 118M" note="average 19 days after SPA" />
      </Stats>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHead title="Top agencies" sub="This year" />
          <Table head={["Agency", "Tier", "Licence", "Clients", "Deals", "Sales", "Commission"]} minWidth={760}>
            {brokers.map((b) => (
              <tr key={b.name} className="border-t border-hairline-soft">
                <td className="py-3 pe-4 font-medium">{t(b.name)}</td>
                <td className="py-3 pe-4"><Pill tone={b.tier === "Platinum" ? "warm" : b.tier === "Gold" ? "creek" : "cold"}>{t(b.tier)}</Pill></td>
                <td className="tnum py-3 pe-4 text-ink-2" dir="ltr">{b.orn.startsWith("FAL") ? b.orn : `ORN ${b.orn}`}</td>
                <td className="tnum py-3 pe-4">{b.clients}</td>
                <td className="tnum py-3 pe-4">{b.deals}</td>
                <td className="tnum py-3 pe-4">{aed(b.salesM)}</td>
                <td className="tnum py-3 pe-4 font-semibold">{aed(b.commissionM)}</td>
              </tr>
            ))}
          </Table>
        </Card>
        <div className="grid content-start gap-5">
          <Card>
            <CardHead title="Registration requests" sub="Checked against every enquiry before anyone is protected" />
            <ul className="space-y-4">
              {requests.map((r) => {
                const d = decided.includes(r.client);
                return (
                  <li key={r.client} className={cx("border-t border-hairline-soft pt-3 first:border-0 first:pt-0", d && "opacity-50")}>
                    <p className="text-[14.5px]"><b className="pii font-medium">{r.client}</b> · {t(r.project)}</p>
                    <p className="t-caption text-ink-2">{t("from")} {t(r.agency)}</p>
                    <p className={cx("mt-1.5 flex items-start gap-1.5 text-[13.5px]", r.verdict === "duplicate" ? "text-hot" : "text-ok")}>
                      {r.verdict === "duplicate" ? <Warning size={16} className="mt-0.5 shrink-0" /> : <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0" />}{t(r.detail)}
                    </p>
                    {!d && (
                      <div className="mt-2 flex gap-2">
                        {r.verdict === "clear" ? <Btn onClick={() => { setDecided((x) => [...x, r.client]); toast(`${r.client} ${t("protected")}`); }}><ShieldCheck size={16} />{t("Protect")}</Btn> : <Btn variant="secondary" onClick={() => { setDecided((x) => [...x, r.client]); toast(t("Agency told the client is already registered")); }}>{t("Explain to agency")}</Btn>}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card>
            <CardHead title="Tiers" />
            <ul className="divide-y divide-hairline-soft text-[14px]">
              {tiers.map((x) => (
                <li key={x.tier} className="flex items-center justify-between gap-3 py-2.5">
                  <span><b className="font-medium">{t(x.tier)}</b><span className="t-caption block text-ink-2">{t(x.rule)}</span></span>
                  <span className="tnum text-end">{x.rate}<span className="t-caption block text-ink-2">{x.days} {t("days protection")}</span></span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

/** The broker partner's home: register, check, follow commission. Sees only its own clients. */
export function Partner() {
  const { t, locale } = useT();
  const { toast } = useStore();
  const me = brokers[0];
  const myDeals = deals.filter((d) => d.broker === me.name);
  const [mine, setMine] = useState([
    { client: "Chen Wei", project: "Diamondz", until: "6 Feb 2027", stage: "Booking" },
    { client: "Hannah Becker", project: "Nawafir Harbour One", until: "21 Jan 2027", stage: "Viewing" },
    { client: "Rohan Kapoor", project: "Nawafir Pearl", until: "2 Feb 2027", stage: "Enquiry" },
  ]);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const project = String(f.get("project") || "");
    if (!name) return;
    const dup = clients.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (dup) { setResult({ ok: false, text: t("Already registered with Nawafir. Your request is logged; sales admin will reply within one working day.") }); return; }
    setMine((m) => [{ client: name, project, until: "18 Feb 2027", stage: "Enquiry" }, ...m]);
    setResult({ ok: true, text: `${name} ${t("is protected for 90 days, until 18 February 2027.")}` });
    toast(t("Client registered and protected"));
    e.currentTarget.reset();
  };
  return (
    <>
      <PageHead title="Partner home" sub={`${t(me.name)} · ${t("Platinum partner")} · ORN ${me.orn}`} />
      <Stats>
        <Stat label="Protected clients" value={mine.length + me.clients - 3} />
        <Stat label="Deals this year" value={me.deals} />
        <Stat label="Commission this year" value={aed(me.commissionM)} note="4% Platinum rate" />
        <Stat label="Next payment" value="AED 136K" note="due 2 December" />
      </Stats>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHead title="Register a client" sub="Checked against every Nawafir enquiry before it is protected" />
          <form onSubmit={submit} className="grid gap-3">
            <label className="grid gap-1.5 text-[13px] text-ink-2">{t("Client name")}<input name="name" required className="h-11 border border-hairline bg-pearl px-3 text-[15px] text-ink outline-none focus:border-ink" placeholder={t("e.g. Lina Haddad")} /></label>
            <label className="grid gap-1.5 text-[13px] text-ink-2">{t("Mobile")}<input name="phone" inputMode="tel" dir="ltr" className="h-11 border border-hairline bg-pearl px-3 text-[15px] text-ink outline-none focus:border-ink" placeholder="+971" /></label>
            <label className="grid gap-1.5 text-[13px] text-ink-2">{t("Project")}<select name="project" className="h-11 border border-hairline bg-pearl px-3 text-[15px] text-ink">{projects.map((p) => <option key={p.id} value={p.name}>{t(p.name)}</option>)}</select></label>
            <Btn type="submit"><UserPlus size={16} />{t("Register and protect")}</Btn>
            {result && <p role="status" className={cx("flex items-start gap-1.5 text-[13.5px]", result.ok ? "text-ok" : "text-hot")}>{result.ok ? <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0" /> : <Warning size={16} className="mt-0.5 shrink-0" />}{result.text}</p>}
            <p className="t-fine text-ink-3">{t("Try “Viktor Sokolov” to see a duplicate caught.")}</p>
          </form>
        </Card>
        <div className="grid content-start gap-5">
          <Card>
            <CardHead title="My protected clients" />
            <ul className="divide-y divide-hairline-soft">
              {mine.map((c) => (
                <li key={c.client} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0"><span className="pii block truncate font-medium">{c.client}</span><span className="t-caption text-ink-2">{t(c.project)} · {t(c.stage)}</span></span>
                  <span className="t-caption text-end text-ink-2">{t("Protected until")}<br /><b className="text-ink">{c.until}</b></span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHead title="Commission statement" />
            {myDeals.map((d) => (
              <div key={d.client} className="flex items-center justify-between gap-3 border-t border-hairline-soft py-2.5 first:border-0">
                <span><span className="pii block font-medium">{d.client}</span><span className="t-caption text-ink-2">{t(d.project)} · {d.unit} · {t(d.stage)}</span></span>
                <span className="tnum text-end font-semibold">{aed(d.commission)}<span className="t-caption block font-normal text-ink-2">{t("due after SPA")}</span></span>
              </div>
            ))}
          </Card>
          <Card>
            <CardHead title="Live availability" aside={<Link href={`/${locale}/app/projects`} className="t-caption inline-flex items-center gap-1 text-creek hover:underline">{t("All units")}<ArrowRight size={12} className="rtl:-scale-x-100" /></Link>} />
            <ul className="space-y-2.5">
              {projects.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center gap-3 text-[14px]"><span className="w-44 truncate">{t(p.name)}</span><Meter value={100 - p.sold} tone="ok" className="flex-1" /><span className="tnum w-20 text-end text-[12.5px] text-ink-2">{100 - p.sold}% {t("left")}</span></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
