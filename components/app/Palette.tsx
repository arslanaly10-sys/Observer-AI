"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, ArrowElbowDownLeft, User, Plus, ArrowCounterClockwise } from "@phosphor-icons/react";
import { navGroups } from "./nav";
import { useT } from "./i18n";
import { useStore } from "./store";
import { Monogram, cx } from "./ui";

type Item = { id: string; group: string; label: string; hint?: string; icon: React.ReactNode; run: () => void };

/** ⌘K / Ctrl+K: jump to any screen or lead, or run an action. */
export function Palette({ onAddLead }: { onAddLead: () => void }) {
  const { t, locale } = useT();
  const router = useRouter();
  const { leads, paletteOpen, setPaletteOpen, setOpenLead, resetDemo, toast } = useStore();
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(!paletteOpen); }
      if (e.key === "Escape" && paletteOpen) setPaletteOpen(false);
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [paletteOpen, setPaletteOpen]);
  useEffect(() => { if (paletteOpen) { setQ(""); setI(0); setTimeout(() => input.current?.focus(), 10); } }, [paletteOpen]);

  const items = useMemo<Item[]>(() => {
    const close = () => setPaletteOpen(false);
    const screens: Item[] = navGroups.flatMap((g) => g.items.map((it) => {
      const Icon = it.icon;
      return { id: `v-${it.id}`, group: t("Screens"), label: t(it.label), hint: t(g.label), icon: <Icon size={18} />, run: () => { close(); router.push(`/${locale}/app/${it.id}`); } };
    }));
    const people: Item[] = leads.map((l) => ({
      id: `l-${l.id}`, group: t("Leads"), label: l.name, hint: `${l.score} · ${t(l.area) || l.area} · ${l.budget}`,
      icon: <Monogram name={l.name} size={22} />, run: () => { close(); setOpenLead(l.id); router.push(`/${locale}/app/leads`); },
    }));
    const actions: Item[] = [
      { id: "a-add", group: t("Actions"), label: t("Add a lead"), icon: <Plus size={18} />, run: () => { close(); onAddLead(); } },
      { id: "a-reset", group: t("Actions"), label: t("Reset demo data"), icon: <ArrowCounterClockwise size={18} />, run: () => { close(); resetDemo(); toast(t("Demo data reset")); } },
    ];
    return [...actions, ...screens, ...people];
  }, [leads, locale, onAddLead, resetDemo, router, setOpenLead, setPaletteOpen, t, toast]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items.filter((x) => !x.id.startsWith("l-")).concat(items.filter((x) => x.id.startsWith("l-")).slice(0, 5));
    return items.filter((x) => `${x.label} ${x.hint ?? ""}`.toLowerCase().includes(s)).slice(0, 30);
  }, [items, q]);

  if (!paletteOpen) return null;
  const go = (k: number) => filtered[k]?.run();
  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label={t("Search")}>
      <button className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" aria-label={t("Close")} onClick={() => setPaletteOpen(false)} />
      <div className="enter-rise relative w-full max-w-[600px] overflow-hidden rounded-[18px] border border-hairline-soft bg-canvas shadow-[0_40px_100px_-20px_rgb(0_0_0/0.45)]">
        <div className="flex items-center gap-3 border-b border-hairline-soft px-4">
          <MagnifyingGlass size={18} className="text-ink-3" />
          <input
            ref={input}
            value={q}
            onChange={(e) => { setQ(e.target.value); setI(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(filtered.length - 1, x + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
              if (e.key === "Enter") { e.preventDefault(); go(i); }
            }}
            placeholder={t("Search leads, screens and actions")}
            aria-label={t("Search leads, screens and actions")}
            aria-controls="palette-list"
            aria-activedescendant={filtered[i] ? `pi-${filtered[i].id}` : undefined}
            className="h-14 flex-1 bg-transparent text-[17px] outline-none placeholder:text-ink-3"
          />
          <kbd className="rounded-md border border-hairline px-1.5 py-0.5 text-[11px] text-ink-3">esc</kbd>
        </div>
        <ul id="palette-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
          {filtered.length === 0 && <li className="px-3 py-8 text-center text-ink-2">{t("Nothing matches. Try a name, an area or a screen.")}</li>}
          {filtered.map((x, k) => {
            const head = x.group !== lastGroup ? (lastGroup = x.group) : null;
            return (
              <li key={x.id} role="presentation">
                {head && <p className="t-fine px-3 pb-1 pt-3 font-medium text-ink-3">{head}</p>}
                <button
                  id={`pi-${x.id}`}
                  role="option"
                  aria-selected={k === i}
                  onMouseMove={() => setI(k)}
                  onClick={() => go(k)}
                  className={cx("flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-start", k === i ? "bg-parchment" : "")}
                >
                  <span className="flex size-6 items-center justify-center text-ink-2">{x.icon}</span>
                  <span className="flex-1 truncate text-[15px]">{x.label}</span>
                  {x.hint && <span className="t-caption truncate text-ink-3">{x.hint}</span>}
                  {k === i && <ArrowElbowDownLeft size={14} className="text-ink-3 rtl:-scale-x-100" />}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="t-fine flex items-center gap-2 border-t border-hairline-soft px-4 py-2.5 text-ink-3"><User size={12} /> {t("Tip: press ⌘K or Ctrl+K anywhere in the app.")}</p>
      </div>
    </div>
  );
}
