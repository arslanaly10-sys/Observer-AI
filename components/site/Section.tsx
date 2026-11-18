import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { img, type PhotoKey } from "@/lib/img";
import { InlineCta } from "@/components/site/InlineCta";
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

type CtaCopy = { label: string; placeholder: string; reassure: string };

/**
 * Closing call to action: one photograph, a headline set across the width, and the ask
 * as a single WhatsApp-number field with a reassurance line (patterns from CTA Gallery).
 */
export function CloseBand({ h, body, locale, button, form, cta2, aside, photo = "villaDusk" }: { h: string; body?: string; locale: string; button: string; form: CtaCopy; cta2?: [string, string]; aside?: ReactNode; photo?: PhotoKey }) {
  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      <Image src={img(photo, 2400)} alt="" fill sizes="100vw" className="-z-10 object-cover object-[50%_65%] opacity-75" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/75 to-black/25" />
      <div className="mx-auto max-w-[1240px] px-4 pb-14 pt-28 sm:px-6 md:pb-16 md:pt-44">
        <h2 className="t-giant max-w-[15ch]">{h}</h2>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">
          {body ? <p className="t-lead max-w-[46ch] text-white/75">{body}</p> : <span />}
          <div>
            <InlineCta locale={locale} label={form.label} placeholder={form.placeholder} button={button} reassure={form.reassure} size="lg" />
            {cta2 && (
              <Link href={cta2[1]} className="mt-4 inline-flex min-h-11 items-center gap-2 text-[15px] text-white/85 underline-offset-4 hover:underline">
                {cta2[0]}<ArrowRight size={15} className="rtl:-scale-x-100" />
              </Link>
            )}
          </div>
        </div>
        {aside && <div className="mt-14 border-t border-white/12 pt-6">{aside}</div>}
      </div>
    </section>
  );
}
