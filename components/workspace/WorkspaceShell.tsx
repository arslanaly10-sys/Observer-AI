"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { SquaresFour, UsersThree, Kanban, UsersFour, GearSix, ChatsCircle, Buildings, CalendarDots, Sparkle, Calculator as CalcIcon, ChartLineUp, SignOut, Translate, List, X, CaretUpDown, Flask, Plus } from "@phosphor-icons/react";
import { useT } from "@/components/app/i18n";
import { Monogram, cx } from "@/components/app/ui";
import { Logo } from "@/components/Logo";
import { switchPath, otherLocale } from "@/lib/i18n";
import { signOut, switchWorkspace } from "@/app/[locale]/workspace/actions";

type M = { role: string; workspace: { id: string; name: string; city: string | null } };

export function WorkspaceShell({ children, memberships, currentId, userName, email }: { children: ReactNode; memberships: M[]; currentId: string | null; userName: string; email: string }) {
  const { t, locale } = useT();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [picker, setPicker] = useState(false);
  const [pending, start] = useTransition();
  useEffect(() => { setMenu(false); setPicker(false); }, [pathname]);
  const current = memberships.find((m) => m.workspace.id === currentId);
  const base = `/${locale}/workspace`;
  const nav = [
    { href: base, label: "Overview", icon: SquaresFour, exact: true },
    { href: `${base}/inbox`, label: "Inbox", icon: ChatsCircle },
    { href: `${base}/leads`, label: "Leads", icon: UsersThree },
    { href: `${base}/pipeline`, label: "Pipeline", icon: Kanban },
    { href: `${base}/calendar`, label: "Calendar", icon: CalendarDots },
    { href: `${base}/inventory`, label: "Inventory", icon: Buildings },
    { href: `${base}/calculator`, label: "Calculator", icon: CalcIcon },
    { href: `${base}/market`, label: "UAE market", icon: ChartLineUp },
    { href: `${base}/ai`, label: "AI & channels", icon: Sparkle },
    { href: `${base}/team`, label: "Team", icon: UsersFour },
    { href: `${base}/settings`, label: "Settings", icon: GearSix },
  ];
  const active = (h: string, exact?: boolean) => (exact ? pathname === h : pathname.startsWith(h));

  const sidebar = (
    <nav aria-label={t("Workspace navigation")} className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Link href={`/${locale}`} className="flex items-center gap-2.5" aria-label="Observer AI"><Logo className="size-7" /><span className="text-[17px] font-semibold tracking-[-0.02em]">Observer</span></Link>
      </div>
      {current && (
        <div className="relative mx-3 mb-3">
          <button onClick={() => setPicker((v) => !v)} aria-expanded={picker} className="flex w-full items-center gap-3 rounded-[12px] bg-canvas px-3 py-2.5 text-start">
            <span className="flex size-8 items-center justify-center rounded-[9px] bg-tile text-[13px] font-semibold text-white">{current.workspace.name[0]?.toUpperCase()}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-medium leading-tight">{current.workspace.name}</span>
              <span className="t-fine text-ink-2">{t(current.role[0].toUpperCase() + current.role.slice(1))}{current.workspace.city ? ` · ${current.workspace.city}` : ""}</span>
            </span>
            <CaretUpDown size={16} className="text-ink-3" />
          </button>
          {picker && (
            <div className="absolute inset-x-0 top-full z-10 mt-1 rounded-[14px] border border-hairline-soft bg-canvas p-1.5 shadow-xl">
              {memberships.map((m) => (
                <button key={m.workspace.id} disabled={pending} onClick={() => start(() => switchWorkspace(locale, m.workspace.id))}
                  className={cx("flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-start text-[14px] hover:bg-parchment", m.workspace.id === currentId && "font-medium")}>
                  <span className="truncate">{m.workspace.name}</span><span className="t-fine text-ink-3">{t(m.role[0].toUpperCase() + m.role.slice(1))}</span>
                </button>
              ))}
              <Link href={`${base}/onboarding?new=1`} className="mt-1 flex items-center gap-2 rounded-[10px] px-3 py-2 text-[14px] text-creek hover:bg-parchment"><Plus size={14} /> {t("New workspace")}</Link>
            </div>
          )}
        </div>
      )}
      <ul className="flex-1 space-y-0.5 px-3">
        {nav.map((n) => {
          const on = active(n.href, n.exact);
          const Icon = n.icon;
          return (
            <li key={n.href}>
              <Link href={n.href} aria-current={on ? "page" : undefined}
                className={cx("flex h-10 items-center gap-2.5 rounded-[9px] px-3 text-[15px] transition-colors", on ? "bg-canvas font-medium shadow-[0_1px_2px_rgb(0_0_0/0.06)]" : "text-ink-2 hover:bg-canvas/60 hover:text-ink")}>
                <Icon size={18} weight={on ? "fill" : "regular"} className={on ? "text-creek" : ""} />{t(n.label)}
              </Link>
            </li>
          );
        })}
        <li className="pt-4">
          <Link href={`/${locale}/app/dashboard`} className="flex h-10 items-center gap-2.5 rounded-[9px] px-3 text-[14px] text-ink-3 hover:text-ink"><Flask size={18} />{t("Try the demo app")}</Link>
        </li>
      </ul>
      <div className="flex items-center gap-3 border-t border-hairline-soft px-5 py-3.5">
        <Monogram name={userName || email} size={32} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium leading-tight">{userName || email}</p>
          <p className="t-fine truncate text-ink-2" dir="ltr">{email}</p>
        </div>
        <form action={signOut.bind(null, locale)}>
          <button className="flex size-9 items-center justify-center rounded-full text-ink-2 hover:bg-canvas hover:text-ink" aria-label={t("Sign out")} title={t("Sign out")}><SignOut size={18} className="rtl:-scale-x-100" /></button>
        </form>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh bg-parchment text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-canvas focus:px-4 focus:py-2">{t("Skip to content")}</a>
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-[260px] border-e border-hairline-soft bg-parchment lg:block">{sidebar}</aside>
      {menu && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={t("Menu")}>
          <button className="absolute inset-0 bg-black/30" aria-label={t("Close menu")} onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 start-0 w-[280px] bg-parchment shadow-xl">{sidebar}</aside>
        </div>
      )}
      <div className="lg:ps-[260px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-hairline-soft bg-parchment/80 px-4 backdrop-blur-xl sm:px-6">
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-canvas lg:hidden" aria-label={t("Open menu")} aria-expanded={menu} onClick={() => setMenu(true)}>{menu ? <X size={20} /> : <List size={20} />}</button>
          <p className="truncate text-[15px] font-medium lg:hidden">{current?.workspace.name}</p>
          <Link href={switchPath(pathname, otherLocale(locale))} className="ms-auto flex h-10 items-center gap-1.5 rounded-full px-3 text-[14px] hover:bg-canvas"
            onClick={() => { try { document.cookie = `obs-lang=${otherLocale(locale)}; path=/; max-age=31536000; samesite=lax`; } catch {} }}>
            <Translate size={18} /> {locale === "ar" ? "English" : "العربية"}
          </Link>
        </header>
        <main id="main" className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
