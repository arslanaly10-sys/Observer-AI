"use client";
import { useActionState, useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Trash, X, Plus } from "@phosphor-icons/react";
import { useT } from "@/components/app/i18n";
import { cx } from "@/components/app/ui";
import type { ActionResult } from "@/app/[locale]/workspace/actions";
import * as A from "@/app/[locale]/workspace/actions";

export const field = "mt-1.5 h-11 w-full rounded-[10px] border border-hairline bg-canvas px-3 text-[15px] outline-none focus:border-creek disabled:opacity-60";
export const labelCls = "t-caption grid text-ink-2";

/** Inline result line for a form: green when saved, red with a reason when not. */
export function Result({ state }: { state: ActionResult | null }) {
  const { t } = useT();
  if (!state) return null;
  return state.ok
    ? state.message ? <p role="status" className="t-caption text-ok">{t(state.message)}</p> : null
    : <p role="alert" className="t-caption rounded-[10px] bg-hot-soft px-3 py-2 text-hot">{t(state.error)}</p>;
}

function Submit({ pending, children, danger }: { pending: boolean; children: ReactNode; danger?: boolean }) {
  const { t } = useT();
  return (
    <button disabled={pending} className={cx("inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-5 text-[14px] font-medium transition active:scale-[.97] disabled:opacity-60", danger ? "bg-hot text-white" : "bg-creek text-on-creek hover:bg-creek-hover")}>
      {pending ? t("Saving…") : children}
    </button>
  );
}

// ── Onboarding ──────────────────────────────────────────────────────────
export function OnboardingForm() {
  const { t, locale } = useT();
  const [state, action, pending] = useActionState(A.createWorkspace.bind(null, locale), null);
  return (
    <form action={action} className="grid gap-4">
      <label className={labelCls}>{t("Brokerage or team name")}<input name="name" required minLength={2} maxLength={120} placeholder={t("e.g. Meridian Properties")} className={field} /></label>
      <label className={labelCls}>{t("City")}<input name="city" maxLength={80} placeholder={t("e.g. Dubai")} className={field} /></label>
      <label className="flex items-start gap-3 text-[15px] text-ink-2"><input type="checkbox" name="samples" defaultChecked className="mt-1 size-5 accent-[var(--creek)]" />{t("Add eight sample leads so I can look around. I can delete them anytime.")}</label>
      <Result state={state} />
      <Submit pending={pending}>{t("Create workspace")}</Submit>
    </form>
  );
}

// ── Leads ───────────────────────────────────────────────────────────────
export type LeadDefaults = Partial<{ name: string; phone: string | null; email: string | null; type: string; source: string; budget_aed: number | null; area: string | null; timeframe: string | null; financing: string | null; serious: boolean; notes: string | null }>;
const SOURCES = ["WhatsApp", "Bayut", "Property Finder", "Dubizzle", "Instagram", "Facebook", "Referral", "Website", "Walk-in"];
const TIMEFRAMES = ["<1 mo", "1-2 mo", "3 mo", "6 mo", "12 mo", "18 mo"];

export function LeadFields({ d = {}, members, canAssign }: { d?: LeadDefaults; members?: { id: string; name: string }[]; canAssign?: boolean }) {
  const { t } = useT();
  const budget = d.budget_aed ? (d.budget_aed >= 1e6 ? `${d.budget_aed / 1e6}M` : `${Math.round(d.budget_aed / 1e3)}K`) : "";
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={cx(labelCls, "sm:col-span-2")}>{t("Full name")}<input name="name" required maxLength={120} defaultValue={d.name} className={field} /></label>
      <label className={labelCls}>{t("WhatsApp number")}<input name="phone" maxLength={40} inputMode="tel" dir="ltr" defaultValue={d.phone ?? ""} placeholder="+971" className={field} /></label>
      <label className={labelCls}>{t("Email")}<input name="email" type="email" maxLength={254} dir="ltr" defaultValue={d.email ?? ""} className={field} /></label>
      <label className={labelCls}>{t("Looking to")}
        <select name="type" defaultValue={d.type ?? "buyer"} className={field}><option value="buyer">{t("Buy")}</option><option value="seller">{t("Sell")}</option></select>
      </label>
      <label className={labelCls}>{t("Source")}
        <select name="source" defaultValue={d.source ?? "WhatsApp"} className={field}>{SOURCES.map((s) => <option key={s} value={s}>{t(s)}</option>)}</select>
      </label>
      <label className={labelCls}>{t("Budget (AED)")}<input name="budget" maxLength={40} dir="ltr" defaultValue={budget} placeholder="3.5M" className={field} /></label>
      <label className={labelCls}>{t("Area")}<input name="area" maxLength={80} defaultValue={d.area ?? ""} placeholder={t("e.g. Dubai Hills")} className={field} /></label>
      <label className={labelCls}>{t("Moving within")}
        <select name="timeframe" defaultValue={d.timeframe ?? "3 mo"} className={field}>{TIMEFRAMES.map((s) => <option key={s}>{s}</option>)}</select>
      </label>
      <label className={labelCls}>{t("Financing")}
        <select name="financing" defaultValue={d.financing ?? "Unknown"} className={field}>{["Cash", "Mortgage", "Unknown", "N/A"].map((s) => <option key={s} value={s}>{t(s)}</option>)}</select>
      </label>
      <label className={labelCls}>{t("How serious do they sound?")}
        <select name="serious" defaultValue={d.serious === false ? "off" : "on"} className={field}><option value="on">{t("Ready to act")}</option><option value="off">{t("Just looking")}</option></select>
      </label>
      {members && (
        <label className={labelCls}>{t("Assigned to")}
          <select name="assigned_to" defaultValue="me" className={field}>
            <option value="me">{t("Me")}</option>
            <option value="">{t("Unassigned")}</option>
            {canAssign && members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
      )}
      <label className={cx(labelCls, "sm:col-span-2")}>{t("Notes")}<textarea name="notes" rows={3} maxLength={4000} defaultValue={d.notes ?? ""} className={cx(field, "h-auto py-2.5")} /></label>
    </div>
  );
}

export function AddLeadButton({ workspaceId, members, canAssign }: { workspaceId: string; members: { id: string; name: string }[]; canAssign: boolean }) {
  const { t, locale } = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(A.addLead.bind(null, locale, workspaceId), null);
  useEffect(() => { if (state?.ok && state.id) { setOpen(false); router.push(`/${locale}/workspace/leads/${state.id}`); } }, [state, locale, router]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [open]);
  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-creek px-5 text-[14px] font-medium text-on-creek hover:bg-creek-hover active:scale-[.97]"><Plus size={16} weight="bold" />{t("Add lead")}</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="add-lead-h">
          <button className="absolute inset-0 bg-black/35" aria-label={t("Close")} onClick={() => setOpen(false)} />
          <form action={action} className="relative max-h-[92dvh] w-full max-w-[640px] overflow-y-auto rounded-t-[22px] bg-canvas p-6 shadow-2xl sm:rounded-[22px]">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="add-lead-h" className="text-[21px] font-semibold tracking-[-0.016em]">{t("Add a lead")}</h2>
              <button type="button" onClick={() => setOpen(false)} className="flex size-9 items-center justify-center rounded-full hover:bg-parchment" aria-label={t("Close")}><X size={18} /></button>
            </div>
            <LeadFields members={members} canAssign={canAssign} />
            <div className="mt-5 flex items-center justify-between gap-3"><Result state={state} /><Submit pending={pending}>{t("Add and score")}</Submit></div>
          </form>
        </div>
      )}
    </>
  );
}

export function EditLeadForm({ leadId, d, disabled }: { leadId: string; d: LeadDefaults; disabled?: boolean }) {
  const { t, locale } = useT();
  const [state, action, pending] = useActionState(A.updateLead.bind(null, locale, leadId), null);
  return (
    <form action={action}>
      <fieldset disabled={disabled}><LeadFields d={d} /></fieldset>
      {!disabled && <div className="mt-5 flex items-center justify-between gap-3"><Result state={state} /><Submit pending={pending}>{t("Save changes")}</Submit></div>}
    </form>
  );
}

/** Small control that runs one action and shows its result. */
function useRun() {
  const [pending, start] = useTransition();
  const [res, setRes] = useState<ActionResult | null>(null);
  const run = (fn: () => Promise<ActionResult>) => start(async () => setRes(await fn()));
  return { pending, res, run };
}

export function StageSelect({ leadId, stage, labels, disabled }: { leadId: string; stage: string; labels: Record<string, string>; disabled?: boolean }) {
  const { t, locale } = useT();
  const { pending, res, run } = useRun();
  return (
    <div className="grid gap-1.5">
      <select aria-label={t("Stage")} disabled={disabled || pending} defaultValue={stage} onChange={(e) => run(() => A.setStage(locale, leadId, e.target.value as never))} className={field}>
        {Object.entries(labels).map(([k, v]) => <option key={k} value={k}>{t(v)}</option>)}
      </select>
      <Result state={res} />
    </div>
  );
}

export function AssignSelect({ leadId, value, members, meId, canAssign }: { leadId: string; value: string | null; members: { id: string; name: string }[]; meId: string; canAssign: boolean }) {
  const { t, locale } = useT();
  const { pending, res, run } = useRun();
  const options = canAssign ? members : members.filter((m) => m.id === meId);
  return (
    <div className="grid gap-1.5">
      <select aria-label={t("Assigned to")} disabled={pending} defaultValue={value ?? ""} onChange={(e) => run(() => A.assignLead(locale, leadId, e.target.value || null))} className={field}>
        <option value="">{t("Unassigned")}</option>
        {options.map((m) => <option key={m.id} value={m.id}>{m.id === meId ? `${m.name} (${t("me")})` : m.name}</option>)}
      </select>
      <Result state={res} />
    </div>
  );
}

export function NoteForm({ leadId, workspaceId }: { leadId: string; workspaceId: string }) {
  const { t, locale } = useT();
  const [state, action, pending] = useActionState(A.addNote.bind(null, locale, leadId, workspaceId), null);
  const [key, setKey] = useState(0);
  useEffect(() => { if (state?.ok) setKey((k) => k + 1); }, [state]);
  return (
    <form action={action} key={key} className="grid gap-3">
      <div className="flex gap-2">
        {["note", "call", "message"].map((k, i) => (
          <label key={k} className="cursor-pointer"><input type="radio" name="kind" value={k} defaultChecked={i === 0} className="peer sr-only" />
            <span className="inline-flex h-8 items-center rounded-full border border-hairline px-3 text-[13px] text-ink-2 peer-checked:border-creek peer-checked:bg-creek-soft peer-checked:text-creek peer-focus-visible:ring-2 peer-focus-visible:ring-creek">{t(k === "note" ? "Note" : k === "call" ? "Call" : "Message")}</span>
          </label>
        ))}
      </div>
      <textarea name="body" rows={3} maxLength={2000} required placeholder={t("What happened?")} aria-label={t("What happened?")} className={cx(field, "h-auto py-2.5")} />
      <div className="flex items-center justify-between gap-3"><Result state={state} /><Submit pending={pending}>{t("Add to timeline")}</Submit></div>
    </form>
  );
}

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const { t, locale } = useT();
  const { pending, res, run } = useRun();
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <div className="flex flex-wrap items-center gap-2">
      <span className="t-caption text-ink-2">{t("Delete this lead and its timeline?")}</span>
      <button disabled={pending} onClick={() => run(() => A.deleteLead(locale, leadId))} className="inline-flex h-9 items-center rounded-full bg-hot px-4 text-[14px] font-medium text-white">{t("Delete")}</button>
      <button onClick={() => setConfirm(false)} className="inline-flex h-9 items-center rounded-full px-3 text-[14px] text-ink-2">{t("Cancel")}</button>
      <Result state={res} />
    </div>
  ) : (
    <button onClick={() => setConfirm(true)} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] text-hot hover:bg-hot-soft"><Trash size={16} />{t("Delete lead")}</button>
  );
}

// ── Team ────────────────────────────────────────────────────────────────
export function InviteForm({ workspaceId, isOwner }: { workspaceId: string; isOwner: boolean }) {
  const { t, locale } = useT();
  const [state, action, pending] = useActionState(A.invite.bind(null, locale, workspaceId), null);
  const [copied, setCopied] = useState(false);
  const link = state?.ok && state.id ? `${location.origin}/${locale}/invite/${state.id}` : null;
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[1fr_160px_auto] sm:items-end">
      <label className={labelCls}>{t("Email")}<input name="email" type="email" required dir="ltr" placeholder="name@brokerage.ae" className={field} /></label>
      <label className={labelCls}>{t("Role")}
        <select name="role" defaultValue="agent" className={field}><option value="agent">{t("Agent")}</option>{isOwner && <option value="manager">{t("Manager")}</option>}</select>
      </label>
      <Submit pending={pending}>{t("Create invite")}</Submit>
      <div className="sm:col-span-3"><Result state={state} /></div>
      {link && (
        <div className="flex items-center gap-2 rounded-[12px] bg-pearl p-2 sm:col-span-3">
          <code className="min-w-0 flex-1 truncate px-2 text-[13px]" dir="ltr">{link}</code>
          <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} }}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-canvas px-3 text-[13px] font-medium">{copied ? <Check size={14} /> : <Copy size={14} />}{t(copied ? "Copied" : "Copy link")}</button>
        </div>
      )}
    </form>
  );
}

export function RoleSelect({ workspaceId, userId, role, disabled }: { workspaceId: string; userId: string; role: string; disabled?: boolean }) {
  const { t, locale } = useT();
  const { pending, res, run } = useRun();
  return (
    <div className="grid gap-1">
      <select aria-label={t("Role")} disabled={disabled || pending} defaultValue={role} onChange={(e) => run(() => A.setRole(locale, workspaceId, userId, e.target.value))} className={cx(field, "mt-0 h-9 w-36")}>
        {["owner", "manager", "agent"].map((r) => <option key={r} value={r}>{t(r[0].toUpperCase() + r.slice(1))}</option>)}
      </select>
      <Result state={res && !res.ok ? res : null} />
    </div>
  );
}

export function RemoveMemberButton({ workspaceId, userId, self }: { workspaceId: string; userId: string; self?: boolean }) {
  const { t, locale } = useT();
  const { pending, res, run } = useRun();
  return (
    <div className="grid justify-items-end gap-1">
      <button disabled={pending} onClick={() => run(() => A.removeMember(locale, workspaceId, userId))} className="inline-flex h-9 items-center rounded-full px-3 text-[14px] text-hot hover:bg-hot-soft">{t(self ? "Leave" : "Remove")}</button>
      <Result state={res && !res.ok ? res : null} />
    </div>
  );
}

export function RevokeInviteButton({ id }: { id: string }) {
  const { t, locale } = useT();
  const { pending, run } = useRun();
  return <button disabled={pending} onClick={() => run(() => A.revokeInvite(locale, id))} className="inline-flex h-9 items-center rounded-full px-3 text-[14px] text-ink-2 hover:bg-parchment">{t("Revoke")}</button>;
}

export function CopyInviteLink({ token }: { token: string }) {
  const { t, locale } = useT();
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async () => { try { await navigator.clipboard.writeText(`${location.origin}/${locale}/invite/${token}`); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} }}
      className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] text-creek hover:bg-creek-soft">{copied ? <Check size={14} /> : <Copy size={14} />}{t(copied ? "Copied" : "Copy link")}</button>
  );
}

// ── Settings ────────────────────────────────────────────────────────────
export function WorkspaceForm({ workspaceId, name, city, disabled }: { workspaceId: string; name: string; city: string | null; disabled?: boolean }) {
  const { t, locale } = useT();
  const [state, action, pending] = useActionState(A.updateWorkspace.bind(null, locale, workspaceId), null);
  return (
    <form action={action} className="grid gap-4">
      <fieldset disabled={disabled} className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>{t("Workspace name")}<input name="name" required minLength={2} maxLength={120} defaultValue={name} className={field} /></label>
        <label className={labelCls}>{t("City")}<input name="city" maxLength={80} defaultValue={city ?? ""} className={field} /></label>
      </fieldset>
      {!disabled && <div className="flex items-center justify-between gap-3"><Result state={state} /><Submit pending={pending}>{t("Save")}</Submit></div>}
    </form>
  );
}

export function ProfileForm({ fullName, locale: current }: { fullName: string; locale: string }) {
  const { t, locale } = useT();
  const [state, action, pending] = useActionState(A.updateProfile.bind(null, locale), null);
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>{t("Your name")}<input name="full_name" maxLength={120} defaultValue={fullName} className={field} /></label>
        <label className={labelCls}>{t("Preferred language")}
          <select name="locale" defaultValue={current} className={field}><option value="en">English</option><option value="ar">العربية</option></select>
        </label>
      </div>
      <div className="flex items-center justify-between gap-3"><Result state={state} /><Submit pending={pending}>{t("Save")}</Submit></div>
    </form>
  );
}

export function DeleteWorkspaceForm({ workspaceId, name }: { workspaceId: string; name: string }) {
  const { t, locale } = useT();
  const [state, action, pending] = useActionState(A.deleteWorkspace.bind(null, locale, workspaceId), null);
  return (
    <form action={action} className="grid gap-3">
      <p className="text-[15px] text-ink-2">{t("This permanently deletes the workspace, every lead in it and its whole history. It cannot be undone.")}</p>
      <label className={labelCls}>{t("Type the workspace name to confirm")} <span className="font-medium text-ink">{name}</span><input name="confirm" autoComplete="off" className={field} /></label>
      <div className="flex items-center justify-between gap-3"><Result state={state} /><Submit pending={pending} danger>{t("Delete workspace")}</Submit></div>
    </form>
  );
}

export function AcceptInviteButton({ token }: { token: string }) {
  const { t, locale } = useT();
  const { pending, res, run } = useRun();
  return (
    <div className="grid gap-3">
      <button disabled={pending} onClick={() => run(() => A.acceptInvite(locale, token))} className="btn btn-primary w-full disabled:opacity-60">{pending ? t("Joining…") : t("Join workspace")}</button>
      <Result state={res} />
    </div>
  );
}
