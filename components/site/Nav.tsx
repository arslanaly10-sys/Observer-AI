"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  List, X, Translate, CaretDown, ArrowRight, Play,
  Sparkle, ChatsCircle, ChartLineUp, Calculator, ShieldCheck,
  Buildings, IdentificationBadge, Crane, Coins, type IconProps,
} from "@phosphor-icons/react";
import { audienceIds, type SiteDict } from "@/dictionaries/site";
import type { ExtraDict } from "@/dictionaries/site-extra";
import { Logo } from "@/components/Logo";
import { InlineCta } from "@/components/site/InlineCta";
import { img } from "@/lib/img";
import { switchPath, otherLocale, type Locale } from "@/lib/i18n";

type Icon = ComponentType<IconProps>;
const groupIcon: Record<string, Icon> = { intelligence: Sparkle, channels: ChatsCircle, analytics: ChartLineUp, market: Calculator, enterprise: ShieldCheck };
const audienceIcon: Record<string, Icon> = { brokerages: Buildings, agents: IdentificationBadge, developers: Crane, investors: Coins };
type Menu = null | "product" | "solutions";

/**
 * Site navigation (patterns from navbar-gallery/: Ramp's grouped mega menu with a featured card,
 * Stripe's icon items, Wealthsimple's intro panel, and a photo-led phone menu after the
 * real-estate entries). Menus open on click, hover and keyboard; close on Escape, outside click
 * and route change. The phone menu keeps focus inside itself.
 */
export function Nav({ locale, t, audiences, menuLabel, groups, x, cta }: {
  locale: Locale; t: SiteDict["nav"]; audiences: SiteDict["audiences"]; menuLabel: string;
  groups: SiteDict["product"]["groups"]; x: ExtraDict["navx"]; cta: ExtraDict["cta"];
}) {
  const pathname = usePathname();
  const dark = pathname === `/${locale}` || pathname.startsWith(`/${locale}/solutions`) || pathname === `/${locale}/about`;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<Menu>(null);
  const header = useRef<HTMLElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  // A click straight after hover opened the menu should keep it open, not toggle it shut
  const hoverAt = useRef(0);

  useEffect(() => { setMenu(null); setOpen(false); }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(scrollY > 24);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  // Desktop menus: Escape and outside click close them
  useEffect(() => {
    if (!menu) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenu(null); (document.querySelector(`[aria-controls="${menu}-menu"]`) as HTMLElement | null)?.focus(); } };
    const down = (e: PointerEvent) => { if (!header.current?.contains(e.target as Node)) setMenu(null); };
    addEventListener("keydown", key);
    addEventListener("pointerdown", down);
    return () => { removeEventListener("keydown", key); removeEventListener("pointerdown", down); };
  }, [menu]);
  // Phone menu: lock scroll, move focus in, keep it in, Escape closes
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    phone.current?.querySelector<HTMLElement>("a, button, input")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); toggle.current?.focus(); return; }
      if (e.key !== "Tab" || !phone.current) return;
      const items = [toggle.current, ...phone.current.querySelectorAll<HTMLElement>("a[href], button, input")].filter(Boolean) as HTMLElement[];
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i === items.length - 1 ? 0 : i + 1);
      e.preventDefault();
      items[next].focus();
    };
    addEventListener("keydown", key);
    return () => { removeEventListener("keydown", key); document.body.style.overflow = ""; };
  }, [open]);

  const remember = (l: string) => { try { document.cookie = `obs-lang=${l}; path=/; max-age=31536000; samesite=lax`; } catch {} };
  const onDark = dark && !scrolled && !open && !menu;
  const href = (p: string) => `/${locale}${p}`;
  const active = (p: string) => pathname.startsWith(href(p.split("/").slice(0, 2).join("/")));
  const links: [string, string, Menu][] = [["/product", t.product, "product"], ["/solutions/brokerages", t.solutions, "solutions"], ["/pricing", t.pricing, null], ["/about", t.about, null], ["/contact", t.contact, null]];
  const item = "flex min-h-11 items-center gap-1 rounded-full px-3 text-[14px] transition-opacity";

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-canvas focus:px-4 focus:py-2 focus:text-ink">{t.skip}</a>
      <header ref={header} onMouseLeave={() => setMenu(null)} className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${onDark ? "bg-gradient-to-b from-black/60 via-black/25 to-transparent text-white" : "border-b border-hairline-soft bg-canvas/85 text-ink backdrop-blur-xl"}`}>
        <nav aria-label="Main" className="relative mx-auto flex h-14 max-w-[1240px] items-center gap-6 px-4 sm:px-6">
          <Link href={href("")} className="flex min-h-11 items-center gap-2" aria-label="Observer AI" onMouseEnter={() => setMenu(null)}>
            <Logo className="size-6" tone={onDark ? "light" : "auto"} />
            <span className="text-[17px] font-semibold tracking-[-0.02em]">Observer</span>
          </Link>
          <ul className="ms-4 hidden items-center gap-1 md:flex">
            {links.map(([p, l, m]) => m ? (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => setMenu((v) => (v === m && Date.now() - hoverAt.current > 400 ? null : m))}
                  onPointerEnter={(e) => { if (e.pointerType === "mouse" && menu !== m) { hoverAt.current = Date.now(); setMenu(m); } }}
                  aria-expanded={menu === m}
                  aria-controls={`${m}-menu`}
                  className={`${item} ${active(p) || menu === m ? "opacity-100" : "opacity-90 hover:opacity-100"} ${menu === m ? "bg-ink/[0.06]" : ""}`}
                >
                  {l} <CaretDown size={12} className={`transition-transform ${menu === m ? "rotate-180" : ""}`} />
                </button>
              </li>
            ) : (
              <li key={p} onMouseEnter={() => setMenu(null)}>
                <Link href={href(p)} aria-current={active(p) ? "page" : undefined} className={`${item} ${active(p) ? "opacity-100" : "opacity-90 hover:opacity-100"}`}>{l}</Link>
              </li>
            ))}
          </ul>
          <div className="ms-auto flex items-center gap-1" onMouseEnter={() => setMenu(null)}>
            <Link href={switchPath(pathname, otherLocale(locale))} lang={otherLocale(locale)} onClick={() => remember(otherLocale(locale))} className="hidden min-h-11 items-center gap-1.5 rounded-full px-3 text-[14px] opacity-90 hover:opacity-100 sm:flex">
              <Translate size={16} /> {t.lang}
            </Link>
            <Link href={href("/app/dashboard")} className="hidden min-h-11 items-center px-3 text-[14px] opacity-90 hover:opacity-100 xl:flex">{t.app}</Link>
            <Link href={href("/login")} className="hidden min-h-11 items-center px-3 text-[14px] opacity-90 hover:opacity-100 md:flex">{t.signin}</Link>
            <Link href={href("/contact")} className={`btn hidden !min-h-9 !px-4 !text-[14px] sm:inline-flex ${onDark ? "bg-white text-[#1d1d1f] hover:bg-white/90" : "btn-primary"}`}>{t.demo}</Link>
            <button ref={toggle} type="button" className="flex size-11 items-center justify-center md:hidden" aria-label={open ? t.close : t.menu} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={22} /> : <List size={22} />}
            </button>
          </div>

          {/* Product: grouped mega menu with an intro panel and a featured card */}
          {menu === "product" && (
            <div id="product-menu" className="absolute inset-x-4 top-full hidden pt-2 sm:inset-x-6 md:block">
              <div className="menu-in grid overflow-hidden rounded-[22px] border border-hairline-soft bg-canvas text-ink shadow-[0_30px_80px_-24px_rgb(0_0_0/0.35)] lg:grid-cols-[240px_1fr_260px]">
                <div className="hidden flex-col justify-between bg-parchment p-6 lg:flex">
                  <div>
                    <p className="text-[19px] font-semibold leading-tight tracking-[-0.02em]">{x.product.h}</p>
                    <p className="t-caption mt-2 text-ink-2">{x.product.t}</p>
                  </div>
                  <Link href={href("/product")} className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-creek hover:underline">{x.product.all}<ArrowRight size={14} className="rtl:-scale-x-100" /></Link>
                </div>
                <ul className="grid content-start gap-1 p-3 sm:grid-cols-2">
                  {groups.map((g) => {
                    const I = groupIcon[g.id] ?? Sparkle;
                    return (
                      <li key={g.id}>
                        <Link href={href(`/product#${g.id}`)} onClick={() => setMenu(null)} className="group flex gap-3 rounded-[14px] p-3 hover:bg-parchment">
                          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-hairline-soft bg-canvas text-creek group-hover:border-hairline"><I size={18} /></span>
                          <span>
                            <span className="block text-[15px] font-semibold">{g.h}</span>
                            <span className="t-caption mt-0.5 line-clamp-2 block text-ink-2">{g.t}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Link href={href("#night-shift")} onClick={() => setMenu(null)} className="group relative m-3 hidden min-h-[220px] overflow-hidden rounded-[16px] bg-black text-white lg:block">
                  <Image src={img("burjNight", 700)} alt="" fill sizes="260px" className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-[1.04]" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-4">
                    <span className="t-eyebrow flex items-center gap-1.5 text-white/70"><Play size={12} weight="fill" />{x.featured.eyebrow}</span>
                    <span className="mt-1.5 block text-[16px] font-semibold leading-snug">{x.featured.h}</span>
                    <span className="mt-1 block text-[12.5px] text-white/70">{x.featured.t}</span>
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* Solutions: intro panel and audiences with icons */}
          {menu === "solutions" && (
            <div id="solutions-menu" className="absolute inset-x-4 top-full hidden pt-2 sm:inset-x-6 md:block">
              <div className="menu-in mx-auto grid max-w-[820px] overflow-hidden rounded-[22px] border border-hairline-soft bg-canvas text-ink shadow-[0_30px_80px_-24px_rgb(0_0_0/0.35)] lg:grid-cols-[240px_1fr]">
                <div className="hidden flex-col justify-between bg-parchment p-6 lg:flex">
                  <div>
                    <p className="t-eyebrow text-ink-3">{menuLabel}</p>
                    <p className="mt-2 text-[19px] font-semibold leading-tight tracking-[-0.02em]">{x.solutions.h}</p>
                    <p className="t-caption mt-2 text-ink-2">{x.solutions.t}</p>
                  </div>
                  <Link href={href("/contact")} className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-creek hover:underline">{x.solutions.all}<ArrowRight size={14} className="rtl:-scale-x-100" /></Link>
                </div>
                <ul className="grid content-start gap-1 p-3 sm:grid-cols-2">
                  {audienceIds.map((id) => {
                    const I = audienceIcon[id];
                    return (
                      <li key={id}>
                        <Link href={href(`/solutions/${id}`)} onClick={() => setMenu(null)} aria-current={pathname === href(`/solutions/${id}`) ? "page" : undefined} className="group flex gap-3 rounded-[14px] p-3 hover:bg-parchment aria-[current=page]:bg-parchment">
                          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-hairline-soft bg-canvas text-creek group-hover:border-hairline"><I size={18} /></span>
                          <span>
                            <span className="block text-[15px] font-semibold">{audiences[id].label}</span>
                            <span className="t-caption mt-0.5 line-clamp-2 block text-ink-2">{audiences[id].short}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Phone menu: a photograph at the top, the links, and the WhatsApp demo field at the bottom */}
      {open && (
        <div id="mobile-menu" ref={phone} role="dialog" aria-modal="true" aria-label={t.menu} className="fixed inset-0 top-14 z-40 overflow-y-auto bg-canvas md:hidden">
          <div className="relative h-32 overflow-hidden bg-black">
            <Image src={img("skylineNight", 900)} alt="" fill sizes="100vw" className="object-cover opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <p className="absolute inset-x-6 bottom-4 text-[17px] font-semibold leading-snug text-white">{x.phone.tag}</p>
          </div>
          <div className="px-6 pb-8 pt-2">
            <ul className="divide-y divide-hairline-soft">
              {links.map(([p, l]) => (
                <li key={p}>
                  <Link href={href(p)} aria-current={active(p) ? "page" : undefined} className="flex min-h-14 items-center justify-between text-[22px] font-semibold tracking-[-0.02em]">
                    {l}<ArrowRight size={18} className="text-ink-3 rtl:-scale-x-100" />
                  </Link>
                  {p.startsWith("/solutions") && (
                    <ul className="-mt-1 mb-3 grid grid-cols-2 gap-x-4">
                      {audienceIds.map((id) => {
                        const I = audienceIcon[id];
                        return <li key={id}><Link href={href(`/solutions/${id}`)} className="flex min-h-11 items-center gap-2 text-[16px] text-ink-2"><I size={16} className="text-creek" />{audiences[id].label}</Link></li>;
                      })}
                    </ul>
                  )}
                </li>
              ))}
              <li><Link href={href("/app/dashboard")} className="flex min-h-14 items-center text-[22px] font-semibold tracking-[-0.02em]">{t.app}</Link></li>
              <li><Link href={href("/login")} className="flex min-h-14 items-center text-[22px] font-semibold tracking-[-0.02em]">{t.signin}</Link></li>
            </ul>
            <div className="mt-6 rounded-[22px] bg-black p-5 text-white">
              <p className="mb-4 text-[18px] font-semibold tracking-[-0.02em]">{x.phone.ctaH}</p>
              <InlineCta locale={locale} label={cta.label} placeholder={cta.placeholder} button={t.demo} reassure={cta.reassure} stack />
            </div>
            <Link href={switchPath(pathname, otherLocale(locale))} lang={otherLocale(locale)} onClick={() => remember(otherLocale(locale))} className="btn btn-ghost mt-4 w-full"><Translate size={18} /> <span>{t.lang}</span></Link>
          </div>
        </div>
      )}
    </>
  );
}
