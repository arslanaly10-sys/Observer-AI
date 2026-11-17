"use client";
import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, DotsSixVertical } from "@phosphor-icons/react";
import { useT } from "@/components/app/i18n";
import { Monogram, TempBadge, cx } from "@/components/app/ui";
import { setStage } from "@/app/[locale]/workspace/actions";

type Card = { id: string; name: string; budget_aed: number | null; temp: "hot" | "warm" | "cold"; stage: string; area: string | null; editable: boolean };
const fmt = (n: number | null) => (n ? (n >= 1e6 ? `AED ${(n / 1e6).toFixed(n % 1e6 ? 2 : 0)}M` : `AED ${Math.round(n / 1e3)}K`) : "—");

export function PipelineBoard({ cards, stages, labels, probs }: { cards: Card[]; stages: string[]; labels: Record<string, string>; probs: Record<string, number> }) {
  const { t, locale } = useT();
  const [items, move] = useOptimistic(cards, (state, { id, stage }: { id: string; stage: string }) => state.map((c) => (c.id === id ? { ...c, stage } : c)));
  const [, start] = useTransition();
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const go = (id: string, stage: string) =>
    start(async () => {
      move({ id, stage });
      const r = await setStage(locale, id, stage as never);
      setError(r.ok ? null : r.error);
    });
  return (
    <>
      {error && <p role="alert" className="t-caption mb-3 rounded-[10px] bg-hot-soft px-3 py-2 text-hot">{t(error)}</p>}
      <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {stages.map((s, si) => {
          const list = items.filter((c) => c.stage === s);
          const total = list.reduce((a, c) => a + (c.budget_aed ?? 0), 0);
          return (
            <section key={s} aria-label={t(labels[s])}
              onDragOver={(e) => { e.preventDefault(); setOver(s); }} onDragLeave={() => setOver((o) => (o === s ? null : o))}
              onDrop={(e) => { e.preventDefault(); if (drag) go(drag, s); setDrag(null); setOver(null); }}
              className={cx("w-[260px] shrink-0 snap-start rounded-[18px] p-3 transition-colors", over === s ? "bg-creek-soft" : "bg-pearl")}>
              <header className="px-2 pb-3 pt-1">
                <div className="flex items-center justify-between"><h2 className="text-[15px] font-semibold">{t(labels[s])}</h2><span className="t-caption tnum text-ink-2">{list.length} · {probs[s]}%</span></div>
                <p className="t-fine tnum mt-0.5 text-ink-3">{fmt(total)}</p>
              </header>
              <ul className="min-h-24 space-y-2">
                {list.map((c) => (
                  <li key={c.id} draggable={c.editable} onDragStart={() => setDrag(c.id)} onDragEnd={() => { setDrag(null); setOver(null); }}
                    className={cx("lift rounded-[14px] border border-hairline-soft bg-canvas p-3.5", c.editable && "cursor-grab active:cursor-grabbing", drag === c.id && "opacity-40")}>
                    <div className="flex items-center gap-2.5">
                      {c.editable && <DotsSixVertical size={16} className="-ms-1 text-ink-3" aria-hidden />}
                      <Monogram name={c.name} size={28} />
                      <Link href={`/${locale}/workspace/leads/${c.id}`} className="min-w-0 flex-1 truncate text-[15px] font-medium hover:underline">{c.name}</Link>
                    </div>
                    <div className="mt-3 flex items-center justify-between"><span className="tnum text-[14px] font-semibold">{fmt(c.budget_aed)}</span><TempBadge temp={c.temp} /></div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <p className="t-caption truncate text-ink-3">{c.area ?? ""}</p>
                      {c.editable && si < stages.length - 1 && (
                        <button onClick={() => go(c.id, stages[si + 1])} className="flex size-8 items-center justify-center rounded-full text-ink-2 hover:bg-parchment hover:text-creek" aria-label={`${t("Move")} ${c.name} ${t("to")} ${t(labels[stages[si + 1]])}`}>
                          <ArrowRight size={15} className="rtl:-scale-x-100" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
                {!list.length && <li className="t-caption rounded-[14px] border border-dashed border-hairline px-3 py-6 text-center text-ink-3">{t("Drop a deal here")}</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
