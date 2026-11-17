"use client";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Trash, PaperPlaneTilt, Robot, User, Pause, Flask, UploadSimple } from "@phosphor-icons/react";
import { useT } from "@/components/app/i18n";
import { cx } from "@/components/app/ui";
import { Result, field, labelCls } from "./forms";
import * as G from "@/app/[locale]/workspace/growth-actions";
import type { ActionResult } from "@/app/[locale]/workspace/actions";

const WEEK = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY: Record<string, string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
type Hours = Record<string, [string, string][]>;

function Save({ pending, label = "Save", icon }: { pending: boolean; label?: string; icon?: React.ReactNode }) {
  const { t } = useT();
  return (
    <button disabled={pending} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-creek px-5 text-[14px] font-medium text-on-creek transition hover:bg-creek-hover active:scale-[.97] disabled:opacity-60">
      {icon}{pending ? t("Saving…") : t(label)}
    </button>
  );
}

function Toggle({ name, defaultChecked, label, hint, disabled }: { name: string; defaultChecked: boolean; label: string; hint?: string; disabled?: boolean }) {
  const { t } = useT();
  return (
    <label className="flex items-start justify-between gap-4 py-1">
      <span><span className="block text-[15px]">{t(label)}</span>{hint && <span className="t-caption block text-ink-2">{t(hint)}</span>}</span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} disabled={disabled} className="mt-1 size-5 shrink-0 accent-[var(--creek)]" />
    </label>
  );
}

function WeekEditor({ prefix, hours, from = "open", to = "close", disabled }: { prefix?: string; hours: Hours; from?: string; to?: string; disabled?: boolean }) {
  const { t } = useT();
  return (
    <div className="grid gap-2">
      {WEEK.map((d) => {
        const [a, b] = hours[d]?.[0] ?? ["09:00", "18:00"];
        const on = !!hours[d]?.length;
        return (
          <div key={d} className="grid grid-cols-[24px_96px_1fr_1fr] items-center gap-2 text-[14px]">
            <input type="checkbox" name={`${prefix ?? ""}${d}_on`} defaultChecked={on} disabled={disabled} aria-label={t(DAY[d])} className="size-5 accent-[var(--creek)]" />
            <span>{t(DAY[d])}</span>
            <input name={`${prefix ?? ""}${d}_${from}`} type="time" defaultValue={a} disabled={disabled} aria-label={`${t(DAY[d])} ${t("from")}`} className={cx(field, "mt-0 h-9")} dir="ltr" />
            <input name={`${prefix ?? ""}${d}_${to}`} type="time" defaultValue={b} disabled={disabled} aria-label={`${t(DAY[d])} ${t("to")}`} className={cx(field, "mt-0 h-9")} dir="ltr" />
          </div>
        );
      })}
    </div>
  );
}

// ── AI settings ─────────────────────────────────────────────────────────
export interface SettingsView {
  assistant_name: string; timezone: string; office_hours: Hours; holidays: string[]; ai_enabled: boolean; sandbox_mode: boolean;
  quiet_start: string; quiet_end: string; followup_days: number[]; escalate_score: number; first_contact_delay_s: number;
  whatsapp_phone_number_id: string | null; whatsapp_template: string; email_from: string | null; voice_from: string | null; meta_page_id: string | null;
}

export function AiSettingsForm({ workspaceId, s, disabled }: { workspaceId: string; s: SettingsView; disabled: boolean }) {
  const { t, locale } = useT();
  const [state, action, pending] = useActionState(G.saveAiSettings.bind(null, locale, workspaceId), null);
  return (
    <form action={action} className="grid gap-8">
      <fieldset disabled={disabled} className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-[17px] font-semibold">{t("Assistant")}</legend>
        <label className={labelCls}>{t("Assistant name")}<input name="assistant_name" maxLength={40} defaultValue={s.assistant_name} className={field} /></label>
        <label className={labelCls}>{t("Office time zone")}<input name="timezone" maxLength={64} defaultValue={s.timezone} dir="ltr" className={field} /></label>
        <div className="sm:col-span-2 divide-y divide-hairline-soft rounded-[12px] border border-hairline-soft px-4">
          <Toggle name="ai_enabled" defaultChecked={s.ai_enabled} label="AI replies to leads" hint="First contact, follow-ups and after-hours conversations." />
          <Toggle name="sandbox_mode" defaultChecked={s.sandbox_mode} label="Sandbox mode" hint="Messages are written and logged but never sent. Turn off when your channels are connected." />
        </div>
      </fieldset>

      <fieldset disabled={disabled} className="grid gap-4">
        <legend className="mb-3 text-[17px] font-semibold">{t("Office hours")}</legend>
        <p className="t-caption -mt-2 text-ink-2">{t("In office hours the AI makes the first reply, qualifies, then hands over to your agent. Outside them it keeps the conversation going on its own.")}</p>
        <WeekEditor hours={s.office_hours} />
        <label className={labelCls}>{t("Holidays (YYYY-MM-DD, comma separated)")}<input name="holidays" defaultValue={s.holidays.join(", ")} dir="ltr" className={field} /></label>
      </fieldset>

      <fieldset disabled={disabled} className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-[17px] font-semibold">{t("Timing")}</legend>
        <label className={labelCls}>{t("First reply after (seconds)")}<input name="first_contact_delay_s" type="number" min={0} max={180} defaultValue={s.first_contact_delay_s} className={field} /></label>
        <label className={labelCls}>{t("Follow-up days")}<input name="followup_days" defaultValue={s.followup_days.join(", ")} dir="ltr" className={field} /></label>
        <label className={labelCls}>{t("Quiet hours start (lead’s time)")}<input name="quiet_start" type="time" defaultValue={s.quiet_start} dir="ltr" className={field} /></label>
        <label className={labelCls}>{t("Quiet hours end")}<input name="quiet_end" type="time" defaultValue={s.quiet_end} dir="ltr" className={field} /></label>
        <label className={labelCls}>{t("Hand over to a person at score")}<input name="escalate_score" type="number" min={50} max={100} defaultValue={s.escalate_score} className={field} /></label>
      </fieldset>

      <fieldset disabled={disabled} className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-[17px] font-semibold">{t("Channels")}</legend>
        <label className={labelCls}>{t("WhatsApp phone number ID")}<input name="whatsapp_phone_number_id" defaultValue={s.whatsapp_phone_number_id ?? ""} dir="ltr" className={field} /></label>
        <label className={labelCls}>{t("First-contact template name")}<input name="whatsapp_template" defaultValue={s.whatsapp_template} dir="ltr" className={field} /></label>
        <label className={labelCls}>{t("Send email from")}<input name="email_from" defaultValue={s.email_from ?? ""} placeholder="Noor <noor@yourbrokerage.ae>" dir="ltr" className={field} /></label>
        <label className={labelCls}>{t("Voice number (Twilio, +971…)")}<input name="voice_from" defaultValue={s.voice_from ?? ""} dir="ltr" className={field} /></label>
        <label className={labelCls}>{t("Facebook Page ID (Lead Ads)")}<input name="meta_page_id" defaultValue={s.meta_page_id ?? ""} dir="ltr" className={field} /></label>
      </fieldset>
      {!disabled && <div className="flex items-center gap-4"><Save pending={pending} /><Result state={state} /></div>}
    </form>
  );
}

export function TestLeadForm({ workspaceId }: { workspaceId: string }) {
  const { t, locale } = useT();
  const [state, action, pending] = useActionState(G.sendTestLead.bind(null, locale, workspaceId), null);
  return (
    <form action={action} className="grid gap-4">
      <label className={labelCls}>{t("Name")}<input name="name" defaultValue="Sara Test" className={field} /></label>
      <label className={labelCls}>{t("Their enquiry (any language)")}
        <textarea name="message" rows={3} dir="auto" defaultValue="Hi, I'm looking for a 3 bedroom villa in Dubai Hills, around 5M, cash buyer. Can I view this week?" className={cx(field, "h-auto py-2.5")} />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <Save pending={pending} label="Send test lead" icon={<Flask size={16} />} />
        <Result state={state} />
        {state?.ok && state.id && <a href={`/${locale}/workspace/inbox?lead=${state.id}`} className="t-caption text-creek">{t("Open the conversation")}</a>}
      </div>
    </form>
  );
}

export function CopyField({ value, label }: { value: string; label: string }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  return (
    <div className="grid gap-1.5">
      <span className="t-caption text-ink-2">{t(label)}</span>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-[10px] bg-parchment px-3 py-2.5 text-[13px]" dir="ltr">{value}</code>
        <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {} }}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-parchment" aria-label={t("Copy")}>{copied ? <Check size={16} className="text-ok" /> : <Copy size={16} />}</button>
      </div>
    </div>
  );
}

export function RotateKeyButton({ workspaceId, which }: { workspaceId: string; which: "form" | "ingest" }) {
  const { t, locale } = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  const label = which === "form" ? "Replace form key" : "Replace private key";
  return (
    <button type="button" disabled={pending} className="h-9 rounded-full bg-parchment px-4 text-[13px] font-medium disabled:opacity-60"
      onClick={() => { if (confirm(t("The old key stops working immediately. Continue?"))) start(async () => { await G.rotateKey(locale, workspaceId, which); router.refresh(); }); }}>
      {t(label)}
    </button>
  );
}

// ── Conversations ───────────────────────────────────────────────────────
export function Composer({ leadId, channels, defaultChannel }: { leadId: string; channels: ("whatsapp" | "email")[]; defaultChannel: "whatsapp" | "email" }) {
  const { t, locale } = useT();
  const ref = useRef<HTMLFormElement>(null);
  const [channel, setChannel] = useState(defaultChannel);
  const [state, action, pending] = useActionState(async (p: ActionResult | null, f: FormData) => {
    const r = await G.sendAgentMessage(locale, leadId, p, f);
    if (r.ok) ref.current?.reset();
    return r;
  }, null);
  if (!channels.length) return <p className="t-caption text-ink-2">{t("No contact channel this lead agreed to.")}</p>;
  return (
    <form ref={ref} action={action} className="grid gap-2">
      <input type="hidden" name="channel" value={channel} />
      {channels.length > 1 && (
        <div className="flex gap-1" role="radiogroup" aria-label={t("Channel")}>
          {channels.map((c) => (
            <button key={c} type="button" role="radio" aria-checked={channel === c} onClick={() => setChannel(c)}
              className={cx("h-8 rounded-full px-3 text-[13px]", channel === c ? "bg-ink text-canvas" : "bg-parchment text-ink-2")}>{t(c === "whatsapp" ? "WhatsApp" : "Email")}</button>
          ))}
        </div>
      )}
      {channel === "email" && <input name="subject" placeholder={t("Subject")} className={cx(field, "mt-0")} />}
      <div className="flex items-end gap-2">
        <textarea name="body" rows={2} required dir="auto" placeholder={t("Write a reply. Sending takes over from the AI.")} className={cx(field, "mt-0 h-auto min-h-11 flex-1 py-2.5")}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); ref.current?.requestSubmit(); } }} />
        <button disabled={pending} aria-label={t("Send")} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-creek text-on-creek disabled:opacity-60"><PaperPlaneTilt size={18} weight="fill" className="rtl:-scale-x-100" /></button>
      </div>
      <Result state={state} />
    </form>
  );
}

export function AiModeSwitch({ leadId, mode, disabled }: { leadId: string; mode: "ai" | "human" | "paused"; disabled?: boolean }) {
  const { t, locale } = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  const opts = [
    { v: "ai" as const, label: "AI", icon: Robot },
    { v: "human" as const, label: "Agent", icon: User },
    { v: "paused" as const, label: "Paused", icon: Pause },
  ];
  return (
    <div className="inline-flex rounded-full bg-parchment p-1" role="radiogroup" aria-label={t("Who is replying")}>
      {opts.map(({ v, label, icon: Icon }) => (
        <button key={v} role="radio" aria-checked={mode === v} disabled={disabled || pending}
          onClick={() => start(async () => { await G.setAiMode(locale, leadId, v); router.refresh(); })}
          className={cx("inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] transition", mode === v ? "bg-canvas font-medium shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-ink-2")}>
          <Icon size={14} weight={mode === v ? "fill" : "regular"} />{t(label)}
        </button>
      ))}
    </div>
  );
}

export function MarkReadButton() {
  const { t, locale } = useT();
  const [pending, start] = useTransition();
  return <button disabled={pending} onClick={() => start(async () => { await G.markNotificationsRead(locale); })} className="t-caption text-creek disabled:opacity-60">{t("Mark all read")}</button>;
}

/** Re-render the server page every few seconds so new messages and AI replies appear. */
export function AutoRefresh({ every = 8000 }: { every?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, every);
    return () => clearInterval(id);
  }, [router, every]);
  return null;
}

// ── Inventory ───────────────────────────────────────────────────────────
export interface ProjectView { id: string; name: string; developer: string | null; area: string | null; city: string | null; status: string; handover: string | null; description: string | null; amenities: string[]; brochure_path: string | null }

export function ProjectForm({ workspaceId, p, onDone }: { workspaceId: string; p?: ProjectView; onDone?: () => void }) {
  const { t, locale } = useT();
  const [state, action, pending] = useActionState(G.saveProject.bind(null, locale, workspaceId, p?.id ?? null), null);
  useEffect(() => { if (state?.ok && onDone) onDone(); }, [state, onDone]);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className={labelCls}>{t("Project name")}<input name="name" required defaultValue={p?.name} className={field} /></label>
      <label className={labelCls}>{t("Developer")}<input name="developer" defaultValue={p?.developer ?? ""} className={field} /></label>
      <label className={labelCls}>{t("Area")}<input name="area" defaultValue={p?.area ?? ""} placeholder={t("e.g. Dubai Hills")} className={field} /></label>
      <label className={labelCls}>{t("City")}<input name="city" defaultValue={p?.city ?? "Dubai"} className={field} /></label>
      <label className={labelCls}>{t("Status")}
        <select name="status" defaultValue={p?.status ?? "off_plan"} className={field}>
          <option value="off_plan">{t("Off-plan")}</option><option value="ready">{t("Ready")}</option><option value="sold_out">{t("Sold out")}</option>
        </select>
      </label>
      <label className={labelCls}>{t("Handover")}<input name="handover" defaultValue={p?.handover ?? ""} placeholder="Q4 2028" className={field} /></label>
      <label className={cx(labelCls, "sm:col-span-2")}>{t("Description the AI can use")}<textarea name="description" rows={3} dir="auto" defaultValue={p?.description ?? ""} className={cx(field, "h-auto py-2.5")} /></label>
      <label className={cx(labelCls, "sm:col-span-2")}>{t("Amenities (comma separated)")}<input name="amenities" defaultValue={p?.amenities.join(", ") ?? ""} className={field} /></label>
      <label className={labelCls}>{t("Brochure PDF")}<input name="brochure" type="file" accept="application/pdf" className={cx(field, "pt-2")} /></label>
      <label className={labelCls}>{t("…or brochure link")}<input name="brochure_url" type="url" placeholder="https://" dir="ltr" className={field} /></label>
      <div className="flex items-center gap-4 sm:col-span-2"><Save pending={pending} /><Result state={state} /></div>
    </form>
  );
}

export function UnitForm({ workspaceId, projectId }: { workspaceId: string; projectId: string }) {
  const { t, locale } = useT();
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (p: ActionResult | null, f: FormData) => {
    const r = await G.addUnit(locale, workspaceId, projectId, p, f); if (r.ok) ref.current?.reset(); return r;
  }, null);
  const small = cx(field, "mt-0 h-9 text-[14px]");
  return (
    <form ref={ref} action={action} className="grid grid-cols-2 gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]">
      <input name="unit_type" required placeholder={t("Unit type")} aria-label={t("Unit type")} className={small} />
      <input name="beds" inputMode="decimal" placeholder={t("Beds")} aria-label={t("Beds")} className={small} />
      <input name="size_sqft" inputMode="numeric" placeholder={t("Sq ft")} aria-label={t("Sq ft")} className={small} />
      <input name="price_from" placeholder={t("From (AED)")} aria-label={t("From (AED)")} dir="ltr" className={small} />
      <input name="price_to" placeholder={t("To (AED)")} aria-label={t("To (AED)")} dir="ltr" className={small} />
      <input name="available" inputMode="numeric" placeholder={t("Available")} aria-label={t("Available")} className={small} />
      <button disabled={pending} className="h-9 rounded-full bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60">{t("Add")}</button>
      <div className="col-span-full"><Result state={state} /></div>
    </form>
  );
}

export interface UnitView { id: string; unit_type: string; beds: number | null; size_sqft: number | null; price_from: number | null; price_to: number | null; available: number | null }

/** Inline editor for one unit type. */
export function UnitEditForm({ u }: { u: UnitView }) {
  const { t, locale } = useT();
  const [state, action, pending] = useActionState(G.updateUnit.bind(null, locale, u.id), null);
  const small = cx(field, "mt-0 h-9 text-[14px]");
  return (
    <form action={action} className="grid grid-cols-2 gap-2 py-2 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]">
      <input name="unit_type" required defaultValue={u.unit_type} aria-label={t("Unit type")} className={small} />
      <input name="beds" defaultValue={u.beds ?? ""} aria-label={t("Beds")} className={small} />
      <input name="size_sqft" defaultValue={u.size_sqft ?? ""} aria-label={t("Sq ft")} className={small} />
      <input name="price_from" defaultValue={u.price_from ?? ""} aria-label={t("From (AED)")} dir="ltr" className={small} />
      <input name="price_to" defaultValue={u.price_to ?? ""} aria-label={t("To (AED)")} dir="ltr" className={small} />
      <input name="available" defaultValue={u.available ?? ""} aria-label={t("Available")} className={small} />
      <button disabled={pending} className="h-9 rounded-full bg-creek px-4 text-[13px] font-medium text-on-creek disabled:opacity-60">{t("Save")}</button>
      <div className="col-span-full"><Result state={state} /></div>
    </form>
  );
}

export function PlanForm({ workspaceId, projectId }: { workspaceId: string; projectId: string }) {
  const { t, locale } = useT();
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (p: ActionResult | null, f: FormData) => {
    const r = await G.addPlan(locale, workspaceId, projectId, p, f); if (r.ok) ref.current?.reset(); return r;
  }, null);
  return (
    <form ref={ref} action={action} className="grid gap-2 sm:grid-cols-[1fr_2fr]">
      <div className="grid gap-2">
        <input name="name" required placeholder={t("Plan name, e.g. 60/40")} aria-label={t("Plan name")} className={cx(field, "mt-0 h-9 text-[14px]")} />
        <input name="summary" placeholder={t("One-line summary")} aria-label={t("Summary")} className={cx(field, "mt-0 h-9 text-[14px]")} />
        <label className="flex items-center gap-2 text-[13px] text-ink-2"><input type="checkbox" name="post_handover" className="size-4 accent-[var(--creek)]" />{t("Post-handover plan")}</label>
      </div>
      <div className="grid gap-2">
        <textarea name="schedule" rows={3} placeholder={"Booking 20\nDuring construction 40\nOn handover 40"} aria-label={t("Milestones, one per line")} className={cx(field, "mt-0 h-auto py-2 text-[14px]")} />
        <div className="flex items-center gap-3"><button disabled={pending} className="h-9 rounded-full bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60">{t("Add plan")}</button><Result state={state} /></div>
      </div>
    </form>
  );
}

export function CsvImport({ workspaceId }: { workspaceId: string }) {
  const { t, locale } = useT();
  const [state, action, pending] = useActionState(G.importCsv.bind(null, locale, workspaceId), null);
  return (
    <form action={action} className="grid gap-3">
      <p className="t-caption text-ink-2" dir="ltr">project, developer, area, status, handover, unit_type, beds, size_sqft, price_from, price_to, available</p>
      <input name="file" type="file" accept=".csv,text/csv" aria-label={t("CSV file")} className={cx(field, "pt-2")} />
      <div className="flex items-center gap-4"><Save pending={pending} label="Import" icon={<UploadSimple size={16} />} /><Result state={state} /></div>
    </form>
  );
}

export function DeleteButton({ kind, id, confirmText }: { kind: "project" | "unit" | "plan"; id: string; confirmText: string }) {
  const { t, locale } = useT();
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} aria-label={t("Delete")}
      onClick={() => { if (confirm(t(confirmText))) start(async () => { await (kind === "project" ? G.deleteProject(locale, id) : kind === "plan" ? G.deletePlan(locale, id) : G.deleteUnit(locale, id)); }); }}
      className="flex size-8 items-center justify-center rounded-full text-ink-3 hover:bg-hot-soft hover:text-hot disabled:opacity-60"><Trash size={15} /></button>
  );
}

// ── Calendar ────────────────────────────────────────────────────────────
export function AppointmentActions({ id, status }: { id: string; status: string }) {
  const { t, locale } = useT();
  const [pending, start] = useTransition();
  if (status !== "booked") return <span className="t-caption text-ink-3">{t(status === "done" ? "Done" : status === "no_show" ? "No-show" : "Cancelled")}</span>;
  const b = (s: "done" | "no_show" | "cancelled", label: string) => (
    <button disabled={pending} onClick={() => start(async () => { await G.setAppointmentStatus(locale, id, s); })} className="t-caption rounded-full px-2.5 py-1 hover:bg-parchment disabled:opacity-60">{t(label)}</button>
  );
  return <div className="flex flex-wrap gap-1">{b("done", "Done")}{b("no_show", "No-show")}{b("cancelled", "Cancel")}</div>;
}

export function BookingForm({ workspaceId, leads, agents, meId, canPickAgent }: { workspaceId: string; leads: { id: string; name: string }[]; agents: { id: string; name: string }[]; meId: string; canPickAgent: boolean }) {
  const { t, locale } = useT();
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (p: ActionResult | null, f: FormData) => {
    const r = await G.bookAppointment(locale, workspaceId, p, f); if (r.ok) ref.current?.reset(); return r;
  }, null);
  return (
    <form ref={ref} action={action} className="grid gap-3 sm:grid-cols-3">
      <label className={cx(labelCls, "sm:col-span-2")}>{t("Lead")}
        <select name="lead_id" required className={field}><option value="">{t("Choose a lead")}</option>{leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
      </label>
      <label className={labelCls}>{t("Type")}
        <select name="kind" className={field}><option value="viewing">{t("Viewing")}</option><option value="call">{t("Call")}</option><option value="meeting">{t("Meeting")}</option></select>
      </label>
      <label className={labelCls}>{t("Date")}<input name="date" type="date" required className={field} dir="ltr" /></label>
      <label className={labelCls}>{t("Time")}<input name="time" type="time" required className={field} dir="ltr" /></label>
      <label className={labelCls}>{t("Minutes")}<input name="minutes" type="number" min={15} max={240} step={15} defaultValue={60} className={field} /></label>
      {canPickAgent && (
        <label className={labelCls}>{t("Agent")}
          <select name="agent_id" defaultValue={meId} className={field}>{agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
        </label>
      )}
      <label className={cx(labelCls, canPickAgent ? "sm:col-span-2" : "sm:col-span-3")}>{t("Where")}<input name="location" placeholder={t("e.g. Hills Grove sales gallery")} className={field} /></label>
      <div className="flex items-center gap-4 sm:col-span-3"><Save pending={pending} label="Book" /><Result state={state} /></div>
    </form>
  );
}

// ── Routing profile ─────────────────────────────────────────────────────
export interface ProfileView { languages: string[]; areas: string[]; max_open_leads: number; available: boolean; top_performer: boolean; alert_phone: string | null; availability: Hours }

export function MemberProfileForm({ workspaceId, userId, p, canEdit, isManager }: { workspaceId: string; userId: string; p: ProfileView; canEdit: boolean; isManager: boolean }) {
  const { t, locale } = useT();
  const [state, action, pending] = useActionState(G.saveMemberProfile.bind(null, locale, workspaceId, userId), null);
  return (
    <form action={action} className="grid gap-4">
      <fieldset disabled={!canEdit} className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>{t("Languages (en, ar, hi, ur, es, pt, ru, fr, zh, fa)")}<input name="languages" defaultValue={p.languages.join(", ")} dir="ltr" className={field} /></label>
        <label className={labelCls}>{t("Area specialties")}<input name="areas" defaultValue={p.areas.join(", ")} placeholder={t("e.g. Dubai Hills, Downtown")} className={field} /></label>
        <label className={labelCls}>{t("WhatsApp for urgent alerts")}<input name="alert_phone" defaultValue={p.alert_phone ?? ""} dir="ltr" placeholder="+971" className={field} /></label>
        <label className={labelCls}>{t("Most open leads at once")}<input name="max_open_leads" type="number" min={1} max={1000} defaultValue={p.max_open_leads} disabled={!isManager} className={field} /></label>
        <div className="sm:col-span-2 divide-y divide-hairline-soft rounded-[12px] border border-hairline-soft px-4">
          <Toggle name="available" defaultChecked={p.available} label="Taking new leads" />
          <Toggle name="top_performer" defaultChecked={p.top_performer} label="Top performer (gets hot leads first)" disabled={!isManager} />
        </div>
        <div className="sm:col-span-2">
          <p className="t-caption mb-2 text-ink-2">{t("Hours the AI may book viewings and calls")}</p>
          <WeekEditor hours={p.availability} from="from" to="to" />
        </div>
      </fieldset>
      {canEdit && <div className="flex items-center gap-4"><Save pending={pending} /><Result state={state} /></div>}
    </form>
  );
}
