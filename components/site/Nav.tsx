"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List, X, Translate } from "@phosphor-icons/react";
import { Logo } from "@/components/Logo";
import { switchPath, otherLocale, type Locale } from "@/lib/i18n";
import type { SiteDict } from "@/dictionaries/site";

export function Nav({ locale, t }: { locale: Locale; t: SiteDict["nav"] }) {
  const pathname = usePathname();
  const dark = pathname === `/${locale}` || pathname.startsWith(`/${locale}/solutions`);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
  const onDark = dark && !scrolled && !open;
  const links: [string, string][] = [["/product", t.product], ["/solutions/brokerages", t.solutions], ["/pricing", t.pricing], ["/about", t.about], ["/contact", t.contact]];
  const href = (p: string) => `/${locale}${p}`;
  const active = (p: string) => pathname.startsWith(href(p.split("/").slice(0, 2).join("/")));

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-canvas focus:px-4 focus:py-2 focus:text-ink">{t.skip}</a>
      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${onDark ? "text-white" : "border-b border-hairline-soft bg-canvas/80 text-ink backdrop-blur-xl"}`}>
        <nav aria-label="Main" className="mx-auto flex h-14 max-w-[1180px] items-center gap-6 px-4 sm:px-6">
          <Link href={href("")} className="flex min-h-11 items-center gap-2" aria-label="Observer AI">
            <Logo className="size-6" tone={onDark ? "light" : "auto"} />
            <span className="text-[17px] font-semibold tracking-[-0.02em]">Observer</span>
          </Link>
          <ul className="ms-4 hidden items-center gap-1 md:flex">
            {links.map(([p, l]) => (
              <li key={p}>
                <Link href={href(p)} aria-current={active(p) ? "page" : undefined} className={`flex min-h-11 items-center rounded-full px-3 text-[14px] transition-opacity ${active(p) ? "opacity-100" : "opacity-75 hover:opacity-100"}`}>{l}</Link>
              </li>
            ))}
          </ul>
          <div className="ms-auto flex items-center gap-1">
            <Link href={switchPath(pathname, otherLocale(locale))} lang={otherLocale(locale)} className="hidden min-h-11 items-center gap-1.5 rounded-full px-3 text-[14px] opacity-75 hover:opacity-100 sm:flex">
              <Translate size={16} /> {t.lang}
            </Link>
            <Link href={href("/app/dashboard")} className="hidden min-h-11 items-center px-3 text-[14px] opacity-75 hover:opacity-100 lg:flex">{t.app}</Link>
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
              <li key={p}><Link href={href(p)} className="flex min-h-14 items-center text-[24px] font-semibold tracking-[-0.02em]">{l}</Link></li>
            ))}
            <li><Link href={href("/app/dashboard")} className="flex min-h-14 items-center text-[24px] font-semibold tracking-[-0.02em]">{t.app}</Link></li>
          </ul>
          <Link href={href("/contact")} className="btn btn-primary mt-8 w-full">{t.demo}</Link>
          <Link href={switchPath(pathname, otherLocale(locale))} lang={otherLocale(locale)} className="btn btn-ghost mt-3 w-full"><Translate size={18} /> <span>{t.lang}</span></Link>
        </div>
      )}
    </>
  );
}
