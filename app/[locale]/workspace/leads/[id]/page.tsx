import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { workspaceContext, getMembers, STAGE_LABEL, canManage, type LeadRow } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { scoreLead, fmtAED } from "@/lib/engine";
import { Card, CardHead, Monogram, TempBadge, Meter } from "@/components/app/ui";
import { Thread, type Msg } from "@/components/workspace/Thread";
import { Composer, AiModeSwitch } from "@/components/workspace/growth";
import { LANGUAGES } from "@/lib/growth/language";
import { EditLeadForm, StageSelect, AssignSelect, NoteForm, DeleteLeadButton } from "@/components/workspace/forms";

export default async function LeadPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const t = makeT(locale);
  const { supabase, current, user } = await workspaceContext(locale);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase.from("leads").select("*").eq("id", id).eq("workspace_id", current!.workspace.id).maybeSingle();
  if (!data) notFound();
  const l = data as LeadRow;
  const [{ data: acts }, team, { data: msgs }, { data: appts }, { data: settings }] = await Promise.all([
    supabase.from("activities").select("id, kind, body, created_at, actor_id").eq("lead_id", id).order("created_at", { ascending: false }).limit(50),
    getMembers(supabase, l.workspace_id),
    supabase.from("messages").select("id, channel, direction, author, author_id, subject, body, status, error, created_at, media").eq("lead_id", id).order("created_at").limit(200),
    supabase.from("appointments").select("id, kind, starts_at, status, created_by_ai").eq("lead_id", id).order("starts_at", { ascending: false }).limit(10),
    supabase.from("workspace_settings").select("assistant_name, timezone").eq("workspace_id", l.workspace_id).maybeSingle(),
  ]);
  const g = data as LeadRow & { language: string | null; intent: string | null; score_reason: string | null; ai_mode: "ai" | "human" | "paused"; handover_reason: string | null; channel: string; campaign: string | null; consent_whatsapp: boolean; consent_email: boolean; opted_out: boolean };
  const channels = [l.phone && g.consent_whatsapp && "whatsapp", l.email && g.consent_email && "email"].filter(Boolean) as ("whatsapp" | "email")[];
  const manager = canManage(current!.role);
  const editable = manager || l.assigned_to === user.id;
  const name = new Map(team.map((m) => [m.user_id, m.full_name || t("Teammate")]));
  const b = l.budget_aed ?? 0;
  const s = scoreLead({ financing: l.financing ?? "Unknown", budget: b >= 1e6 ? `AED ${b / 1e6}M` : `AED ${Math.round(b / 1e3)}K`, timeframe: l.timeframe ?? "", source: l.source, urgency: l.serious ? "serious" : "researching", temp: l.serious ? "warm" : "cold", area: l.area ?? "" });
  const kindLabel: Record<string, string> = { created: "Added", stage: "Stage changed", assigned: "Reassigned", note: "Note", call: "Call", message: "Message" };

  return (
    <>
      <Link href={`/${locale}/workspace/leads`} className="t-caption mb-4 inline-flex items-center gap-1.5 text-ink-2 hover:text-ink"><ArrowLeft size={14} className="rtl:-scale-x-100" />{t("All leads")}</Link>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Monogram name={l.name} size={56} />
        <div className="min-w-0 flex-1">
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.022em]">{l.name}</h1>
          <p className="text-ink-2" dir="auto">{[l.phone, l.email, t(l.source)].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="flex items-end gap-3">
          <span className="tnum text-[52px] font-semibold leading-none tracking-[-0.03em]">{l.score}</span>
          <div className="pb-1"><TempBadge temp={l.temp} /></div>
        </div>
      </div>
      {!editable && <p className="t-caption mb-5 rounded-[12px] bg-warm-soft px-4 py-3 text-warm">{t("This lead is in the unassigned pool. Assign it to yourself to edit it.")}</p>}
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-5">
          <Card>
            <CardHead title="Details" />
            <EditLeadForm leadId={l.id} disabled={!editable} d={l} />
          </Card>
          <Card>
            <CardHead title="Conversation" aside={<AiModeSwitch leadId={l.id} mode={g.ai_mode} disabled={!editable} />} />
            {g.handover_reason && g.ai_mode !== "ai" && <p className="t-caption mb-3 rounded-[10px] bg-warm-soft px-3 py-2 text-warm" dir="auto">{t("Handed over")}: {g.handover_reason}</p>}
            <div className="max-h-[520px] overflow-y-auto"><Thread messages={(msgs ?? []) as Msg[]} names={name} t={t} locale={locale} assistant={settings?.assistant_name ?? "Noor"} /></div>
            {editable && !g.opted_out && <div className="mt-4 border-t border-hairline-soft pt-4"><Composer leadId={l.id} channels={channels} defaultChannel={channels[0] ?? "whatsapp"} /></div>}
          </Card>
          <Card>
            <CardHead title="Timeline" />
            {editable && <div className="mb-6"><NoteForm leadId={l.id} workspaceId={l.workspace_id} /></div>}
            <ol className="space-y-4 border-s border-hairline ps-5">
              {(acts ?? []).map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -start-[25px] top-1.5 size-2.5 rounded-full bg-creek" aria-hidden />
                  <p className="text-[15px]"><b className="font-medium">{t(kindLabel[a.kind] ?? a.kind)}</b>{a.kind === "stage" && a.body ? `: ${t(STAGE_LABEL[a.body as keyof typeof STAGE_LABEL] ?? a.body)}` : a.kind === "assigned" ? `: ${a.body === "unassigned" ? t("Unassigned") : name.get(a.body ?? "") ?? t("Teammate")}` : ""}</p>
                  {a.body && !["stage", "assigned"].includes(a.kind) && <p className="mt-0.5 whitespace-pre-line text-[15px] text-ink-2" dir="auto">{a.body}</p>}
                  <p className="t-caption mt-0.5 text-ink-3">{a.actor_id ? name.get(a.actor_id) ?? t("Teammate") : t("Observer")} · {new Date(a.created_at).toLocaleString(locale === "ar" ? "ar-AE" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                </li>
              ))}
              {!acts?.length && <li className="text-ink-2">{t("Nothing yet.")}</li>}
            </ol>
          </Card>
        </div>
        <div className="grid content-start gap-5">
          <Card>
            <CardHead title="Stage" />
            <StageSelect leadId={l.id} stage={l.stage} labels={STAGE_LABEL} disabled={!editable} />
            <div className="mt-5"><CardHead title="Assigned to" /></div>
            <AssignSelect leadId={l.id} value={l.assigned_to} meId={user.id} canAssign={manager} members={team.map((m) => ({ id: m.user_id, name: m.full_name || t("Teammate") }))} />
          </Card>
          <Card>
            <CardHead title="What the AI knows" />
            <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 text-[14px]">
              <dt className="text-ink-2">{t("Intent")}</dt><dd>{t(g.intent ? g.intent[0].toUpperCase() + g.intent.slice(1) : "Unknown")}</dd>
              <dt className="text-ink-2">{t("Language")}</dt><dd>{g.language ? LANGUAGES[g.language as keyof typeof LANGUAGES] ?? g.language : t("Unknown")}</dd>
              <dt className="text-ink-2">{t("Came from")}</dt><dd>{[t(l.source), g.campaign].filter(Boolean).join(" · ")}</dd>
              <dt className="text-ink-2">{t("Contact by")}</dt><dd>{g.opted_out ? t("Opted out") : channels.map((c) => t(c === "whatsapp" ? "WhatsApp" : "Email")).join(", ") || t("None")}</dd>
            </dl>
            {g.score_reason && <p className="mt-3 rounded-[10px] bg-parchment px-3 py-2 text-[14px]" dir="auto">{g.score_reason}</p>}
            {!!appts?.length && (
              <ul className="mt-4 grid gap-1.5 text-[14px]">
                {appts.map((a) => <li key={a.id}>{t(a.kind === "call" ? "Call" : a.kind === "meeting" ? "Meeting" : "Viewing")} · <span dir="ltr">{new Date(a.starts_at).toLocaleString("en-GB", { timeZone: settings?.timezone ?? "Asia/Dubai", dateStyle: "medium", timeStyle: "short" })}</span>{a.created_by_ai ? ` · ${t("Booked by AI")}` : ""}{a.status !== "booked" ? ` · ${a.status}` : ""}</li>)}
              </ul>
            )}
          </Card>
          <Card>
            <CardHead title="Why this score" />
            <ul className="space-y-2.5">
              {s.parts.map((p) => (
                <li key={p.label} className="grid grid-cols-[120px_1fr_40px] items-center gap-3 text-[14px]">
                  <span className="text-ink-2">{t(p.label)}</span><Meter value={(p.pts / p.max) * 100} /><span className="tnum text-end">+{p.pts}</span>
                </li>
              ))}
            </ul>
            {l.budget_aed ? <p className="t-caption mt-4 text-ink-2">{t("Budget")}: <b className="text-ink">{fmtAED(l.budget_aed)}</b></p> : null}
          </Card>
          {manager && <div className="flex justify-end"><DeleteLeadButton leadId={l.id} /></div>}
        </div>
      </div>
    </>
  );
}
