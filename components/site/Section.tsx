import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

type Ground = "canvas" | "parchment" | "tile" | "night";
const grounds: Record<Ground, string> = {
  canvas: "bg-canvas text-ink",
  parchment: "bg-parchment text-ink",
  tile: "bg-tile text-white",
  night: "bg-black text-white",
};

/** A full-bleed section. Compact rhythm: 64px on phones, 96px on desktop. */
export function Tile({ ground = "canvas", children, className = "", id, rule }: { ground?: Ground; children: ReactNode; className?: string; id?: string; rule?: boolean }) {
  return (
    <section id={id} className={`${grounds[ground]} ${className}`}>
      <div className={`mx-auto max-w-[1240px] px-4 py-16 sm:px-6 md:py-24 ${rule ? "border-t border-hairline" : ""}`}>{children}</div>
    </section>
  );
}

/** Small label above a heading: a timestamp or a section name. */
export function Eyebrow({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <p className={`t-eyebrow mb-4 ${dark ? "text-white/55" : "text-ink-3"}`}>{children}</p>;
}

/**
 * Section heading. Left-aligned by default; with a body it splits into two columns
 * (heading left, supporting text right) so the width is used instead of a centred stack.
 */
export function Heading({ h, body, center = false, dark, level = 2, eyebrow, stack }: { h: string; body?: string; center?: boolean; dark?: boolean; level?: 1 | 2; eyebrow?: string; stack?: boolean }) {
  const H = level === 1 ? "h1" : "h2";
  const title = <H className={level === 1 ? "t-hero" : "t-display"}>{h}</H>;
  const sub = body && <p className={`t-lead ${dark ? "text-white/70" : "text-ink-2"}`}>{body}</p>;
  if (center)
    return (
      <div className="mx-auto max-w-[760px] text-center">
        {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
        {title}
        {sub && <div className="mt-4">{sub}</div>}
      </div>
    );
  if (!body || stack)
    return (
      <div className="max-w-[720px]">
        {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
        {title}
        {sub && <div className="mt-4">{sub}</div>}
      </div>
    );
  return (
    <div className="grid gap-x-16 gap-y-4 lg:grid-cols-[1.15fr_1fr] lg:items-end">
      <div>
        {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
        {title}
      </div>
      <div className="lg:pb-1.5">{sub}</div>
    </div>
  );
}

export function Cta({ href, children, ghost, dark }: { href: string; children: ReactNode; ghost?: boolean; dark?: boolean }) {
  if (ghost)
    return (
      <Link href={href} className={`btn btn-ghost ${dark ? "btn-on-dark px-5" : ""}`}>
        <span>{children}</span>
        <ArrowRight size={16} className="rtl:-scale-x-100" />
      </Link>
    );
  if (dark) return <Link href={href} className="btn bg-white text-[#1d1d1f] hover:bg-white/90">{children}</Link>;
  return <Link href={href} className="btn btn-primary">{children}</Link>;
}

/** Closing band on the night canvas: headline and buttons left, optional detail right. */
export function CloseBand({ h, body, cta, cta2, aside }: { h: string; body?: string; cta: [string, string]; cta2?: [string, string]; aside?: ReactNode }) {
  return (
    <Tile ground="night">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div>
          <h2 className="t-display max-w-[16ch]">{h}</h2>
          {body && <p className="t-lead mt-4 max-w-[48ch] text-white/65">{body}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Cta href={cta[1]} dark>{cta[0]}</Cta>
            {cta2 && <Cta href={cta2[1]} ghost dark>{cta2[0]}</Cta>}
          </div>
        </div>
        {aside}
      </div>
    </Tile>
  );
}
