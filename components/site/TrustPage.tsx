import { Tile } from "@/components/site/Section";

/** Shared layout for Security, Privacy and Terms. A draft notice is shown when the text awaits legal review. */
export function TrustPage({ h1, sub, draft, sections }: { h1: string; sub?: string; draft?: string; sections: { h: string; t: string }[] }) {
  return (
    <Tile className="pt-14">
      <div className="mx-auto max-w-[720px]">
        <h1 className="t-display">{h1}</h1>
        {sub && <p className="t-lead mt-5 text-ink-2">{sub}</p>}
        {draft && <p role="note" className="mt-6 rounded-[12px] border border-warm/30 bg-warm-soft px-4 py-3 text-[15px] text-warm">{draft}</p>}
        <dl className="mt-12 space-y-9">
          {sections.map((s) => (
            <div key={s.h} className="border-t border-hairline pt-6">
              <dt className="t-tagline">{s.h}</dt>
              <dd className="mt-2 text-[17px] leading-relaxed text-ink-2">{s.t}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Tile>
  );
}
