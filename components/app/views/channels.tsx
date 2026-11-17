"use client";
import { useState } from "react";
import Image from "next/image";
import { Phone, CalendarCheck, HouseLine, PaperPlaneRight, Sparkle, WhatsappLogo, ChatText, EnvelopeSimple, Robot, Handshake, FacebookLogo, InstagramLogo, Plus } from "@phosphor-icons/react";
import { waContacts, waThread, sequences, cascade, journeys, socialFlows, socialFeed, PROPERTY } from "@/lib/data";
import { img } from "@/lib/img";
import { useT } from "../i18n";
import { Card, CardHead, PageHead, Stat, Stats, Monogram, Btn, Segmented, Pill, Dot, Meter, TempBadge, cx } from "../ui";

export function WhatsApp() {
  const { t } = useT();
  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const suggestion = t("Hi Ahmed, I’ve put three Dubai Hills villas side by side, all within AED 4M. Shall I send them now, ahead of Thursday?");
  const c = waContacts[active];
  const p = PROPERTY["Dubai Hills"];
  return (
    <>
      <PageHead title="WhatsApp" sub="Every conversation, with Observer’s suggested reply ready to send." />
      <div className="grid gap-5 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_300px]">
        <Card pad={false} className="p-2">
          <p className="t-caption px-3 pb-1 pt-2 text-ink-2">{t("14 unread")}</p>
          <ul>
            {waContacts.map((x, i) => (
              <li key={x.name}>
                <button onClick={() => setActive(i)} aria-pressed={active === i} className={cx("flex w-full items-center gap-3 rounded-[12px] p-3 text-start", active === i ? "bg-parchment" : "hover:bg-pearl")}>
                  <Monogram name={x.name} size={38} />
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between gap-2"><span className="truncate font-medium">{x.name}</span><span className="t-fine text-ink-3">{x.time}</span></span>
                    <span className="t-caption block truncate text-ink-2">{t(x.preview)}</span>
                  </span>
                  {x.unread > 0 && <span className="tnum flex size-5 items-center justify-center rounded-full bg-wa text-[11px] font-semibold text-white">{x.unread}</span>}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card pad={false} className="flex min-h-[620px] flex-col overflow-hidden">
          <header className="flex items-center gap-3 border-b border-hairline-soft px-5 py-3">
            <Monogram name={c.name} size={38} />
            <div className="flex-1">
              <p className="font-medium">{c.name}</p>
              <p className="t-caption flex items-center gap-1.5 text-ink-2"><Dot tone="wa" /> {t("Online")} · {t("Score")} {c.score}</p>
            </div>
            <Btn variant="secondary"><Phone size={16} /> <span className="hidden sm:inline">{t("Call")}</span></Btn>
          </header>
          <div className="flex-1 space-y-2.5 overflow-y-auto bg-pearl px-4 py-5 sm:px-6">
            {waThread.map((m, i) =>
              m.listing ? (
                <div key={i} className="ms-auto w-[260px] overflow-hidden rounded-[16px] bg-canvas shadow-sm">
                  <div className="relative aspect-[4/3]"><Image src={img(p.photo, 600)} alt={`${p.type}, ${p.label}`} fill sizes="260px" className="object-cover" /></div>
                  <div className="p-3">
                    <p className="text-[15px] font-medium">{t(p.type)} · {p.label}</p>
                    <p className="t-caption text-ink-2">{t("5 bedrooms · private pool")}</p>
                    <p className="tnum mt-1 font-semibold">AED 4,200,000</p>
                  </div>
                </div>
              ) : (
                <div key={i} className={cx("max-w-[80%] rounded-[16px] px-3.5 py-2 text-[15px] leading-snug", m.dir === "in" ? "bg-canvas" : "ms-auto bg-[#d9f7e4] text-[#0b3b22] dark:bg-[#123b25] dark:text-[#d9f7e4]")}>
                  {t(m.text!)}
                  <span className="t-fine ms-2 align-bottom opacity-50">{m.time}</span>
                </div>
              ),
            )}
            {sent.map((s, i) => (
              <div key={`s${i}`} className="enter-rise ms-auto max-w-[80%] rounded-[16px] bg-[#d9f7e4] px-3.5 py-2 text-[15px] text-[#0b3b22] dark:bg-[#123b25] dark:text-[#d9f7e4]">{s}</div>
            ))}
          </div>
          {sent.length === 0 && (
            <div className="mx-4 mb-0 mt-3 flex items-start gap-3 rounded-[14px] border border-creek/30 bg-creek-soft p-3 sm:mx-6">
              <Sparkle size={18} weight="fill" className="mt-0.5 shrink-0 text-creek" />
              <p className="flex-1 text-[14px]">{suggestion}</p>
              <Btn variant="quiet" onClick={() => setDraft(suggestion)}>{t("Use")}</Btn>
            </div>
          )}
          <form className="flex items-center gap-2 p-3 sm:px-6" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { setSent((s) => [...s, draft]); setDraft(""); } }}>
            <label htmlFor="wa-draft" className="sr-only">{t("Message")}</label>
            <input id="wa-draft" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t("Write a message")} className="h-11 flex-1 rounded-full border border-hairline-soft bg-canvas px-4 text-[15px] outline-none focus:border-creek" />
            <button className="flex size-11 items-center justify-center rounded-full bg-wa text-white" aria-label={t("Send")}><PaperPlaneRight size={18} className="rtl:-scale-x-100" /></button>
          </form>
        </Card>

        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHead title="About this lead" />
          <div className="flex items-end gap-3">
            <span className="tnum text-[44px] font-semibold leading-none tracking-[-0.03em]">87</span>
            <div className="pb-1"><TempBadge temp="hot" /></div>
          </div>
          <dl className="mt-5 space-y-3 text-[14px]">
            {[["Looking to", t("Buy, to live in")], ["Budget", "AED 3.5M – 4.5M"], ["Areas", "Dubai Hills, MBR City"], ["Moving within", t("1–2 months")], ["Came from", "Bayut, Property Finder"], ["Financing", t("Cash")]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3"><dt className="text-ink-2">{t(k)}</dt><dd className="text-end font-medium">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-6 grid gap-2">
            <Btn><CalendarCheck size={16} /> {t("Book a viewing")}</Btn>
            <Btn variant="secondary"><HouseLine size={16} /> {t("Send a shortlist")}</Btn>
          </div>
        </Card>
      </div>
    </>
  );
}

const chIcon = { whatsapp: WhatsappLogo, sms: ChatText, email: EnvelopeSimple, ai_call: Robot } as const;
const cascadeIcon: Record<string, typeof WhatsappLogo> = { WhatsApp: WhatsappLogo, SMS: ChatText, "AI call": Robot, Email: EnvelopeSimple, "Your agent": Handshake };

export function Sequences() {
  const { t } = useT();
  const [f, setF] = useState<"all" | keyof typeof chIcon>("all");
  const [open, setOpen] = useState(0);
  const list = sequences.filter((s) => f === "all" || s.channel === f);
  return (
    <>
      <PageHead title="Sequences" sub="Follow-ups that write themselves. WhatsApp first, then SMS, then a call, until someone answers." actions={<Btn><Plus size={16} /> {t("New sequence")}</Btn>} />
      <Stats>
        <Stat label="Active sequences" value="7" />
        <Stat label="Messages sent today" value="1,847" />
        <Stat label="Leads woken up" value="214" note="from cold sequences" />
        <Stat label="Average open rate" value="74%" note="WhatsApp 89% · SMS 72% · Email 32%" />
      </Stats>

      <Card className="mb-5">
        <CardHead title="The speed-to-lead cascade" sub="Every new lead enters here. Observer moves to the next channel only when the last one goes quiet." />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {cascade.map((s) => {
            const Icon = cascadeIcon[s.channel] ?? WhatsappLogo;
            return (
              <li key={s.step} className="rounded-[14px] bg-pearl p-4">
                <div className="flex items-center justify-between">
                  <span className={cx("flex size-9 items-center justify-center rounded-full", s.step === 6 ? "bg-ok-soft text-ok" : "bg-creek-soft text-creek")}><Icon size={18} /></span>
                  <span className="t-fine tnum text-ink-3">{t("Step")} {s.step}</span>
                </div>
                <p className="mt-3 font-medium">{t(s.channel)}</p>
                <p className="t-caption text-ink-2">{t(s.wait)} · {t(s.condition)}</p>
                <p className="t-caption mt-2">{t(s.action)}</p>
              </li>
            );
          })}
        </ol>
        <h3 className="mt-6 text-[14px] font-semibold">{t("Where leads are right now")}</h3>
        <ul className="mt-2 divide-y divide-hairline-soft">
          {journeys.map((j) => (
            <li key={j.name} className="flex flex-wrap items-center gap-3 py-2.5 text-[14px]">
              <Monogram name={j.name} size={28} />
              <span className="w-40 font-medium">{j.name}</span>
              <span className="flex gap-1" aria-label={`${t("Step")} ${j.step} / 6`}>
                {[1, 2, 3, 4, 5, 6].map((n) => <span key={n} className={cx("h-1.5 w-6 rounded-full", n < j.step ? "bg-creek/40" : n === j.step ? (j.step === 6 ? "bg-ok" : "bg-creek") : "bg-hairline-soft")} />)}
              </span>
              <span className="flex-1 text-ink-2">{t(j.detail)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mb-4">
        <Segmented label="Filter sequences" value={f} onChange={setF} options={[{ value: "all", label: "All" }, { value: "whatsapp", label: "WhatsApp" }, { value: "sms", label: "SMS" }, { value: "email", label: "Email" }, { value: "ai_call", label: "AI call" }]} />
      </div>
      <div className="grid gap-3">
        {list.map((s, i) => {
          const Icon = chIcon[s.channel as keyof typeof chIcon];
          const isOpen = open === i;
          return (
            <Card key={s.name} pad={false}>
              <button className="flex w-full flex-wrap items-center gap-4 p-5 text-start" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
                <span className="flex size-10 items-center justify-center rounded-full bg-creek-soft text-creek"><Icon size={18} /></span>
                <span className="min-w-[180px] flex-1">
                  <span className="block font-medium">{t(s.name)}</span>
                  <span className="t-caption text-ink-2">{t(s.trigger)}</span>
                </span>
                <span className="t-caption tnum text-ink-2">{s.enrolled.toLocaleString()} {t("enrolled")}</span>
                <span className="w-28"><span className="t-caption tnum mb-1 block text-ink-2">{s.openRate}% {t("opened")}</span><Meter value={s.openRate} tone="ok" /></span>
                <Pill tone="ok"><Dot tone="ok" live /> {t("Running")}</Pill>
              </button>
              {isOpen && (
                <ol className="space-y-3 border-t border-hairline-soft p-5">
                  {s.steps.map((st, k) => (
                    <li key={k} className="grid gap-1 sm:grid-cols-[160px_1fr] sm:gap-4">
                      <span className="t-caption font-medium text-ink-2">{t(st.delay)}</span>
                      <p className="whitespace-pre-line rounded-[14px] bg-pearl px-4 py-3 text-[15px]">{t(st.msg)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}

export function Social() {
  const { t } = useT();
  return (
    <>
      <div className="relative mb-6 overflow-hidden rounded-[22px] bg-tile text-white">
        <Image src={img("marinaCamels", 1600)} alt="" fill sizes="100vw" className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
        <div className="relative px-6 pb-8 pt-24 sm:px-10">
          <p className="flex items-center gap-2 text-[14px] text-white/75"><FacebookLogo size={18} /> <InstagramLogo size={18} /> {t("Facebook and Instagram")}</p>
          <h1 className="mt-2 max-w-[24ch] text-[30px] font-semibold leading-[1.08] tracking-[-0.024em] sm:text-[40px]">{t("Every DM, comment and lead form answered in seconds.")}</h1>
          <p className="mt-3 max-w-[56ch] text-white/75">{t("If a social lead doesn’t close, Observer calls them, qualifies them and books the viewing. You can be at dinner.")}</p>
        </div>
      </div>
      <Stats>
        <Stat label="Social leads" value="4,742" note="all answered" />
        <Stat label="Response rate" value="100%" />
        <Stat label="AI calls placed" value="318" note="to leads that hadn’t closed" />
        <Stat label="Pipeline from social" value="AED 6.1M" />
      </Stats>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHead title="Automations" aside={<Pill tone="ok"><Dot tone="ok" live />{t("Running")}</Pill>} />
          <ul className="divide-y divide-hairline-soft">
            {socialFlows.map((f) => (
              <li key={f.name} className="py-3.5">
                <div className="flex items-center justify-between gap-3"><p className="font-medium">{t(f.name)}</p><span className="t-caption tnum text-ink-2">{f.runs.toLocaleString()} {t("runs")}</span></div>
                <p className="t-caption mt-0.5 text-ink-2">{t(f.desc)}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHead title="Live conversations" aside={<span className="t-caption flex items-center gap-1.5 text-ink-2"><Dot live />{t("Live")}</span>} />
          <ul className="space-y-4">
            {socialFeed.map((m) => (
              <li key={m.who}>
                <p className="t-caption mb-1.5 text-ink-2">{m.who} · {t(m.src)} · {m.t}</p>
                <p className="max-w-[85%] rounded-[16px] bg-parchment px-3.5 py-2 text-[15px]">{t(m.text)}</p>
                <p className="ms-auto mt-1.5 max-w-[85%] rounded-[16px] bg-creek px-3.5 py-2 text-[15px] text-on-creek">{t(m.reply)}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
