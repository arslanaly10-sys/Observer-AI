"use client";
import { useState, type ChangeEvent } from "react";
import { Database, FileXls, EnvelopeSimple, Browser, Table as TableIcon, Phone, UploadSimple, CheckCircle, Warning, Copy } from "@phosphor-icons/react";
import { useT } from "../i18n";
import { useStore } from "../store";
import { Card, CardHead, PageHead, Stat, Stats, Pill, Btn, Table, cx } from "../ui";
import { NOW } from "@/lib/demo/brokerdesk";
import { freshness, quotePolicy, parsePriceList, diffLists, type SourceKind, type Unit, type Change } from "@/lib/inventory/freshness";

const H = 3_600_000;
const KIND: Record<SourceKind, { label: string; icon: typeof Database; how: string }> = {
  crm: { label: "CRM sync", icon: Database, how: "Read-only sync every 15 minutes, where the developer allows it" },
  "price-list": { label: "Excel or PDF price list", icon: FileXls, how: "Uploaded here; the AI reads it and shows the changes before they go live" },
  email: { label: "Forwarded price list", icon: EnvelopeSimple, how: "Sales admin forwards the developer's email to the project's own address" },
  "broker-portal": { label: "Developer broker portal", icon: Browser, how: "Availability export downloaded from the developer's portal" },
  sheet: { label: "Shared Google Sheet", icon: TableIcon, how: "Read every 30 minutes from a sheet the developer shares" },
  "sales-admin": { label: "Sales admin, by hand", icon: Phone, how: "Sales admin marks units after a call with the developer" },
};

const feeds: { project: string; kind: SourceKind; system: string; lastAt: number; units: number }[] = [
  { project: "Nawafir Harbour One", kind: "crm", system: "Salesforce", lastAt: NOW - 0.6 * H, units: 612 },
  { project: "Nawafir Riyadh Gate", kind: "sales-admin", system: "Launch desk", lastAt: NOW - 0.5 * H, units: 720 },
  { project: "Nawafir Pearl", kind: "sheet", system: "Google Sheet", lastAt: NOW - 3 * H, units: 386 },
  { project: "DAMAC Lagoons", kind: "sales-admin", system: "Calls to the developer", lastAt: NOW - 5 * H, units: 132 },
  { project: "Nawafir Grove Villas", kind: "email", system: "Price list by email", lastAt: NOW - 9 * H, units: 214 },
  { project: "Sobha Hartland II", kind: "broker-portal", system: "Developer portal export", lastAt: NOW - 26 * H, units: 118 },
  { project: "Diamondz", kind: "price-list", system: "PDF price list", lastAt: NOW - 52 * H, units: 160 },
];

const POLICY = {
  quote: "AI quotes prices and availability",
  "quote-with-date": "AI quotes with the date: “as of 9:00 today, subject to availability”",
  "confirm-first": "AI confirms with sales admin before quoting anything",
} as const;

const previous: Unit[] = [
  { code: "A-3902", beds: 2, price: 3_400_000, status: "available" },
  { code: "A-3903", beds: 1, price: 1_950_000, status: "available" },
  { code: "A-4108", beds: 3, price: 3_900_000, status: "held" },
  { code: "B-2211", beds: 2, price: 2_700_000, status: "available" },
];
const SAMPLE = `Unit No,Floor,Bedrooms,Price (AED),Status
A-3902,39,2BR,"3,450,000",Available
A-3903,39,1BR,1.95M,Sold
A-4108,41,3BR,3.9M,Booked
B-2211,22,2BR,2.7M,Available
B-2212,22,Studio,1.2M,Available`;

const questions = [
  { unit: "Diamondz DZ-1804", ask: "Is DZ-1804 still available at AED 1.38M? Last list is 52 hours old.", client: "Arjun Mehta", waiting: "6 min" },
  { unit: "Sobha Hartland II H2-0912", ask: "Is H2-0912 still available, and is the 60/40 plan unchanged?", client: "Elena Rossi", waiting: "14 min" },
];

/** Inventory without an API: every way data comes in, how fresh it is, and what the AI may say. */
export function InventorySources() {
  const { t } = useT();
  const { toast } = useStore();
  const [parsed, setParsed] = useState<{ units: Unit[]; changes: Change[]; skipped: number; name: string } | null>(null);
  const [applied, setApplied] = useState(false);
  const [asked, setAsked] = useState(questions);

  const read = (text: string, name: string) => {
    const r = parsePriceList(text);
    setParsed({ units: r.units, changes: diffLists(previous, r.units), skipped: r.skipped, name });
    setApplied(false);
  };
  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (/\.(csv|txt|tsv)$/i.test(f.name)) read(await f.text(), f.name);
    else { toast(t("Excel and PDF files are read by the AI in a live workspace. Here, try a CSV or the sample list.")); }
    e.target.value = "";
  };
  const stale = feeds.filter((f) => freshness(f.lastAt, NOW).level === "stale").length;

  return (
    <>
      <PageHead title="Inventory sources" sub="Most developers won't open an API. Observer takes inventory however it arrives, shows how fresh every unit is, and stops the AI quoting anything out of date." />
      <Stats>
        <Stat label="Projects connected" value={feeds.length} note="six ways in, no API needed" />
        <Stat label="Fresh (under 6 hours)" value={feeds.filter((f) => freshness(f.lastAt, NOW).level === "fresh").length} />
        <Stat label="Stale (over 24 hours)" value={stale} note="AI confirms before quoting" />
        <Stat label="Waiting for sales admin" value={asked.length} />
      </Stats>

      <Card>
        <CardHead title="Where each project's inventory comes from" />
        <Table head={["Project", "Source", "Last confirmed", "Freshness", "What the AI does"]} minWidth={860}>
          {feeds.map((f) => {
            const fr = freshness(f.lastAt, NOW);
            const K = KIND[f.kind];
            return (
              <tr key={f.project}>
                <td className="font-medium">{t(f.project)}<span className="t-caption block font-normal text-ink-2">{f.units} {t("units")}</span></td>
                <td><span className="flex items-center gap-2"><K.icon size={18} className="shrink-0 text-creek" /><span>{t(K.label)}<span className="t-caption block text-ink-2">{t(f.system)}</span></span></span></td>
                <td className="tnum text-ink-2">{fr.hours < 1 ? `${Math.round(fr.hours * 60)} ${t("min ago")}` : `${Math.round(fr.hours)} ${t("h ago")}`}</td>
                <td><Pill tone={fr.level === "fresh" ? "ok" : fr.level === "aging" ? "warm" : "hot"}>{t(fr.level === "fresh" ? "Fresh" : fr.level === "aging" ? "Ageing" : "Stale")}</Pill></td>
                <td className="max-w-[18rem] text-[13.5px] text-ink-2">{t(POLICY[quotePolicy(f.lastAt, NOW)])}</td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHead title="Upload a price list" sub="CSV from Excel or a Google Sheet, in English or Arabic. Only changed units are re-quoted." />
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-ink px-4 text-[14px] font-medium text-canvas"><UploadSimple size={16} />{t("Choose a file")}<input type="file" accept=".csv,.tsv,.txt,.xlsx,.xls,.pdf" className="sr-only" onChange={onFile} /></label>
            <Btn variant="secondary" onClick={() => read(SAMPLE, "harbour-one-pricelist-v15.csv")}>{t("Use the sample list")}</Btn>
          </div>
          {parsed && (
            <div className="mt-4">
              <p className="text-[14px]"><b className="font-medium" dir="ltr">{parsed.name}</b> · {parsed.units.length} {t("units read")}{parsed.skipped ? ` · ${parsed.skipped} ${t("rows skipped")}` : ""}</p>
              {parsed.units.length === 0 ? <p className="mt-2 flex items-start gap-1.5 text-[13.5px] text-hot"><Warning size={16} className="mt-0.5 shrink-0" />{t("No unit column found. The list needs a column such as “Unit No”.")}</p> : (
                <ul className="mt-3 space-y-1.5 text-[14px]">
                  {parsed.changes.map((c) => (
                    <li key={c.code + c.kind} className="flex items-center gap-2">
                      <Pill tone={c.kind === "price" ? "warm" : c.kind === "status" ? "creek" : c.kind === "new" ? "ok" : "cold"}>{t(c.kind === "price" ? "Price" : c.kind === "status" ? "Status" : c.kind === "new" ? "New" : "Removed")}</Pill>
                      <span dir="ltr">{c.code}</span>
                      <span className="text-ink-2">{c.kind === "price" ? `AED ${Number(c.from).toLocaleString("en-US")} → ${Number(c.to).toLocaleString("en-US")}` : c.kind === "status" ? `${t(String(c.from))} → ${t(String(c.to))}` : ""}</span>
                    </li>
                  ))}
                </ul>
              )}
              {parsed.units.length > 0 && !applied && <Btn className="mt-4" onClick={() => { setApplied(true); toast(`${parsed.changes.length} ${t("changes live. Agencies' shared links updated.")}`); }}>{t("Publish changes")}</Btn>}
              {applied && <p className="mt-3 flex items-center gap-1.5 text-[13.5px] text-ok"><CheckCircle size={16} weight="fill" />{t("Live for the AI, consultants and every agency.")}</p>}
            </div>
          )}
          <div className="mt-5 border-t border-hairline-soft pt-4">
            <p className="t-caption text-ink-2">{t("Or forward the developer's email to")}</p>
            <p className="mt-1 flex items-center gap-2 font-medium"><bdi>pricelists+harbour-one@in.observer.ai</bdi>
              <button aria-label={t("Copy")} onClick={() => toast(t("Address copied"))} className="text-ink-3 hover:text-ink"><Copy size={15} /></button></p>
          </div>
        </Card>

        <Card>
          <CardHead title="Waiting for sales admin" sub="When data is over 24 hours old, the AI asks before it quotes" />
          {asked.length === 0 && <p className="text-ink-2">{t("Nothing waiting.")}</p>}
          <ul className="space-y-5">
            {asked.map((q) => (
              <li key={q.unit}>
                <p className="font-medium">{t(q.ask)}</p>
                <p className="t-caption mt-1 text-ink-2"><span className="pii">{q.client}</span> {t("is waiting")} · {q.waiting}</p>
                <p className={cx("mt-2 rounded-[12px] bg-parchment px-3 py-2 text-[13.5px]")}>{t("The AI told the client: “Let me confirm that unit with the sales team. I'll reply within 15 minutes.”")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[["Still available", "Confirmed. The AI is replying to the client now."], ["Price changed", "Sales admin enters the new price; the AI replies with it."], ["Sold", "The AI offers the closest available units instead."]].map(([b, msg]) => (
                    <Btn key={b} variant={b === "Still available" ? "primary" : "secondary"} onClick={() => { setAsked((a) => a.filter((x) => x.unit !== q.unit)); toast(t(msg)); }}>{t(b)}</Btn>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHead title="Six ways in" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(KIND) as SourceKind[]).map((k) => { const K = KIND[k]; return (
            <li key={k} className="flex gap-3"><K.icon size={22} className="mt-0.5 shrink-0 text-creek" /><span><b className="block font-medium">{t(K.label)}</b><span className="t-caption text-ink-2">{t(K.how)}</span></span></li>
          ); })}
        </ul>
      </Card>
    </>
  );
}
