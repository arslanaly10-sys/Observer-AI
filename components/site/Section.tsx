import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

type Ground = "canvas" | "parchment" | "tile";
const grounds: Record<Ground, string> = {
  canvas: "bg-canvas text-ink",
  parchment: "bg-parchment text-ink",
  tile: "bg-tile text-white",
};

/** An Apple-style full-bleed tile. */
export function Tile({ ground = "canvas", children, className = "", id }: { ground?: Ground; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`${grounds[ground]} ${className}`}>
      <div className="mx-auto max-w-[1180px] px-4 py-20 sm:px-6 md:py-28">{children}</div>
    </section>
  );
}

export function Heading({ h, body, center = true, dark, level = 2 }: { h: string; body?: string; center?: boolean; dark?: boolean; level?: 1 | 2 }) {
  const H = level === 1 ? "h1" : "h2";
  return (
    <div className={center ? "mx-auto max-w-[760px] text-center" : "max-w-[620px]"}>
      <H className={level === 1 ? "t-hero" : "t-display"}>{h}</H>
      {body && <p className={`t-lead mt-5 ${dark ? "text-white/70" : "text-ink-2"}`}>{body}</p>}
    </div>
  );
}

export function Cta({ href, children, ghost, dark }: { href: string; children: ReactNode; ghost?: boolean; dark?: boolean }) {
  if (ghost)
    return (
      <Link href={href} className={`btn btn-ghost ${dark ? "btn-on-dark" : ""}`}>
        <span>{children}</span>
        <ArrowRight size={16} className="rtl:-scale-x-100" />
      </Link>
    );
  return <Link href={href} className="btn btn-primary">{children}</Link>;
}
