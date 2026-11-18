"use client";
import { useMemo, useState } from "react";
import { WhatsappLogo, Phone, CalendarPlus, Check, FileText, Sparkle, IdentificationCard, MagnifyingGlass, Circle, CheckCircle } from "@phosphor-icons/react";
import { useT } from "../i18n";
import { useStore } from "../store";
import { useRole } from "../role";
import { Card, CardHead, PageHead, Stat, Stats, Pill, Btn, Monogram, ScoreBar, Segmented, Table, cx } from "../ui";
import { clients, deals, stages, tasks as seedTasks, roles, type Client, type Stage } from "@/lib/demo/group";
import { aed } from "./exec";

const docsFor = (stage: Stage) => {
  const at = stages.indexOf(stage);
  return [
    { k: "Passport and Emirates ID", done: at >= 2 },
    { k: "Reservation form", done: at >= 3 },
    { k: "Booking deposit receipt", done: at >= 3 },
    { k: "Sale and purchase agreement (SPA)", done: at >= 4 },
    { k: "Oqood registration", done: at >= 5 },
    { k: "Handover and title deed", done: at >= 6 },
  ];
};

function timeline(c: Client, t: (s: string) => string) {
  const at = stages.indexOf(c.stage);
  const items = [
    { when: "Day 1", what: `${t("Enquiry from")} ${t(c.source)}`, who: "System" },
    { when: "Day 1 · +38s", what: `${t("AI replied on WhatsApp in")} ${t(c.lang)}`, who: "AI concierge" },
    { when: "Day 1 · +4 min", what: `${t("Routed to")} ${t(c.agent)}`, who: "AI concierge" },
  ];
  if (at >= 1) items.push({ when: "Day 4", what: `${t("Viewing at")} ${t(c.project)}`, who: c.agent });
  if (at >= 2) items.push({ when: "Day 9", what: t("Expression of interest received"), who: c.agent });
  if (at >= 3) items.push({ when: "Day 12", what: t("Unit reserved, booking deposit paid"), who: "Sales admin" });
  if (at >= 4) items.push({ when: "Day 26", what: t("SPA signed"), who: "Sales admin" });
  if (at >= 5) items.push({ when: "Day 41", what: t("Oqood issued by the Dubai Land Department"), who: "Sales admin" });
  if (at >= 6) items.push({ when: "Day 640", what: t("Handover and keys"), who: "Customer care" });
  return items.reverse();
}

/** Clients: list beside one complete record per family. */
export function Clients() {
  const { t } = useT();
  const { toast } = useStore();
  const { role } = useRole();
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState<"all" | "VIP" | "Investor" | "Golden Visa" | "End user">("all");
  const mine = role === "agent" ? clients.filter((c) => c.agent === roles.agent.person || c.agent === "AI concierge") : clients;
  const list = mine.filter((c) => (seg === "all" || c.segment === seg) && (c.name + c.project + c.nationality).toLowerCase().includes(q.toLowerCase()));
  const [openId, setOpen] = useState(list[0]?.id ?? clients[0].id);
  const c = clients.find((x) => x.id === openId) ?? list[0] ?? clients[0];
  const at = stages.indexOf(c.stage);
  const gv = /AED (\d+(\.\d+)?)/.exec(c.budget);
  const visa = gv ? +gv[1] >= 2 : c.budget.includes("SAR");
  const myTasks = seedTasks.filter((x) => x.client === c.name);

  return (
    <>
      <PageHead title="Clients" sub="One record per family: every conversation, viewing, offer and document, in their language." />
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card pad={false} className="p-3">
          <label className="relative block">
            <span className="sr-only">{t("Search clients")}</span>
            <MagnifyingGlass size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search clients, projects, nationality")} className="h-10 w-full border border-hairline-soft bg-pearl ps-9 pe-3 text-[14px] outline-none focus:border-ink" />
          </label>
          <div className="mt-3"><Segmented label="Segment" value={seg} onChange={setSeg} options={[{ value: "all", label: "All" }, { value: "VIP", label: "VIP" }, { value: "Investor", label: "Investors" }, { value: "Golden Visa", label: "Golden Visa" }, { value: "End user", label: "End users" }]} /></div>
          <ul className="mt-2 max-h-[640px] overflow-y-auto">
            {list.map((x) => (
              <li key={x.id}>
                <button onClick={() => setOpen(x.id)} aria-pressed={x.id === c.id} className={cx("flex w-full items-center gap-3 p-2.5 text-start", x.id === c.id ? "bg-parchment" : "hover:bg-pearl")}>
                  <Monogram name={x.name} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="pii block truncate text-[14.5px] font-medium">{x.name}</span>
                    <span className="t-caption block truncate text-ink-2">{t(x.project)} · {t(x.stage)}</span>
                  </span>
                  {x.segment === "VIP" && <Pill tone="warm">VIP</Pill>}
                </button>
              </li>
            ))}
            {!list.length && <li className="p-4 text-[14px] text-ink-2">{t("No clients match.")}</li>}
          </ul>
        </Card>

        <div className="grid content-start gap-5">
          <Card>
            <div className="flex flex-wrap items-start gap-4">
              <Monogram name={c.name} size={56} />
              <div className="min-w-0 flex-1">
                <h2 className="pii lux-serif text-[30px] leading-tight">{c.name}</h2>
                <p className="mt-1 text-[14px] text-ink-2">{t(c.nationality)} · {t(c.lang)} · {t(c.household)} · <span dir="ltr">{c.phone}</span></p>
                <div className="mt-2 flex flex-wrap gap-2"><Pill tone={c.segment === "VIP" ? "warm" : "creek"}>{t(c.segment)}</Pill><Pill tone="cold">{t(c.source)}</Pill>{visa && <Pill tone="ok"><IdentificationCard size={13} />{t("Golden Visa eligible")}</Pill>}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Btn onClick={() => toast(`${t("WhatsApp opened")} · ${c.name}`)}><WhatsappLogo size={16} weight="fill" />{t("WhatsApp")}</Btn>
                <Btn variant="secondary" onClick={() => toast(`${t("Calling")} ${c.name}…`, "info")}><Phone size={16} />{t("Call")}</Btn>
                <Btn variant="secondary" onClick={() => toast(t("Viewing slot offered on WhatsApp"))}><CalendarPlus size={16} />{t("Book viewing")}</Btn>
              </div>
            </div>
            {/* Stage */}
            <ol className="mt-6 grid grid-cols-7 gap-1" aria-label={t("Deal stage")}>
              {stages.map((s, i) => (
                <li key={s}>
                  <span className={cx("block h-1.5", i <= at ? "bg-creek" : "bg-hairline-soft")} />
                  <span className={cx("mt-1.5 block truncate text-[11.5px]", i === at ? "font-semibold text-ink" : "text-ink-3")}>{t(s)}</span>
                </li>
              ))}
            </ol>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHead title="Profile" />
              <dl className="divide-y divide-hairline-soft text-[14px]">
                {([["Budget", c.budget], ["Interested in", t(c.project)], ["Consultant", t(c.agent)], ["Last activity", t(c.lastActivity)]] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-ink-2">{t(k)}</dt><dd className="text-end font-medium"><bdi>{v}</bdi></dd></div>
                ))}
                <div className="flex items-center justify-between gap-4 py-2.5"><dt className="text-ink-2">{t("Score")}</dt><dd className="w-40"><ScoreBar score={c.score} /></dd></div>
              </dl>
              <div className="mt-4 bg-creek-soft p-3.5 text-[14px] leading-relaxed">
                <p className="mb-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-creek"><Sparkle size={14} weight="fill" />{t("AI summary")}</p>
                {t(c.note)}
              </div>
            </Card>
            <Card>
              <CardHead title="Documents" sub="What the deal still needs" />
              <ul className="space-y-2.5">
                {docsFor(c.stage).map((d) => (
                  <li key={d.k} className="flex items-center gap-3 text-[14px]">
                    {d.done ? <CheckCircle size={20} weight="fill" className="text-ok" /> : <Circle size={20} className="text-hairline" />}
                    <span className={cx("flex-1", !d.done && "text-ink-2")}>{t(d.k)}</span>
                    {d.done ? <FileText size={16} className="text-ink-3" /> : <button onClick={() => toast(t("Request sent to the client on WhatsApp"))} className="text-[12.5px] font-medium text-creek hover:underline">{t("Request")}</button>}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <Card>
              <CardHead title="Timeline" />
              <ol className="relative space-y-4 border-s border-hairline ps-5">
                {timeline(c, t).map((e, i) => (
                  <li key={i} className="relative">
                    <span className={cx("absolute -start-[25px] top-1.5 size-2.5 rounded-full", i === 0 ? "bg-creek" : "bg-hairline")} />
                    <p className="text-[14.5px]">{e.what}</p>
                    <p className="t-caption text-ink-3">{t(e.when)} · {t(e.who)}</p>
                  </li>
                ))}
              </ol>
            </Card>
            <Card>
              <CardHead title="Tasks" />
              {myTasks.length ? (
                <ul className="space-y-3">
                  {myTasks.map((x) => (
                    <li key={x.title} className="flex gap-3 text-[14px]">
                      {x.done ? <CheckCircle size={20} weight="fill" className="shrink-0 text-ok" /> : <Circle size={20} className="shrink-0 text-hairline" />}
                      <span><span className={cx("block", x.done && "text-ink-3 line-through")}>{t(x.title)}</span><span className="t-caption text-ink-3">{t(x.due)} · {t(x.owner)}</span></span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-[14px] text-ink-2">{t("No open tasks. The AI follows up on schedule.")}</p>}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

/** Deals from EOI to handover, with documents and commission. */
export function Deals() {
  const { t } = useT();
  const { role } = useRole();
  const [tab, setTab] = useState<"deals" | "commission">("deals");
  const list = role === "agent" ? deals.filter((d) => d.agent === roles.agent.person) : deals;
  const byStage = useMemo(() => stages.slice(2).map((s) => ({ s, n: list.filter((d) => d.stage === s).length, v: list.filter((d) => d.stage === s).reduce((a, d) => a + d.value, 0) })), [list]);
  const byAgent = Object.values(list.reduce<Record<string, { who: string; deals: number; due: number; paid: number }>>((m, d) => {
    const who = d.broker || d.agent;
    m[who] ??= { who, deals: 0, due: 0, paid: 0 };
    m[who].deals++;
    if (stages.indexOf(d.stage) >= 4) m[who].paid += d.commission; else m[who].due += d.commission;
    return m;
  }, {}));
  return (
    <>
      <PageHead title="Deals & commissions" sub="Every deal from expression of interest to handover, the documents it is missing, and who is owed what." />
      <Stats>
        <Stat label="Deals in progress" value={list.length} />
        <Stat label="Value in progress" value={aed(list.reduce((a, d) => a + d.value, 0))} />
        <Stat label="Commission due" value={aed(byAgent.reduce((a, x) => a + x.due, 0))} note="on bookings and EOIs" />
        <Stat label="Commission paid" value={aed(byAgent.reduce((a, x) => a + x.paid, 0))} note="after SPA" />
      </Stats>
      <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden border border-hairline-soft bg-hairline-soft sm:grid-cols-5">
        {byStage.map(({ s, n, v }) => (
          <div key={s} className="bg-canvas p-4">
            <p className="t-eyebrow !mb-1">{t(s)}</p>
            <p className="tnum text-[22px] font-semibold">{n}</p>
            <p className="t-caption tnum text-ink-2">{aed(v)}</p>
          </div>
        ))}
      </div>
      <Card>
        <div className="mb-4"><Segmented label="View" value={tab} onChange={setTab} options={[{ value: "deals", label: "Deals" }, { value: "commission", label: "Commission ledger" }]} /></div>
        {tab === "deals" ? (
          <Table head={["Client", "Project and unit", "Stage", "Value", "Documents", "Consultant"]} minWidth={860}>
            {list.map((d) => {
              const docs = Object.values(d.docs);
              return (
                <tr key={d.client} className="border-t border-hairline-soft">
                  <td className="py-3 pe-4"><span className="pii font-medium">{d.client}</span></td>
                  <td className="py-3 pe-4"><span className="block">{t(d.project)}</span><span className="t-caption text-ink-2">{d.unit}</span></td>
                  <td className="py-3 pe-4"><Pill tone={stages.indexOf(d.stage) >= 4 ? "ok" : "creek"}>{t(d.stage)}</Pill></td>
                  <td className="tnum py-3 pe-4 font-semibold">{aed(d.value)}</td>
                  <td className="py-3 pe-4"><span className="flex gap-1" aria-label={`${docs.filter(Boolean).length}/${docs.length}`}>{docs.map((ok, i) => <span key={i} className={cx("h-1.5 w-5", ok ? "bg-ok" : "bg-hairline-soft")} />)}</span></td>
                  <td className="py-3 pe-4 text-ink-2">{t(d.agent)}{d.broker && <span className="t-caption block">{t("with")} {t(d.broker)}</span>}</td>
                </tr>
              );
            })}
          </Table>
        ) : (
          <Table head={["Consultant or agency", "Deals", "Due", "Paid"]} minWidth={560}>
            {byAgent.map((x) => (
              <tr key={x.who} className="border-t border-hairline-soft">
                <td className="py-3 pe-4 font-medium">{t(x.who)}</td>
                <td className="tnum py-3 pe-4">{x.deals}</td>
                <td className="tnum py-3 pe-4">{aed(x.due)}</td>
                <td className="tnum py-3 pe-4 text-ok">{aed(x.paid)}</td>
              </tr>
            ))}
          </Table>
        )}
        <p className="t-fine mt-4 text-ink-3">{t("Commission shown at 2% of the sale price for consultants and 4% for partner agencies, split per agreement. Paid after the SPA is signed.")}</p>
      </Card>
    </>
  );
}

/** Tasks for the seat: today, upcoming, done. */
export function Tasks() {
  const { t } = useT();
  const { role } = useRole();
  const [done, setDone] = useState<string[]>(seedTasks.filter((x) => x.done).map((x) => x.title));
  const list = role === "agent" ? seedTasks.filter((x) => x.owner === roles.agent.person) : seedTasks;
  const groups = [
    { h: "Today", items: list.filter((x) => !done.includes(x.title) && /Today|Tonight/.test(x.due)) },
    { h: "Upcoming", items: list.filter((x) => !done.includes(x.title) && !/Today|Tonight/.test(x.due)) },
    { h: "Done", items: list.filter((x) => done.includes(x.title)) },
  ];
  return (
    <>
      <PageHead title="Tasks" sub="What people owe clients, with the AI's follow-ups kept separate so nothing is done twice." />
      <div className="grid gap-5 lg:grid-cols-3">
        {groups.map((g) => (
          <Card key={g.h}>
            <CardHead title={g.h} aside={<span className="tnum t-caption text-ink-2">{g.items.length}</span>} />
            <ul className="space-y-3">
              {g.items.map((x) => {
                const isDone = done.includes(x.title);
                return (
                  <li key={x.title}>
                    <button onClick={() => setDone((d) => (isDone ? d.filter((y) => y !== x.title) : [...d, x.title]))} className="flex w-full gap-3 text-start">
                      {isDone ? <CheckCircle size={22} weight="fill" className="shrink-0 text-ok" /> : <Circle size={22} className="shrink-0 text-hairline" />}
                      <span>
                        <span className={cx("block text-[14.5px]", isDone && "text-ink-3 line-through")}>{t(x.title)}</span>
                        <span className="t-caption text-ink-3">{t(x.due)} · {t(x.owner)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
              {!g.items.length && <li className="flex items-center gap-2 text-[14px] text-ink-2"><Check size={16} />{t("Nothing here.")}</li>}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
