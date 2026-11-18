"use client";
import type { ReactNode } from "react";
import type { Temp, Tone } from "@/lib/data";
import { usePathname } from "next/navigation";
import { useT } from "./i18n";
import { navFor } from "./nav";
import { useRole } from "./role";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function Card({ children, className, pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={cx("min-w-0 rounded-[18px] border border-hairline-soft bg-canvas", pad && "p-5", className)}>
      {children}
    </section>
  );
}

export function CardHead({ title, aside, sub }: { title: string; aside?: ReactNode; sub?: string }) {
  const { t } = useT();
  return (
    <header className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[17px] font-semibold tracking-[-0.016em]">{t(title)}</h2>
        {sub && <p className="t-caption mt-0.5 text-ink-2">{t(sub)}</p>}
      </div>
      {aside}
    </header>
  );
}

export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  const { t } = useT();
  // Section label from the sidebar group this screen sits in (Core, Intelligence, Channels...)
  const path = usePathname() ?? "";
  const id = path.split("/app/")[1]?.split(/[/?#]/)[0];
  const { role } = useRole();
  const group = navFor(role).find((g) => g.items.some((it) => it.id === id))?.label;
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {group && <p className="t-eyebrow mb-2 text-ink-3">{t(group)}</p>}
        <h1 className="lux-title">{t(title)}</h1>
        {sub && <p className="mt-1.5 max-w-[62ch] text-ink-2">{t(sub)}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** One cell of a stat strip: label, a big number, an optional delta and note. */
export function Stat({ label, value, delta, down, note }: { label: string; value: ReactNode; delta?: string; down?: boolean; note?: string }) {
  const { t } = useT();
  return (
    <div className="min-w-0 bg-canvas p-4 sm:px-5 sm:py-4">
      <p className="t-caption truncate text-ink-2">{t(label)}</p>
      <p className="tnum mt-1.5 truncate text-[26px] font-semibold leading-none tracking-[-0.025em] sm:text-[28px]">{value}</p>
      {(delta || note) && (
        <p className="t-caption mt-2 truncate text-ink-2">
          {delta && <span className={cx("tnum font-medium", down ? "text-ok" : "text-ok")}>{delta}</span>} {note && t(note)}
        </p>
      )}
    </div>
  );
}

/** Stats as a single strip with hairline dividers, instead of a row of separate boxes. */
export function Stats({ children }: { children: ReactNode }) {
  return <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-hairline-soft bg-hairline-soft lg:grid-cols-4">{children}</div>;
}

const tempCls: Record<Temp, string> = {
  hot: "bg-hot-soft text-hot",
  warm: "bg-warm-soft text-warm",
  cold: "bg-cold-soft text-cold",
};
export function TempBadge({ temp }: { temp: Temp }) {
  const { t } = useT();
  return <span className={cx("inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-medium", tempCls[temp])}>{t(temp[0].toUpperCase() + temp.slice(1))}</span>;
}

const toneCls: Record<Tone, string> = {
  hot: "bg-hot-soft text-hot", ok: "bg-ok-soft text-ok", creek: "bg-creek-soft text-creek",
  warm: "bg-warm-soft text-warm", cold: "bg-cold-soft text-cold", wa: "bg-ok-soft text-wa",
};
export function Pill({ tone = "creek", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cx("inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium", toneCls[tone])}>{children}</span>;
}
export function Dot({ tone = "ok", live }: { tone?: Tone; live?: boolean }) {
  const c: Record<Tone, string> = { hot: "bg-hot", ok: "bg-ok", creek: "bg-creek", warm: "bg-warm", cold: "bg-cold", wa: "bg-wa" };
  return <span aria-hidden className={cx("inline-block size-2 shrink-0 rounded-full", c[tone], live && "pulse-dot")} />;
}

/** Monogram disc. Hue is derived from the name so each person keeps a stable colour. */
export function Monogram({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const initials = name.split(/\s+/).filter((w) => !/^(al|el|bin)$/i.test(w)).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const hue = [190, 28, 210, 160, 40, 12, 175, 220][h % 8];
  return (
    <span
      aria-hidden
      className={cx("mono inline-flex shrink-0 items-center justify-center rounded-full font-semibold", className)}
      style={{ width: size, height: size, fontSize: size * 0.36, ["--mh" as string]: hue }}
    >
      {initials}
    </span>
  );
}

export function ScoreBar({ score, className }: { score: number; className?: string }) {
  const tone = score >= 78 ? "bg-hot" : score >= 55 ? "bg-warm" : "bg-cold";
  return (
    <span className={cx("inline-flex items-center gap-2", className)}>
      <span className="tnum w-6 text-[15px] font-semibold">{score}</span>
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-hairline-soft">
        <span className={cx("bar-in block h-full rounded-full", tone)} style={{ width: `${score}%` }} />
      </span>
    </span>
  );
}

export function Btn({ children, variant = "primary", onClick, className, type = "button", label }: { children: ReactNode; variant?: "primary" | "secondary" | "quiet"; onClick?: () => void; className?: string; type?: "button" | "submit"; label?: string }) {
  const v = {
    primary: "bg-creek text-on-creek hover:bg-creek-hover",
    secondary: "bg-parchment text-ink hover:bg-hairline-soft border border-hairline-soft",
    quiet: "text-creek hover:bg-creek-soft",
  }[variant];
  return (
    <button type={type} aria-label={label} onClick={onClick} className={cx("inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-[3px] px-4 text-[14px] font-medium transition active:scale-[.97]", v, className)}>
      {children}
    </button>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  const { t } = useT();
  return (
    <div role="tablist" aria-label={t(label)} className="scrollbar-none -mx-1 flex max-w-full gap-1 overflow-x-auto px-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "h-8 shrink-0 rounded-full px-3.5 text-[13px] font-medium transition",
            value === o.value ? "bg-ink text-canvas" : "text-ink-2 hover:bg-parchment hover:text-ink",
          )}
        >
          {t(o.label)}
        </button>
      ))}
    </div>
  );
}

export function Table({ head, children, minWidth = 720 }: { head: string[]; children: ReactNode; minWidth?: number }) {
  const { t } = useT();
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full border-collapse text-[14px]" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-hairline-soft text-start text-[12px] text-ink-2">
            {head.map((h) => (
              <th key={h} scope="col" className="py-2.5 pe-4 text-start font-medium">{t(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-hairline-soft [&>tr:last-child]:border-0 [&_td]:py-3 [&_td]:pe-4 [&_td]:align-middle">{children}</tbody>
      </table>
    </div>
  );
}

/** Simple bar chart (SVG), used for daily leads etc. */
export function Bars({ data, height = 120, labels }: { data: number[]; height?: number; labels?: string[] }) {
  const max = Math.max(...data);
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((v, i) => (
          <div key={i} className="group relative flex-1">
            <div
              className={cx("w-full origin-bottom rounded-[5px] transition-colors", i === data.length - 1 ? "bg-creek" : "bg-creek/25 group-hover:bg-creek/50")}
              style={{ height: (v / max) * height }}
              title={`${v}`}
            />
          </div>
        ))}
      </div>
      {labels && (
        <div className="t-fine mt-2 flex justify-between text-ink-3">
          {labels.map((l) => <span key={l}>{l}</span>)}
        </div>
      )}
    </div>
  );
}

export function Meter({ value, tone = "creek", className }: { value: number; tone?: "creek" | "hot" | "warm" | "cold" | "ok"; className?: string }) {
  const c = { creek: "bg-creek", hot: "bg-hot", warm: "bg-warm", cold: "bg-cold", ok: "bg-ok" }[tone];
  return (
    <span className={cx("block h-1.5 overflow-hidden rounded-full bg-hairline-soft", className)}>
      <span className={cx("bar-in block h-full rounded-full", c)} style={{ width: `${Math.min(100, value)}%` }} />
    </span>
  );
}
