import Image from "next/image";
import type { ReactNode } from "react";
import { WhatsappLogo, CalendarCheck, HandArrowUp } from "@phosphor-icons/react/dist/ssr";
import { img } from "@/lib/img";

/**
 * Sign-in layout: Dubai at night on one side with what the assistant did while the agent was away,
 * the form on the other. On phones the photograph becomes a band above the form.
 */
const NIGHT = {
  en: {
    h: "While you were away",
    rows: [
      { at: "23:48", icon: "wa", t: "Replied to Hessa in Arabic and scored her 91. Cash buyer, Dubai Hills." },
      { at: "01:12", icon: "cal", t: "Booked Rahul a Thursday viewing at Hills Grove, in Hindi." },
      { at: "06:30", icon: "hand", t: "Handed Sara to Layla. She wants to make an offer." },
    ],
    credit: "Downtown Dubai at night",
  },
  ar: {
    h: "بينما كنت بعيداً",
    rows: [
      { at: "23:48", icon: "wa", t: "ردّ على حصة بالعربية وقيّمها 91. مشترية نقداً في دبي هيلز." },
      { at: "01:12", icon: "cal", t: "حجز لراهول معاينة يوم الخميس في هيلز غروف، بالهندية." },
      { at: "06:30", icon: "hand", t: "سلّم سارة إلى ليلى. تريد تقديم عرض." },
    ],
    credit: "وسط مدينة دبي ليلاً",
  },
} as const;

const ICON = { wa: WhatsappLogo, cal: CalendarCheck, hand: HandArrowUp };

export function AuthShell({ locale, children }: { locale: string; children: ReactNode }) {
  const c = NIGHT[locale === "ar" ? "ar" : "en"];
  return (
    <section className="grid min-h-[100dvh] bg-canvas pt-14 lg:grid-cols-[1.1fr_1fr]">
      <div className="relative isolate flex min-h-[300px] flex-col justify-end overflow-hidden bg-tile text-white lg:min-h-0">
        <Image src={img("skylineNight", 1800)} alt="" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="-z-10 object-cover object-[60%_50%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <div className="px-6 pb-8 pt-24 sm:px-10 lg:px-14 lg:pb-14">
          <p className="text-[15px] font-medium text-white/70">{c.h}</p>
          <ol className="mt-4 grid max-w-[460px] gap-3">
            {c.rows.map((r, i) => {
              const Icon = ICON[r.icon];
              return (
                <li key={r.at} className={`enter-rise grid grid-cols-[52px_1fr] items-start gap-3 rounded-[16px] bg-white/10 px-4 py-3 backdrop-blur-md ${i > 0 ? "max-lg:hidden" : ""}`} style={{ animationDelay: `${300 + i * 260}ms` }}>
                  <span className="tnum pt-0.5 text-[15px] font-semibold text-white" dir="ltr">{r.at}</span>
                  <span className="flex gap-2.5 text-[15px] leading-snug text-white/90"><Icon size={18} weight="fill" className="mt-0.5 shrink-0 text-[#7fd6c9]" />{r.t}</span>
                </li>
              );
            })}
          </ol>
          <p className="t-fine mt-6 text-white/45">{c.credit}</p>
        </div>
      </div>
      <div className="flex items-start justify-center px-4 py-10 sm:px-10 lg:items-center lg:py-16">{children}</div>
    </section>
  );
}
