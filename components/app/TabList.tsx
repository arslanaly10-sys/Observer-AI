"use client";
import { useRef, type KeyboardEvent } from "react";
import { cx } from "./ui";

/**
 * Accessible tabs (WAI-ARIA tabs pattern): one tab in the Tab order, arrow keys / Home / End move between tabs
 * and select them, and each tab points at the panel it controls (`${id}-panel`). RTL flips the arrows.
 */
export function TabList<T extends string>({ id, label, tabs, value, onChange, className }: { id: string; label: string; tabs: [T, string][]; value: T; onChange: (v: T) => void; className?: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex(([v]) => v === value);
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const next = { ArrowRight: rtl ? i - 1 : i + 1, ArrowLeft: rtl ? i + 1 : i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const j = (next + tabs.length) % tabs.length;
    onChange(tabs[j][0]);
    refs.current[j]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} onKeyDown={move} className={cx("flex flex-wrap gap-1.5", className)}>
      {tabs.map(([v, l], i) => (
        <button key={v} ref={(el) => { refs.current[i] = el; }} id={`${id}-tab-${v}`} role="tab" type="button" aria-selected={value === v} aria-controls={`${id}-panel`} tabIndex={value === v ? 0 : -1}
          onClick={() => onChange(v)} className={cx("h-9 rounded-full px-3.5 text-[14px] outline-offset-2", value === v ? "bg-ink text-canvas" : "bg-parchment text-ink-2")}>{l}</button>
      ))}
    </div>
  );
}
