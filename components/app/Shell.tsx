"use client";
import Link from "next/link";
import Image from "next/image";
import { InlineCta } from "@/components/site/InlineCta";
import { img } from "@/lib/img";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MagnifyingGlass, Moon, Sun, Translate, Plus, List, X, Sparkle, PaperPlaneRight, ArrowUpRight, ArrowRight, CheckCircle, Info, Eye, EyeSlash, PlayCircle, LockSimple } from "@phosphor-icons/react";
import { navFor, canSee, viewLabel, type ViewId } from "./nav";
import { RoleProvider, useRole } from "./role";
import { roles, group } from "@/lib/demo/group";
import { Tour, startTour } from "./Tour";
import { LocaleProvider, useT } from "./i18n";
import { cx, Monogram, Dot, Btn } from "./ui";
import { Logo } from "@/components/Logo";
import { workspace, sla, type Lead } from "@/lib/data";
import { scoreLead, rankActions, fmtAED, budgetMillions } from "@/lib/engine";
import { StoreProvider, useStore } from "./store";
import { Palette } from "./Palette";
import { switchPath, otherLocale, type Locale } from "@/lib/i18n";

export function AppShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <LocaleProvider value={locale}>
      <RoleProvider>
        <StoreProvider>
          <ShellInner>{children}</ShellInner>
        </StoreProvider>
      </RoleProvider>
    </LocaleProvider>
  );
}

function ShellInner({ children }: { children: ReactNode }) {
  const { t, locale } = useT();
  const pathname = usePathname();
  const { role } = useRole();
  const seat = roles[role];
  const [menu, setMenu] = useState(false);
  const [copilot, setCopilot] = useState(false);
  const [addLead, setAddLead] = useState(false);
  const [priv, setPriv] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const current = (pathname.split("/")[3] || seat.home) as ViewId;
  const allowed = canSee(role, current);
  const { setPaletteOpen, toasts } = useStore();
  const ar = locale === "ar";
  const nav = navFor(role);

  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem("obs-theme"); } catch {}
    const initial = stored === "dark" ? "dark" : "light";
    setTheme(initial);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    return () => { delete document.documentElement.dataset.theme; };
  }, [theme]);
  useEffect(() => setMenu(false), [pathname]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("obs-theme", next); } catch {}
  };

  const sidebar = (
    <nav aria-label={t("App navigation")} className="flex h-full flex-col bg-[#0d0c0a] text-[#efe9df]">
      <div className="flex h-16 items-center gap-3 px-5">
        <Link href={`/${locale}/app/${seat.home}`} className="flex items-center gap-3" aria-label={ar ? group.nameAr : group.name}>
          <span className="grid size-9 place-items-center border border-[#cdb284]/60 font-[family-name:var(--font-display)] text-[20px] text-[#e7d6b3]">{group.monogram}</span>
          <span className="leading-tight">
            <span className="lux-wordmark block text-[12px]">{ar ? group.nameAr : "Emaar"}</span>
            <span className="t-eyebrow !mb-0 block !text-[10px] text-[#cdb284]">{t("Sales platform")}</span>
          </span>
        </Link>
      </div>
      <div className="scrollbar-none flex-1 overflow-y-auto px-3 pb-4">
        {nav.map((g) => (
          <div key={g.label} className="mt-5 first:mt-2">
            <p className="t-eyebrow px-3 pb-1.5 !text-[#cdb284]/80">{t(g.label)}</p>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = current === it.id;
                const Icon = it.icon;
                return (
                  <li key={it.id}>
                    <Link
                      href={`/${locale}/app/${it.id}`}
                      aria-current={active ? "page" : undefined}
                      className={cx(
                        "relative flex h-9 items-center gap-2.5 px-3 text-[14px] transition-colors",
                        active ? "bg-white/[0.07] font-medium text-white before:absolute before:inset-y-2 before:start-0 before:w-[2px] before:bg-[#cdb284]" : "text-[#efe9df]/65 hover:bg-white/[0.04] hover:text-white",
                      )}
                    >
                      <Icon size={18} weight={active ? "fill" : "regular"} className={active ? "text-[#cdb284]" : ""} />
                      <span className="flex-1 truncate">{t(it.label)}</span>
                      {it.badge && <span className="tnum bg-white/10 px-1.5 text-[11px] font-medium text-[#efe9df]/80">{it.badge}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 border-t border-white/10 px-5 py-3.5">
        <span className="relative size-9 shrink-0 overflow-hidden bg-white/10">
          <Image src={img(seat.photo, 120, "&h=120&crop=faces")} alt="" fill sizes="36px" className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="pii truncate text-[14px] font-medium leading-tight">{t(seat.person)}</p>
          <p className="t-fine truncate text-[#efe9df]/55">{t(seat.title)}</p>
        </div>
        <Link href={`/${locale}/demo`} className="text-[12px] text-[#cdb284] hover:underline">{t("Switch seat")}</Link>
      </div>
    </nav>
  );

  return (
    <div className={cx("luxapp min-h-dvh bg-parchment text-ink", priv && "vip-private")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-canvas focus:px-4 focus:py-2">{t("Skip to content")}</a>
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-[260px] lg:block">{sidebar}</aside>
      {menu && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={t("Menu")}>
          <button className="absolute inset-0 bg-black/40" aria-label={t("Close menu")} onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 start-0 w-[280px] shadow-xl">{sidebar}</aside>
        </div>
      )}
      <div className="lg:ps-[260px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-hairline-soft bg-parchment/85 px-4 backdrop-blur-xl sm:px-6">
          <button className="flex size-10 items-center justify-center hover:bg-canvas lg:hidden" aria-label={t("Open menu")} aria-expanded={menu} onClick={() => setMenu(true)}>
            <List size={20} />
          </button>
          <p className="truncate text-[15px] font-medium lg:hidden">{t(viewLabel[current] ?? "Dashboard")}</p>
          <button
            onClick={() => setPaletteOpen(true)}
            className="relative ms-auto hidden h-10 max-w-[340px] flex-1 items-center gap-2.5 border border-hairline-soft bg-canvas ps-3.5 pe-2 text-start text-[14px] text-ink-3 hover:border-hairline md:flex lg:ms-0"
          >
            <MagnifyingGlass size={16} />
            <span className="flex-1 truncate">{t("Search clients, units and consultants")}</span>
            <kbd className="border border-hairline px-1.5 py-0.5 text-[11px]">⌘K</kbd>
          </button>
          <button onClick={() => setPaletteOpen(true)} className="ms-auto flex size-10 items-center justify-center hover:bg-canvas md:hidden" aria-label={t("Search")}><MagnifyingGlass size={18} /></button>
          <div className="flex items-center gap-1 md:ms-auto">
            <Link href={`/${locale}/demo`} className="me-1 hidden items-center gap-2 border border-hairline px-3 py-1.5 text-[12.5px] text-ink-2 hover:border-ink xl:flex">
              <span className="t-eyebrow !mb-0 !text-[10.5px]">{t("Viewing as")}</span><span className="font-medium text-ink">{t(seat.label)}</span>
            </Link>
            {(role === "chairman" || role === "director") && (
              <button onClick={() => setPriv((v) => !v)} aria-pressed={priv} className={cx("flex h-10 items-center gap-1.5 px-3 text-[13px] hover:bg-canvas", priv && "text-creek")} title={t("Blur client names for presenting")}>
                {priv ? <EyeSlash size={18} /> : <Eye size={18} />}<span className="hidden 2xl:inline">{t("Private mode")}</span>
              </button>
            )}
            <button onClick={() => startTour()} className="hidden h-10 items-center gap-1.5 px-3 text-[13px] hover:bg-canvas sm:flex"><PlayCircle size={18} /><span className="hidden lg:inline">{t("Tour")}</span></button>
            <Link href={switchPath(pathname, otherLocale(locale))} onClick={() => { try { document.cookie = `obs-lang=${otherLocale(locale)}; path=/; max-age=31536000; samesite=lax`; } catch {} }} className="flex h-10 items-center gap-1.5 px-3 text-[14px] hover:bg-canvas" aria-label={t("Switch language")}>
              <Translate size={18} /> <span className="hidden sm:inline">{locale === "ar" ? "English" : "العربية"}</span>
            </Link>
            <button onClick={toggleTheme} className="flex size-10 items-center justify-center hover:bg-canvas" aria-label={theme === "dark" ? t("Use light appearance") : t("Use dark appearance")}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {role !== "chairman" && <span className="ms-1 hidden sm:block"><Btn onClick={() => setAddLead(true)}><Plus size={16} weight="bold" /> {t(role === "broker" ? "Register a client" : "Add enquiry")}</Btn></span>}
          </div>
        </header>
        {/* Demo bar: says plainly the data is sample data, with one small ask (CTA Gallery: announcement pattern) */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-b border-hairline-soft bg-[#efe5d3]/60 px-4 py-2 text-[13px] text-ink-2 sm:px-6">
          <span>{t("Sample data: an Emaar Properties workspace, shown with permission. Figures, consultants, clients and brokers are invented.")}</span>
          <span className="flex items-center gap-3">
            <Link href={`/${locale}/contact`} className="inline-flex h-7 items-center gap-1.5 bg-ink px-3 text-[12px] font-medium text-canvas hover:opacity-90">{t("See it with your own leads")}<ArrowRight size={13} className="rtl:-scale-x-100" /></Link>
            <Link href={`/${locale}/demo`} className="font-medium text-creek hover:underline">{t("Switch seat")}</Link>
          </span>
        </div>
        <main id="main" className="mx-auto max-w-[1360px] px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
          {allowed ? children : <NotForSeat label={seat.label} home={seat.home} />}
          {/* Closing ask at the end of every demo screen: one photo, a big line, the WhatsApp field, a true reassurance */}
          <section aria-labelledby="demo-close" className="relative isolate mt-10 overflow-hidden bg-black text-white">
            <Image src={img("villaDusk", 1600)} alt="" fill sizes="(min-width:1024px) 1100px, 100vw" className="-z-10 object-cover object-[50%_65%] opacity-60" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/70 to-black/20" />
            <div className="grid gap-8 p-6 pt-16 sm:p-10 sm:pt-24 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h2 id="demo-close" className="lux-serif max-w-[16ch] text-[38px] leading-[1] sm:text-[56px]">{t("Now see it with your own enquiries.")}</h2>
                <p className="mt-4 max-w-[50ch] text-[16px] text-white/75 sm:text-[17px]">{t("Bring a week of your leads. We’ll load them into Observer and show you who you would have called first, and what it was worth.")}</p>
              </div>
              <div className="w-full lg:w-[440px]">
                <InlineCta locale={locale} label={t("Your WhatsApp number")} placeholder={t("WhatsApp number")} button={t("Book a demo")} reassure={t("30 minutes, with your own enquiries. No card needed.")} stack="mobile" />
                <p className="mt-3 text-[14px] text-white/70">{t("Already a customer?")} <Link href={`/${locale}/login`} className="font-medium text-white underline-offset-4 hover:underline">{t("Sign in")}</Link></p>
              </div>
            </div>
          </section>
        </main>
      </div>
      <Tour />

      <button
        onClick={() => setCopilot((v) => !v)}
        data-copilot
        className="group fixed bottom-5 end-5 z-30 flex size-12 items-center justify-center gap-2 rounded-full bg-tile text-[15px] font-medium text-white shadow-[0_12px_32px_-8px_rgb(0_0_0/0.4)] transition-[width] active:scale-[.97] hover:w-auto hover:ps-4 hover:pe-5 focus-visible:w-auto focus-visible:ps-4 focus-visible:pe-5"
        aria-expanded={copilot}
        aria-label={t("Ask Observer")}
      >
        <Sparkle size={20} weight="fill" className="shrink-0 text-[#6bd3df]" /><span className="hidden group-hover:inline group-focus-visible:inline">{t("Ask Observer")}</span>
      </button>
      {copilot && <Copilot onClose={() => setCopilot(false)} />}
      <Palette onAddLead={() => setAddLead(true)} />
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4">
        {toasts.map((x) => (
          <p key={x.id} className="enter-rise flex items-center gap-2 rounded-full bg-tile px-4 py-2.5 text-[14px] text-white shadow-[0_12px_32px_-8px_rgb(0_0_0/0.45)]">
            {x.tone === "ok" ? <CheckCircle size={16} weight="fill" className="text-[#4cc27c]" /> : <Info size={16} weight="fill" className="text-[#6bd3df]" />}
            {x.text}
          </p>
        ))}
      </div>
      {addLead && <AddLead onClose={() => setAddLead(false)} />}
    </div>
  );
}

function useEscape(onClose: () => void) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [onClose]);
}

/** Copilot answers from live workspace data (the same engine the screens use), not canned text. */
function answer(q: string, all: Lead[], t: (s: string) => string, ar: boolean): string {
  const lower = q.toLowerCase();
  const named = all.find((l) => lower.includes(l.name.toLowerCase().split(" ")[0]) || q.includes(t(l.name)));
  if (named) {
    const s = scoreLead(named);
    const why = s.parts.slice(0, 2).map((p) => t(p.label)).join(ar ? " و" : " and ");
    return ar
      ? `${named.name}: تقييم ${named.score} (${t(named.temp[0].toUpperCase() + named.temp.slice(1))}). أقوى الإشارات: ${why}. الميزانية ${named.budget} في ${t(named.area)}، والوكيل ${t(named.agent)}.`
      : `${named.name} scores ${named.score} (${named.temp}). The strongest signals are ${why.toLowerCase()}. Budget ${named.budget} in ${named.area}, handled by ${named.agent}.`;
  }
  if (/sla|late|breach|wait|تجاوز|ينتظر|متأخر/i.test(q)) {
    const b = sla.filter((x) => x.status === "breach").map((x) => x.name);
    const w = sla.filter((x) => x.status === "warn").length;
    return ar
      ? `${b.length} في حالة تجاوز الآن: ${b.join(" و")}. و${w} آخرون في خطر. أقترح تحويل العملاء الباردين إلى تسلسل المكالمات الذكية وإسناد الدافئين فوراً.`
      : `${b.length} leads are in breach right now: ${b.join(" and ")}. ${w} more are at risk. I'd move the cold ones to the AI call sequence and assign the warm ones now.`;
  }
  if (/pipeline|revenue|forecast|money|commission|خط|إيراد|عمولة|توقع/i.test(q)) {
    const total = all.reduce((a, l) => a + budgetMillions(l.budget), 0) * 1e6;
    const hot = all.filter((l) => l.temp === "hot");
    const hotVal = hot.reduce((a, l) => a + budgetMillions(l.budget), 0) * 1e6;
    return ar
      ? `لديك ${all.length} عميلاً بقيمة ${fmtAED(total)} إجمالاً. ${hot.length} منهم ساخنون بقيمة ${fmtAED(hotVal)}، أي عمولة محتملة نحو ${fmtAED(hotVal * 0.02)} عند 2%.`
      : `You have ${all.length} leads worth ${fmtAED(total)} in total. ${hot.length} are hot, worth ${fmtAED(hotVal)}, or about ${fmtAED(hotVal * 0.02)} in commission at 2%.`;
  }
  if (/cold|nurture|بارد|خامل/i.test(q)) {
    const c = all.filter((l) => l.temp === "cold").map((l) => l.name);
    return ar ? `العملاء الباردون: ${c.join("، ")}. أبقيهم على نشرة السوق الأسبوعية، وأتصل بهم بعد 7 أيام بلا رد.` : `Cold leads: ${c.join(", ")}. I'm keeping them on the weekly market letter and will call after seven quiet days.`;
  }
  const top = rankActions(all).slice(0, 2);
  return ar
    ? `ابدأ بـ${top[0].lead}: ${t(top[0].action)} (${t(top[0].why)}). ثم ${top[1].lead}: ${t(top[1].action)}.`
    : `Start with ${top[0].lead}: ${top[0].action.toLowerCase()} (${top[0].why.toLowerCase()}). Then ${top[1].lead}: ${top[1].action.toLowerCase()}.`;
}

function Copilot({ onClose }: { onClose: () => void }) {
  const { t, locale } = useT();
  const { leads: all } = useStore();
  const [q, setQ] = useState("");
  const [log, setLog] = useState<{ me: boolean; text: string }[]>([
    { me: false, text: t("Ahmed Al Khalidi has been looking at Dubai Hills listings for 40 minutes and nobody has contacted him yet. Want me to send him a WhatsApp?") },
  ]);
  const ref = useRef<HTMLInputElement>(null);
  useEscape(onClose);
  useEffect(() => ref.current?.focus(), []);
  const ask = (text: string) => {
    if (!text.trim()) return;
    setLog((l) => [...l, { me: true, text }, { me: false, text: answer(text, all, t, locale === "ar") }]);
    setQ("");
  };
  return (
    <div role="dialog" aria-label={t("Ask Observer")} className="fixed bottom-20 end-5 z-40 flex h-[min(560px,75dvh)] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[22px] border border-hairline-soft bg-canvas shadow-[0_30px_80px_-20px_rgb(0_0_0/0.35)]">
      <div className="flex items-center gap-3 border-b border-hairline-soft px-4 py-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-tile"><Sparkle size={18} weight="fill" className="text-[#6bd3df]" /></span>
        <div className="flex-1">
          <p className="text-[15px] font-semibold">{t("Observer")}</p>
          <p className="t-fine flex items-center gap-1.5 text-ink-2"><Dot live /> {t("Watching 41,280 enquiries")}</p>
        </div>
        <button onClick={onClose} className="flex size-9 items-center justify-center rounded-full hover:bg-parchment" aria-label={t("Close")}><X size={18} /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {log.map((m, i) => (
          <p key={i} className={cx("max-w-[86%] rounded-[16px] px-3.5 py-2.5 text-[15px] leading-snug", m.me ? "ms-auto bg-creek text-on-creek" : "bg-parchment")}>{m.text}</p>
        ))}
        {log.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {["Who should I call first?", "Any SLA breaches?", "How’s the pipeline?", "Tell me about Nour"].map((s) => (
              <button key={s} onClick={() => ask(t(s))} className="rounded-full border border-hairline px-3 py-1.5 text-[13px] text-ink-2 hover:border-creek hover:text-creek">{t(s)}</button>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="flex items-center gap-2 border-t border-hairline-soft p-3">
        <label className="sr-only" htmlFor="cop">{t("Ask about leads, scores or next steps")}</label>
        <input id="cop" ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Ask about leads, scores or next steps")} className="h-10 flex-1 rounded-full bg-parchment px-4 text-[14px] outline-none" dir={locale === "ar" ? "rtl" : "ltr"} />
        <button className="flex size-10 items-center justify-center rounded-full bg-creek text-on-creek" aria-label={t("Send")}><PaperPlaneRight size={18} className="rtl:-scale-x-100" /></button>
      </form>
    </div>
  );
}

function AddLead({ onClose }: { onClose: () => void }) {
  const { t, locale } = useT();
  useEscape(onClose);
  const [f, setF] = useState({ name: "", phone: "", source: "Bayut", budget: "", area: "Dubai Hills", financing: "Cash", timeframe: "1-2 mo" });
  const [result, setResult] = useState<ReturnType<typeof scoreLead> | null>(null);
  const { addLead, toast, setOpenLead } = useStore();
  const router = useRouter();
  const [newId, setNewId] = useState<number | null>(null);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = () => {
    const budget = f.budget ? `AED ${f.budget}` : "AED 1.5M";
    const r = scoreLead({ financing: f.financing, budget, timeframe: f.timeframe, source: f.source, urgency: "serious", temp: "warm", area: f.area });
    setResult(r);
    const lead = addLead({ name: f.name.trim(), phone: f.phone || "+971", score: r.score, temp: r.temp, type: "Buyer", source: f.source, budget, timeframe: f.timeframe, financing: f.financing, agent: "Unassigned", status: "New", urgency: "serious", area: f.area, lastContact: "now" });
    setNewId(lead.id);
    toast(`${lead.name} ${t("added and scored")} ${r.score}`);
  };
  const field = "h-11 w-full rounded-[10px] border border-hairline bg-canvas px-3 text-[15px] outline-none focus:border-creek";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="add-lead-title">
      <button className="absolute inset-0 bg-black/35" aria-label={t("Close")} onClick={onClose} />
      <div className="relative w-full max-w-[480px] rounded-t-[22px] bg-canvas p-6 shadow-2xl sm:rounded-[22px]">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="add-lead-title" className="text-[21px] font-semibold tracking-[-0.016em]">{t("Add a lead")}</h2>
          <button onClick={onClose} className="flex size-9 items-center justify-center rounded-full hover:bg-parchment" aria-label={t("Close")}><X size={18} /></button>
        </div>
        {result ? (
          <div className="text-center">
            <p className="t-caption text-ink-2">{t("Observer scored this lead")}</p>
            <p className="tnum mt-1 text-[64px] font-semibold leading-none tracking-[-0.03em]">{result.score}</p>
            <p className="mt-2 text-ink-2">{t(result.temp === "hot" ? "Hot. Reply within five minutes." : result.temp === "warm" ? "Warm. Worth a shortlist today." : "Cold. Observer will nurture this one.")}</p>
            <ul className="mt-5 space-y-2 text-start">
              {result.parts.slice(0, 4).map((p) => (
                <li key={p.label} className="flex items-center gap-3 text-[14px]">
                  <span className="w-32 text-ink-2">{t(p.label)}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-hairline-soft"><span className="bar-in block h-full bg-creek" style={{ width: `${(p.pts / p.max) * 100}%` }} /></span>
                  <span className="tnum w-12 text-end">+{p.pts}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <Btn variant="secondary" onClick={onClose}>{t("Done")}</Btn>
              <Btn onClick={() => { setOpenLead(newId); onClose(); router.push(`/${locale}/app/leads`); }}>{t("Open lead")}</Btn>
            </div>
          </div>
        ) : (
          <form className="grid grid-cols-2 gap-3" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <label className="col-span-2 grid gap-1.5 text-[13px] text-ink-2">{t("Full name")}<input required value={f.name} onChange={set("name")} className={field} autoComplete="off" /></label>
            <label className="col-span-2 grid gap-1.5 text-[13px] text-ink-2">{t("WhatsApp number")}<input value={f.phone} onChange={set("phone")} className={field} inputMode="tel" placeholder="+971" /></label>
            <label className="grid gap-1.5 text-[13px] text-ink-2">{t("Source")}<select value={f.source} onChange={set("source")} className={field}>{["Bayut", "Property Finder", "WhatsApp", "Referral", "Facebook", "Instagram", "Website"].map((s) => <option key={s}>{s}</option>)}</select></label>
            <label className="grid gap-1.5 text-[13px] text-ink-2">{t("Budget (AED)")}<input value={f.budget} onChange={set("budget")} className={field} placeholder="3.5M" /></label>
            <label className="grid gap-1.5 text-[13px] text-ink-2">{t("Area")}<select value={f.area} onChange={set("area")} className={field}>{["Dubai Hills", "Downtown", "Palm Jumeirah", "Emirates Hills", "MBR City", "Business Bay", "JVC", "Sharjah"].map((s) => <option key={s}>{s}</option>)}</select></label>
            <label className="grid gap-1.5 text-[13px] text-ink-2">{t("Financing")}<select value={f.financing} onChange={set("financing")} className={field}>{["Cash", "Mortgage"].map((s) => <option key={s} value={s}>{t(s)}</option>)}</select></label>
            <label className="col-span-2 grid gap-1.5 text-[13px] text-ink-2">{t("Moving within")}<select value={f.timeframe} onChange={set("timeframe")} className={field}>{["<1 mo", "1-2 mo", "3 mo", "6 mo", "12 mo"].map((s) => <option key={s}>{s}</option>)}</select></label>
            <div className="col-span-2 mt-2 flex justify-end gap-2">
              <Btn variant="secondary" onClick={onClose}>{t("Cancel")}</Btn>
              <Btn type="submit">{t("Add and score")}</Btn>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function OpenLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex items-center gap-1 text-[14px] text-creek hover:underline">{children}<ArrowUpRight size={14} className="rtl:-scale-x-100" /></Link>;
}

export function useLocaleHref() {
  const { locale } = useT();
  return (view: ViewId) => `/${locale}/app/${view}`;
}

export function useRouterPush() {
  return useRouter().push;
}

/** Shown when a seat opens a screen it has no permission for: the demo's role-based access, made visible. */
function NotForSeat({ label, home }: { label: string; home: string }) {
  const { t, locale } = useT();
  return (
    <div className="mx-auto max-w-[560px] py-20 text-center">
      <LockSimple size={36} className="mx-auto text-creek" />
      <h1 className="mt-5 text-[32px] leading-tight">{t("Not part of your seat")}</h1>
      <p className="mt-3 text-ink-2">{t("This screen is outside the permissions of the")} <b className="text-ink">{t(label)}</b> {t("seat. Access follows each person's role, and every attempt is logged.")}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href={`/${locale}/app/${home}`} className="btn btn-primary">{t("Back to my home")}</Link>
        <Link href={`/${locale}/demo`} className="btn btn-ghost"><span>{t("Switch seat")}</span></Link>
      </div>
    </div>
  );
}
