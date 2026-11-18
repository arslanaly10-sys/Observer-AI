import { Tile } from "@/components/site/Section";

const slug = (s: string, i: number) => `s${i + 1}-${s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`.replace(/-$/, "");

/**
 * Shared layout for Security, Privacy and Terms: title and contents in a sticky left
 * column, the sections on the right. A draft notice is shown while the text awaits legal review.
 */
export function TrustPage({ h1, sub, draft, sections, contents = "On this page" }: { h1: string; sub?: string; draft?: string; sections: { h: string; t: string }[]; contents?: string }) {
  return (
    <Tile>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="t-hero">{h1}</h1>
          {sub && <p className="t-lead mt-5 text-ink-2">{sub}</p>}
          {draft && <p role="note" className="mt-6 rounded-[12px] border border-warm/30 bg-warm-soft px-4 py-3 text-[15px] text-warm">{draft}</p>}
          <nav aria-label={contents} className="mt-10 hidden lg:block">
            <p className="t-eyebrow text-ink-3">{contents}</p>
            <ol className="mt-3 space-y-1.5">
              {sections.map((s, i) => (
                <li key={s.h}>
                  <a href={`#${slug(s.h, i)}`} className="flex gap-3 text-[15px] text-ink-2 hover:text-ink">
                    <span className="tnum w-5 text-ink-3">{i + 1}</span>{s.h}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <dl className="divide-y divide-hairline border-y border-hairline">
          {sections.map((s, i) => (
            <div key={s.h} id={slug(s.h, i)} className="grid scroll-mt-24 gap-2 py-7 sm:grid-cols-[2.5rem_1fr]">
              <span className="tnum hidden pt-0.5 text-[15px] text-ink-3 sm:block">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <dt className="t-tagline">{s.h}</dt>
                <dd className="mt-2 text-[17px] leading-relaxed text-ink-2">{s.t}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </Tile>
  );
}
