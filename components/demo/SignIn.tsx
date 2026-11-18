"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, WindowsLogo, GoogleLogo, Translate, ShieldCheck, PlayCircle } from "@phosphor-icons/react";
import { img } from "@/lib/img";
import { roles, kpi, group, type RoleId } from "@/lib/demo/group";
import { writeRole } from "@/components/app/role";
import type { Locale } from "@/lib/i18n";

const copy = {
  en: {
    platform: "Sales platform",
    tonight: "Tonight 21:00 · Nawafir Riyadh Gate opens for sale",
    line: `${kpi.enquiries.toLocaleString("en")} enquiries this month. Every one answered.`,
    welcome: "Welcome back.",
    sub: "Sign in with your company account.",
    ms: "Continue with Microsoft",
    google: "Continue with Google",
    ssoNote: "This is a demonstration. Choose a seat below to enter.",
    or: "Or enter the demonstration as",
    tour: "New to Observer? Take the five-minute tour",
    secure: "Single sign-on, role-based access, every client record view logged.",
    note: "Sample data. Nawafir Holdings, its people and its clients are invented. Projects by Emaar, Sobha, Danube, DAMAC, Nakheel, Aldar and ROSHN are named as market data with indicative prices; no affiliation is implied.",
    back: "Back to the website",
    lang: "العربية",
    labels: { chairman: "Chairman", director: "Sales director", agent: "Consultant", broker: "Broker partner" } as Record<RoleId, string>,
    blurbs: {
      chairman: "The group on one page: sales, launches, inventory and what the AI did overnight.",
      director: "652 consultants, their pipeline, and every AI action awaiting your approval.",
      agent: "Today's viewings, the clients to call first, and WhatsApp replies drafted for you.",
      broker: "Register clients, see live availability and follow your commission.",
    } as Record<RoleId, string>,
  },
  ar: {
    platform: "منصة المبيعات",
    tonight: "الليلة 21:00 · افتتاح البيع في بوابة الرياض من نوافير",
    line: `${kpi.enquiries.toLocaleString("ar-AE")} استفساراً هذا الشهر، ولم يبقَ واحد منها بلا رد.`,
    welcome: "أهلاً بعودتك.",
    sub: "سجّل الدخول بحساب شركتك.",
    ms: "المتابعة عبر Microsoft",
    google: "المتابعة عبر Google",
    ssoNote: "هذه نسخة للعرض. اختر مقعدك أدناه للدخول.",
    or: "أو ادخل النسخة التجريبية بصفة",
    tour: "جديد على أوبزرفر؟ جولة في خمس دقائق",
    secure: "دخول موحّد، وصلاحيات حسب الدور، وكل اطلاع على ملف عميل مسجّل.",
    note: "بيانات نموذجية. نوافير القابضة وفريقها وعملاؤها شخصيات مُتخيَّلة. مشاريع إعمار وشوبا ودانوب وداماك ونخيل والدار وروشن مذكورة كبيانات سوق بأسعار تقديرية، ولا يُقصد بها أي ارتباط.",
    back: "العودة إلى الموقع",
    lang: "English",
    labels: { chairman: "رئيس مجلس الإدارة", director: "مديرة المبيعات", agent: "مستشارة عقارية", broker: "شريك وسيط" } as Record<RoleId, string>,
    blurbs: {
      chairman: "المجموعة في صفحة واحدة: المبيعات والإطلاقات والمخزون، وما أنجزه الذكاء الاصطناعي ليلاً.",
      director: "652 مستشاراً ومسار صفقاتهم، وكل إجراء ذكي ينتظر موافقتك.",
      agent: "معاينات اليوم، ومن تتصلين به أولاً، وردود واتساب جاهزة.",
      broker: "سجّل عملاءك، وتابع التوفر لحظة بلحظة، واطّلع على عمولتك.",
    } as Record<RoleId, string>,
  },
};
const order: RoleId[] = ["chairman", "director", "agent", "broker"];
const names: Record<RoleId, { en: string; ar: string; titleAr: string }> = {
  chairman: { en: roles.chairman.person, ar: "راشد المنصوري", titleAr: "رئيس مجلس إدارة المجموعة" },
  director: { en: roles.director.person, ar: "ليلى حداد", titleAr: "مديرة المبيعات، الإمارات" },
  agent: { en: roles.agent.person, ar: "مريم الهاشمي", titleAr: "مستشارة عقارية، دبي" },
  broker: { en: roles.broker.person, ar: "بريا نير", titleAr: "مديرة، كريسنت غيت العقارية · ORN 41827" },
};

export function DemoSignIn({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const ar = locale === "ar";
  const router = useRouter();
  const [note, setNote] = useState(false);
  const [going, setGoing] = useState<RoleId | null>(null);
  const enter = (r: RoleId, tour = false) => {
    setGoing(r);
    writeRole(r);
    try { if (tour) sessionStorage.setItem("obs-tour", "0"); else sessionStorage.removeItem("obs-tour"); } catch {}
    router.push(`/${locale}/app/${roles[r].home}`);
  };

  return (
    <div className="lux min-h-dvh lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* The night, and the group */}
      <section className="relative isolate flex min-h-[46vh] flex-col justify-between overflow-hidden bg-black p-6 text-white sm:p-10 lg:min-h-dvh">
        <Image src={img("skylineNight", 2000)} alt="" fill priority sizes="(min-width:1024px) 52vw, 100vw" className="enter-settle -z-10 object-cover opacity-70 rtl:-scale-x-100" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/40 to-black/30" />
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center border border-[#cdb284]/60 font-[family-name:var(--font-display)] text-[22px] text-[#e7d6b3]">{group.monogram}</span>
          <div>
            <p className="lux-wordmark text-[13px]">{ar ? group.nameAr : group.name}</p>
            <p className="t-eyebrow !mb-0 text-[#cdb284]">{c.platform}</p>
          </div>
        </div>
        <div className="max-w-[30ch]">
          <p className="t-eyebrow text-[#cdb284]">{c.tonight}</p>
          <p className="mt-4 font-[family-name:var(--font-display)] text-[34px] leading-[1.05] sm:text-[48px]">{c.line}</p>
        </div>
      </section>

      {/* Sign in */}
      <section className="flex flex-col bg-canvas px-5 py-8 text-ink sm:px-12 lg:py-12">
        <div className="flex items-center justify-between text-[14px]">
          <Link href={`/${locale}`} className="text-ink-2 hover:text-ink">{c.back}</Link>
          <Link href={`/${ar ? "en" : "ar"}/demo`} className="flex items-center gap-1.5 text-ink-2 hover:text-ink"><Translate size={16} />{c.lang}</Link>
        </div>
        <div className="mx-auto w-full max-w-[520px] flex-1 pt-10 lg:pt-16">
          <h1 className="t-display">{c.welcome}</h1>
          <p className="mt-2 text-ink-2">{c.sub}</p>

          <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {[{ l: c.ms, I: WindowsLogo }, { l: c.google, I: GoogleLogo }].map(({ l, I }) => (
              <button key={l} type="button" onClick={() => setNote(true)} className="flex h-12 items-center justify-center gap-2 border border-hairline bg-pearl text-[14px] font-medium hover:border-ink">
                <I size={18} weight="fill" />{l}
              </button>
            ))}
          </div>
          <p role="status" className={`mt-2 text-[13px] text-creek transition-opacity ${note ? "opacity-100" : "opacity-0"}`}>{c.ssoNote}</p>

          <p className="t-eyebrow mt-6">{c.or}</p>
          <ul className="mt-3 grid gap-2.5">
            {order.map((r) => (
              <li key={r}>
                <button type="button" onClick={() => enter(r)} disabled={!!going} className="group flex w-full items-center gap-4 border border-hairline bg-pearl p-3 text-start transition-colors hover:border-ink disabled:opacity-60">
                  <span className="relative size-14 shrink-0 overflow-hidden bg-parchment">
                    <Image src={img(roles[r].photo, 200, "&h=200&crop=faces")} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="t-eyebrow !mb-0">{c.labels[r]}</span>
                      <span className="text-[15px] font-semibold">{ar ? names[r].ar : names[r].en}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-ink-3">{ar ? names[r].titleAr : roles[r].title}</span>
                    <span className="mt-1 block text-[13.5px] leading-snug text-ink-2">{c.blurbs[r]}</span>
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-1 group-hover:text-ink rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                </button>
              </li>
            ))}
          </ul>

          <button type="button" onClick={() => enter("chairman", true)} className="mt-5 inline-flex min-h-11 items-center gap-2 text-[15px] font-medium text-creek hover:underline">
            <PlayCircle size={20} weight="fill" />{c.tour}
          </button>
        </div>
        <div className="mx-auto mt-10 w-full max-w-[520px] space-y-2 border-t border-hairline pt-5 text-[12.5px] leading-relaxed text-ink-3">
          <p className="flex items-start gap-2"><ShieldCheck size={16} className="mt-0.5 shrink-0" />{c.secure}</p>
          <p>{c.note}</p>
        </div>
      </section>
    </div>
  );
}
