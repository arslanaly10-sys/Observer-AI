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
  { role: "chairman", view: "board", h: "The whole business, on one page.", t: "AED 10.4 billion sold this year across Dubai and Riyadh. Every figure moves as your consultants and the AI work. All sample data." },
  { role: "chairman", view: "launch", h: "Tonight, Riyadh Gate opens.", t: "Scroll the evening forward, then raise demand from the dock. Watch the AI answer, qualify and hold units while the launch runs." },
  { role: "director", view: "launch-controls", h: "When demand outruns the team.", t: "Consultants take the top scores, the AI keeps the rest warm, qualified clients overflow to brokers or get a callback time, and deposits set the pick order." },
  { role: "director", view: "overnight", h: "00:30 in Dubai.", t: "A buyer wants a unit before flying home. The AI quotes only what it is 80% sure of, reads the passport, sends the developer's own deposit link and queues the hold for 9:00." },
  { role: "director", view: "deal-room", h: "Client, broker and developer, in one thread.", t: "At 9:00 the deal room opens with everything in it. The two sides' AIs pass hold requests and availability checks, on record." },
  { role: "director", view: "reply-desk", h: "No developer API needed.", t: "The developer's sales admin types “A-1204 sold” on WhatsApp, and every agency sees it within a minute. A developer AI answers brokers overnight." },
  { role: "director", view: "inventory-sources", h: "Inventory however it arrives.", t: "Price lists, forwarded emails, shared sheets, portals and calls. Every project shows how fresh its data is, and the AI asks before quoting anything over a day old." },
  { role: "director", view: "brokers", h: "Many agencies, one rule.", t: "The first agency to register a client keeps them for 30 days, renewed by every call, viewing or offer. Duplicates and disputes are caught and ruled on evidence." },
  { role: "director", view: "holds", h: "One hold per unit.", t: "Timed holds release themselves unless a deposit arrives, and the next agency in the queue gets the unit. No double bookings." },
  { role: "chairman", view: "demand-radar", h: "Why developers keep Observer current.", t: "Anonymised demand by area, size and budget, from consenting clients, plus the public data behind availability." },
  { role: "director", view: "clients", h: "Every client, complete.", t: "One record per family: conversations in their language, viewings, offers, documents and Golden Visa status, in one place." },
  { role: "director", view: "projects", h: "Inventory, floor by floor.", t: "Six Emaar communities, live. Sold, booked, held and available units, with the price list and payment plan beside them." },
  { role: "agent", view: "next-best-action", h: "A consultant's morning.", t: "The most valuable call first, the client's home behind it, and the WhatsApp reply already drafted in the client's language." },
  { role: "broker", view: "partner", h: "Partners see only what is theirs.", t: "A partner agency registers a client, holds units from one price list and follows its commission. Nothing else is visible to them." },
  { role: "chairman", view: "gcc-intel", h: "Six GCC markets, sourced.", t: "2025 figures for every market with their sources, and buying costs by country. Where a rule couldn't be confirmed, Observer says so." },
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
