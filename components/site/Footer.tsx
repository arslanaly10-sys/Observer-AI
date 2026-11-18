import Link from "next/link";
import { Logo } from "@/components/Logo";
import type { Locale } from "@/lib/i18n";
import type { SiteDict } from "@/dictionaries/site";

export function Footer({ locale, t, legal }: { locale: Locale; t: SiteDict["footer"]; legal: [string, string][] }) {
  return (
    <footer className="border-t border-white/10 bg-black text-white/55">
      <div className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-white">
              <Logo className="size-6" />
              <span className="lux-wordmark text-[17px] font-semibold tracking-[-0.02em]">Observer</span>
            </Link>
            <p className="t-caption mt-3 max-w-[28ch]">{t.line}</p>
          </div>
          {t.cols.map((c) => (
            <div key={c.h}>
              <h2 className="t-caption font-semibold text-white">{c.h}</h2>
              <ul className="mt-3 space-y-1">
                {c.links.map(([l, h]) => (
                  <li key={l}><Link href={`/${locale}${h}`} className="t-caption inline-flex min-h-8 items-center hover:text-white">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="t-fine mt-12 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6">
          <p>© {new Date().getFullYear()} {t.rights} {t.data}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {legal.map(([l, h]) => <li key={h}><Link href={`/${locale}${h}`} className="hover:text-white">{l}</Link></li>)}
            <li>{t.credits}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
