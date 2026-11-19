"use client";
/**
 * Guided tour for presenting the demo: ten captioned stops that move between seats and screens.
 * The step lives in sessionStorage so it survives navigation; Exit or the last step ends it.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { X, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useT } from "./i18n";
import { useRole } from "./role";
import type { RoleId } from "@/lib/demo/group";

const KEY = "obs-tour";
type Step = { role: RoleId; view: string; h: string; t: string };
const steps: Step[] = [
  { role: "chairman", view: "board", h: "The group, on one page.", t: "AED 10.4 billion sold this year across Dubai, Abu Dhabi and Riyadh. Every figure moves as your consultants and the AI work." },
  { role: "chairman", view: "launch", h: "Tonight, Riyadh Gate opens.", t: "Scroll the evening forward, then raise demand from the dock. Watch the AI answer, qualify and hold units while the launch runs." },
  { role: "chairman", view: "ai-activity", h: "Nothing important happens without a person.", t: "The AI handles routine work and asks first on unit holds, price concessions and anything above the limits you set." },
  { role: "director", view: "clients", h: "Every client, complete.", t: "One record per family: conversations in their language, viewings, offers, documents and Golden Visa status, in one place." },
  { role: "director", view: "projects", h: "Inventory, floor by floor.", t: "Twelve projects, live. Sold, booked, held and available units, with the price list and payment plan beside them." },
  { role: "director", view: "deals", h: "From EOI to Oqood, with the money.", t: "Every deal by stage, the documents still missing, and the commission owed to each consultant and partner agency." },
  { role: "director", view: "brokers", h: "184 agencies, protected and paid.", t: "Partner brokers register clients, keep them protected for 90 days, and see their commission without calling anyone." },
  { role: "agent", view: "next-best-action", h: "A consultant's morning.", t: "The most valuable call first, the client's home behind it, and the WhatsApp reply already drafted in the client's language." },
  { role: "broker", view: "partner", h: "Partners see only what is theirs.", t: "A partner agency registers a client, checks live availability and follows its commission. Nothing else is visible to them." },
  { role: "chairman", view: "voice", h: "And it answers the phone.", t: "Calls in Arabic, English, Russian and more, transcribed and logged. The ledger shows the hours saved and the sales it touched." },
];

export function startTour() {
  try { sessionStorage.setItem(KEY, "0"); } catch {}
  dispatchEvent(new Event(KEY));
}

export function Tour() {
  const { t, locale } = useT();
  const { role, setRole } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const [i, setI] = useState<number | null>(null);

  useEffect(() => {
    const read = () => {
      let v: string | null = null;
      try { v = sessionStorage.getItem(KEY); } catch {}
      setI(v === null ? null : Math.min(steps.length, Math.max(0, +v)));
    };
    read();
    addEventListener(KEY, read);
    return () => removeEventListener(KEY, read);
  }, []);

  // Keep the screen in step with the tour
  useEffect(() => {
    if (i === null || i >= steps.length) return;
    const s = steps[i];
    if (role !== s.role) setRole(s.role);
    const want = `/${locale}/app/${s.view}`;
    if (pathname !== want) router.push(want);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const go = (n: number) => {
    try { sessionStorage.setItem(KEY, String(n)); } catch {}
    setI(n);
    scrollTo({ top: 0 });
  };
  const exit = () => { try { sessionStorage.removeItem(KEY); } catch {} setI(null); };
  if (i === null) return null;

  const done = i >= steps.length;
  const s = steps[Math.min(i, steps.length - 1)];
  return (
    <div role="dialog" aria-label={t("Guided tour")} className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-[620px] border border-[#cdb284]/30 bg-[#0d0c0a]/95 p-5 text-[#efe9df] shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)] backdrop-blur-xl sm:bottom-5 sm:p-6 lg:ms-[calc(260px+((100vw-260px-620px)/2))] lg:me-auto">
      <div className="flex items-start justify-between gap-4">
        <p className="t-eyebrow !mb-0 text-[#cdb284]">{done ? t("Tour complete") : `${t("Guided tour")} · ${i + 1}/${steps.length}`}</p>
        <button onClick={exit} aria-label={t("Exit the tour")} className="-me-2 -mt-2 grid size-9 place-items-center text-[#efe9df]/70 hover:text-white"><X size={18} /></button>
      </div>
      <h2 className="lux-serif mt-2 text-[26px] leading-[1.1] sm:text-[30px]">{done ? t("That was one evening at Emaar.") : t(s.h)}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-[#efe9df]/75">{done ? t("Now picture it with your own projects, your consultants and this week's enquiries.") : t(s.t)}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {done ? (
          <>
            <Link href={`/${locale}/contact`} onClick={exit} className="btn bg-[#cdb284] text-[#15120e] hover:bg-[#e0c99f]">{t("Book a demo")}</Link>
            <button onClick={exit} className="text-[14px] text-[#efe9df]/75 hover:text-white">{t("Explore on my own")}</button>
          </>
        ) : (
          <>
            <button onClick={() => go(i + 1)} className="btn bg-[#cdb284] text-[#15120e] hover:bg-[#e0c99f]">{t(i === steps.length - 1 ? "Finish" : "Next")}<ArrowRight size={16} className="rtl:-scale-x-100" /></button>
            {i > 0 && <button onClick={() => go(i - 1)} className="inline-flex min-h-11 items-center gap-1.5 text-[14px] text-[#efe9df]/75 hover:text-white"><ArrowLeft size={15} className="rtl:-scale-x-100" />{t("Back")}</button>}
            <span className="ms-auto hidden gap-1 sm:flex" aria-hidden>
              {steps.map((_, k) => <span key={k} className={`h-1 w-4 ${k <= i ? "bg-[#cdb284]" : "bg-white/15"}`} />)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
