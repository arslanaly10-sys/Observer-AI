"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { LockSimple, PaperPlaneTilt, X } from "@phosphor-icons/react";
import { img } from "@/lib/img";
import { useT } from "../i18n";
import { useStore } from "../store";
import { useRole } from "../role";
import { Card, CardHead, PageHead, Pill, Btn, Meter, Segmented, cx } from "../ui";
import { projects, towerUnits, type UnitStatus } from "@/lib/demo/group";

const statusCls: Record<UnitStatus, string> = {
  sold: "bg-ink text-canvas",
  booked: "bg-creek text-on-creek",
  held: "bg-warm-soft text-warm ring-1 ring-warm/40",
  available: "bg-canvas text-ink ring-1 ring-hairline hover:ring-ink",
};

/** Projects and live inventory: own towers floor by floor, partner launches beside them. */
export function Projects() {
  const { t } = useT();
  const { toast } = useStore();
  const { role } = useRole();
  const own = projects.filter((p) => p.towers);
  const [pid, setPid] = useState(own[0].id);
  const p = own.find((x) => x.id === pid)!;
  const [tw, setTw] = useState(0);
  const tower = p.towers![Math.min(tw, p.towers!.length - 1)];
  const grid = useMemo(() => towerUnits(p.id, tower, p.sold), [p, tower]);
  const [held, setHeld] = useState<string[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const status = (code: string, s: UnitStatus): UnitStatus => (held.includes(code) && s === "available" ? "held" : s);
  const counts = grid.flatMap((r) => r.units).reduce<Record<UnitStatus, number>>((m, u) => { m[status(u.code, u.status)]++; return m; }, { sold: 0, booked: 0, held: 0, available: 0 });
  const unit = grid.flatMap((r) => r.units.map((u) => ({ ...u, floor: r.floor }))).find((u) => u.code === pick);
  const cur = p.city === "Riyadh" ? "SAR" : "AED";
  const plan = p.plan.split("/").map(Number).filter(Boolean);

  return (
    <>
      <PageHead title="Projects & inventory" sub="Every unit, live: sold, booked, held and available, with the price list and payment plan beside it." />
      <div className="mb-4"><Segmented label="Project" value={pid} onChange={(v) => { setPid(v); setTw(0); setPick(null); }} options={own.map((x) => ({ value: x.id, label: x.name }))} /></div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="t-eyebrow !mb-1">{t(p.area)}, {t(p.city)} · {t("Handover")} {p.handover}</p>
              <h2 className="lux-serif text-[30px] leading-tight">{t(p.name)}</h2>
            </div>
            {p.towers!.length > 1 && <Segmented label="Tower" value={String(tw)} onChange={(v) => { setTw(+v); setPick(null); }} options={p.towers!.map((x, i) => ({ value: String(i), label: x.name }))} />}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
            {(["available", "held", "booked", "sold"] as UnitStatus[]).map((s) => (
              <li key={s} className="flex items-center gap-2"><span className={cx("inline-block size-3.5", statusCls[s])} />{t(s[0].toUpperCase() + s.slice(1))} <b className="tnum">{counts[s]}</b></li>
            ))}
          </ul>
          <div className="mt-4 max-h-[560px] overflow-auto border border-hairline-soft bg-pearl p-3" role="grid" aria-label={t("Units by floor")}>
            {grid.map((r) => (
              <div key={r.floor} role="row" className="flex items-center gap-1 py-[2px]">
                <span className="tnum w-8 shrink-0 text-[11px] text-ink-3">{r.floor}</span>
                {r.units.map((u) => {
                  const s = status(u.code, u.status);
                  return (
                    <button key={u.code} role="gridcell" onClick={() => setPick(u.code)} aria-label={`${u.code}, ${u.beds} ${t("bed")}, ${t(s)}`} className={cx("h-6 min-w-9 flex-1 text-[10px] transition", statusCls[s], pick === u.code && "outline outline-2 outline-offset-1 outline-ink")}>
                      <span className="hidden sm:inline">{u.beds}B</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid content-start gap-5">
          <Card>
            {unit ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="t-eyebrow !mb-1">{t("Unit")} · {t("Floor")} {unit.floor}</p>
                    <h3 className="lux-serif text-[30px] leading-none">{unit.code}</h3>
                  </div>
                  <button onClick={() => setPick(null)} aria-label={t("Close")} className="grid size-8 place-items-center text-ink-3 hover:text-ink"><X size={16} /></button>
                </div>
                <dl className="mt-4 divide-y divide-hairline-soft text-[14px]">
                  {([["Bedrooms", `${unit.beds}`], ["Price", `${cur} ${unit.price.toFixed(2)}M`], ["Payment plan", p.plan], ["Status", t(status(unit.code, unit.status))]] as [string, string][]).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2.5"><dt className="text-ink-2">{t(k)}</dt><dd className="tnum font-medium">{v}</dd></div>
                  ))}
                </dl>
                {plan.length > 1 && (
                  <div className="mt-3">
                    <p className="t-caption mb-1.5 text-ink-2">{t("Payment schedule")}</p>
                    <div className="flex h-6 overflow-hidden text-[11px] font-medium">
                      {plan.map((x, i) => <span key={i} style={{ width: `${x}%` }} className={cx("grid place-items-center", i === 0 ? "bg-ink text-canvas" : i === plan.length - 1 ? "bg-creek-soft text-creek" : "bg-creek text-on-creek")}>{x}%</span>)}
                    </div>
                    <p className="t-fine mt-1.5 text-ink-3">{t("During construction, then on handover.")}</p>
                  </div>
                )}
                <div className="mt-5 grid gap-2">
                  {status(unit.code, unit.status) === "available" ? (
                    <Btn onClick={() => { setHeld((h) => [...h, unit.code]); toast(`${unit.code} ${t("held for 30 minutes")}`); }}><LockSimple size={16} />{t(role === "broker" ? "Hold for my client" : "Hold for 30 minutes")}</Btn>
                  ) : <p className="text-[13.5px] text-ink-2">{t("This unit is not available. The AI will offer the nearest match on the same floor.")}</p>}
                  <Btn variant="secondary" onClick={() => toast(t("Unit card sent on WhatsApp"))}><PaperPlaneTilt size={16} />{t("Send to a client")}</Btn>
                </div>
              </>
            ) : (
              <>
                <CardHead title="Price list" sub="Pick a unit on the grid for its details" />
                <dl className="divide-y divide-hairline-soft text-[14px]">
                  {([["From", p.fromPrice], ["Units", `${p.units}`], ["Sold", `${p.sold}%`], ["Payment plan", p.plan], ["Handover", p.handover]] as [string, string][]).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2.5"><dt className="text-ink-2">{t(k)}</dt><dd className="tnum font-medium">{v}</dd></div>
                  ))}
                </dl>
              </>
            )}
          </Card>
          <Card pad={false} className="overflow-hidden">
            <div className="relative aspect-[16/10]"><Image src={img(p.photo, 900)} alt="" fill sizes="340px" className="object-cover" /></div>
            <p className="p-4 text-[13.5px] text-ink-2">{t(p.type)}</p>
          </Card>
        </div>
      </div>

      <h2 className="lux-serif mt-10 text-[30px]">{t("Partner launches we sell")}</h2>
      <p className="mt-1 text-ink-2">{t("Projects by other developers, named as market data. Prices and plans are indicative.")}</p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {projects.filter((x) => !x.towers).map((x) => (
          <li key={x.id}>
            <Card pad={false} className="h-full overflow-hidden">
              <div className="relative aspect-[4/3]"><Image src={img(x.photo, 700)} alt="" fill sizes="(min-width:1280px) 300px, 50vw" className="object-cover" /></div>
              <div className="p-4">
                <p className="t-eyebrow !mb-1">{t(x.developer)}</p>
                <p className="font-semibold">{t(x.name)}</p>
                <p className="t-caption text-ink-2">{t(x.area)}, {t(x.city)} · {t("from")} {x.fromPrice}</p>
                <div className="mt-3 flex items-center gap-2"><Meter value={x.sold} className="flex-1" /><span className="tnum text-[12px] text-ink-2">{x.sold}%</span></div>
                <div className="mt-2 flex flex-wrap gap-1.5"><Pill tone="cold">{x.plan}</Pill><Pill tone="creek">{x.handover}</Pill></div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
