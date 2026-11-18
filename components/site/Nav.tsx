"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List, X, Translate, CaretDown } from "@phosphor-icons/react";
import { audienceIds, type SiteDict as SD } from "@/dictionaries/site";
import { Logo } from "@/components/Logo";
import { switchPath, otherLocale, type Locale } from "@/lib/i18n";
import type { SiteDict } from "@/dictionaries/site";

export function Nav({ locale, t, audiences, menuLabel }: { locale: Locale; t: SiteDict["nav"]; audiences: SD["audiences"]; menuLabel: string }) {
  const pathname = usePathname();
  const dark = pathname === `/${locale}` || pathname.startsWith(`/${locale}/solutions`) || pathname === `/${locale}/about`;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sol, setSol] = useState(false);
  useEffect(() => setSol(false), [pathname]);
  useEffect(() => {
    if (!sol) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setSol(false);
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [sol]);
  const remember = (l: string) => { try { document.cookie = `obs-lang=${l}; path=/; max-age=31536000; samesite=lax`; } catch {} };
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(scrollY > 24);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);
  const onDark = dark && !scrolled && !open && !sol;
  const links: [string, string][] = [["/product", t.product], ["/solutions/brokerages", t.solutions], ["/pricing", t.pricing], ["/about", t.about], ["/contact", t.contact]];
  const href = (p: string) => `/${locale}${p}`;
  const active = (p: string) => pathname.startsWith(href(p.split("/").slice(0, 2).join("/")));

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-canvas focus:px-4 focus:py-2 focus:text-ink">{t.skip}</a>
      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${onDark ? "bg-gradient-to-b from-black/60 via-black/25 to-transparent text-white" : "border-b border-hairline-soft bg-canvas/80 text-ink backdrop-blur-xl"}`}>
        <nav aria-label="Main" className="mx-auto flex h-14 max-w-[1180px] items-center gap-6 px-4 sm:px-6">
          <Link href={href("")} className="flex min-h-11 items-center gap-2" aria-label="Observer AI">
            <Logo className="size-6" tone={onDark ? "light" : "auto"} />
            <span className="text-[17px] font-semibold tracking-[-0.02em]">Observer</span>
          </Link>
          <ul className="ms-4 hidden items-center gap-1 md:flex">
            {links.map(([p, l]) => p.startsWith("/solutions") ? (
              <li key={p} className="relative" onMouseLeave={() => setSol(false)}>
                <button
                  onClick={() => setSol((v) => !v)}
                  onMouseEnter={() => setSol(true)}
                  aria-expanded={sol}
                  aria-controls="solutions-menu"
                  className={`flex min-h-11 items-center gap-1 rounded-full px-3 text-[14px] transition-opacity ${active(p) || sol ? "opacity-100" : "opacity-90 hover:opacity-100"}`}
                >
                  {l} <CaretDown size={12} className={`transition-transform ${sol ? "rotate-180" : ""}`} />
                </button>
                {sol && (
                  <div id="solutions-menu" className="absolute start-0 top-full pt-2">
                    <div className="enter-rise w-[520px] rounded-[18px] border border-hairline-soft bg-canvas p-3 text-ink shadow-[0_30px_70px_-20px_rgb(0_0_0/0.3)]">
                      <p className="t-fine px-3 pb-2 pt-1 text-ink-3">{menuLabel}</p>
                      <ul className="grid grid-cols-2 gap-1">
                        {audienceIds.map((id) => (
                          <li key={id}>
                            <Link href={href(`/solutions/${id}`)} className="block rounded-[12px] p-3 hover:bg-parchment">
                              <span className="block text-[15px] font-semibold">{audiences[id].label}</span>
                              <span className="t-caption mt-0.5 line-clamp-2 block text-ink-2">{audiences[id].short}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            ) : (
              <li key={p}>
                <Link href={href(p)} aria-current={active(p) ? "page" : undefined} className={`flex min-h-11 items-center rounded-full px-3 text-[14px] transition-opacity ${active(p) ? "opacity-100" : "opacity-90 hover:opacity-100"}`}>{l}</Link>
              </li>
            ))}
          </ul>
          <div className="ms-auto flex items-center gap-1">
            <Link href={switchPath(pathname, otherLocale(locale))} lang={otherLocale(locale)} onClick={() => remember(otherLocale(locale))} className="hidden min-h-11 items-center gap-1.5 rounded-full px-3 text-[14px] opacity-90 hover:opacity-100 sm:flex">
              <Translate size={16} /> {t.lang}
            </Link>
            <Link href={href("/app/dashboard")} className="hidden min-h-11 items-center px-3 text-[14px] opacity-90 hover:opacity-100 xl:flex">{t.app}</Link>
            <Link href={href("/login")} className="hidden min-h-11 items-center px-3 text-[14px] opacity-90 hover:opacity-100 md:flex">{t.signin}</Link>
            <Link href={href("/contact")} className={`btn hidden !min-h-9 !px-4 !text-[14px] sm:inline-flex ${onDark ? "bg-white text-[#1d1d1f] hover:bg-white/90" : "btn-primary"}`}>{t.demo}</Link>
            <button className="flex size-11 items-center justify-center md:hidden" aria-label={open ? t.close : t.menu} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={22} /> : <List size={22} />}
            </button>
          </div>
        </nav>
      </header>
      {open && (
        <div id="mobile-menu" className="fixed inset-0 top-14 z-40 overflow-y-auto bg-canvas px-6 pb-10 pt-4 md:hidden">
          <ul className="divide-y divide-hairline-soft">
            {links.map(([p, l]) => (
              <li key={p}>
                <Link href={href(p)} className="flex min-h-14 items-center text-[24px] font-semibold tracking-[-0.02em]">{l}</Link>
                {p.startsWith("/solutions") && (
                  <ul className="-mt-1 mb-3 grid grid-cols-2 gap-x-4">
                    {audienceIds.map((id) => <li key={id}><Link href={href(`/solutions/${id}`)} className="flex min-h-11 items-center text-[17px] text-ink-2">{audiences[id].label}</Link></li>)}
                  </ul>
                )}
              </li>
            ))}
            <li><Link href={href("/app/dashboard")} className="flex min-h-14 items-center text-[24px] font-semibold tracking-[-0.02em]">{t.app}</Link></li>
            <li><Link href={href("/login")} className="flex min-h-14 items-center text-[24px] font-semibold tracking-[-0.02em]">{t.signin}</Link></li>
          </ul>
          <Link href={href("/contact")} className="btn btn-primary mt-8 w-full">{t.demo}</Link>
          <Link href={switchPath(pathname, otherLocale(locale))} lang={otherLocale(locale)} onClick={() => remember(otherLocale(locale))} className="btn btn-ghost mt-3 w-full"><Translate size={18} /> <span>{t.lang}</span></Link>
        </div>
      )}
    </>
  );
}
