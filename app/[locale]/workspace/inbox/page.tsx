import Link from "next/link";
import { workspaceContext, getMembers, canManage } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { Card, PageHead, TempBadge, Monogram, Pill, cx } from "@/components/app/ui";
import { Thread, type Msg } from "@/components/workspace/Thread";
import { Composer, AiModeSwitch, MarkReadButton } from "@/components/workspace/growth";
import { Live } from "@/components/workspace/Live";
import { LANGUAGES } from "@/lib/growth/language";

export default async function Inbox({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ lead?: string; filter?: string; page?: string }> }) {
  const { locale } = await params;
  const { lead: selected, filter = "all", page: pageParam } = await searchParams;
  const t = makeT(locale);
  const { supabase, current, user } = await workspaceContext(locale);
  const wsId = current!.workspace.id;

  // Conversations by latest message, 50 at a time (leads.last_message_at is kept by a trigger).
  const page = Math.max(1, Number(pageParam) || 1), PER = 50;
  let q = supabase.from("leads").select("id, name, score, temp, ai_mode, language, assigned_to, opted_out, last_message_at", { count: "exact" })
    .eq("workspace_id", wsId).not("last_message_at", "is", null);
  if (filter === "mine") q = q.eq("assigned_to", user.id);
  if (filter === "human") q = q.eq("ai_mode", "human");
  if (filter === "waiting") q = q.eq("last_message_dir", "in");
  const { data: leadRows, count } = await q.order("last_message_at", { ascending: false }).range((page - 1) * PER, page * PER - 1);
  const ids = (leadRows ?? []).map((l) => l.id as string);
  const { data: recent } = ids.length ? await supabase.from("messages").select("lead_id, body, direction, author, created_at").in("lead_id", ids).order("created_at", { ascending: false }).limit(ids.length * 4) : { data: [] };
  const latest = new Map<string, { body: string; author: string; created_at: string; direction: string }>();
  for (const m of recent ?? []) if (!latest.has(m.lead_id as string)) latest.set(m.lead_id as string, m as never);
  let threads = (leadRows ?? []).filter((l) => latest.has(l.id as string)).map((l) => ({ ...l, last: latest.get(l.id as string)! }));
  const pages = Math.max(1, Math.ceil((count ?? 0) / PER));
  const active = threads.find((l) => l.id === selected) ?? (selected ? null : threads[0]);

  const [{ data: notes }, team, { data: settings }] = await Promise.all([
    supabase.from("notifications").select("id, kind, body, lead_id, created_at").eq("user_id", user.id).is("read_at", null).order("created_at", { ascending: false }).limit(5),
    getMembers(supabase, wsId),
    supabase.from("workspace_settings").select("assistant_name, sandbox_mode").eq("workspace_id", wsId).maybeSingle(),
  ]);
  const names = new Map(team.map((m) => [m.user_id, m.full_name || t("Teammate")]));

  let thread: Msg[] = [], lead: Record<string, any> | null = null; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (active) {
    const [{ data: msgs }, { data: l }] = await Promise.all([
      supabase.from("messages").select("id, channel, direction, author, author_id, subject, body, status, error, created_at, media").eq("lead_id", active.id).order("created_at").limit(300),
      supabase.from("leads").select("*").eq("id", active.id).maybeSingle(),
    ]);
    thread = (msgs ?? []) as Msg[];
    lead = l;
  }
  const editable = lead && (canManage(current!.role) || lead.assigned_to === user.id);
  const channels = lead ? ([lead.phone && lead.consent_whatsapp && "whatsapp", lead.email && lead.consent_email && "email"].filter(Boolean) as ("whatsapp" | "email")[]) : [];
  const lastIn = [...thread].reverse().find((m) => m.direction === "in");
  const href = (q: Record<string, string>) => `/${locale}/workspace/inbox?${new URLSearchParams({ filter, ...(page > 1 ? { page: String(page) } : {}), ...(active ? { lead: active.id as string } : {}), ...q })}`;
  const tabs = [["all", "All"], ["waiting", "Waiting on us"], ["human", "With an agent"], ["mine", "Mine"]];

  return (
    <>
      <Live workspaceId={wsId} userId={user.id} />
      <PageHead title={t("Inbox")} sub={settings?.sandbox_mode ? t("Sandbox mode: messages are written and logged, not sent.") : t("Every WhatsApp, email and call, with the AI and your team in one thread.")} />
      {!!notes?.length && (
        <Card className="mb-5">
          <div className="mb-2 flex items-center justify-between"><p className="text-[15px] font-semibold">{t("Needs you")}</p><MarkReadButton /></div>
          <ul className="grid gap-1.5">
            {notes.map((n) => (
              <li key={n.id} className="flex items-start gap-2 text-[14px]">
                <Pill tone={n.kind === "hot_lead" || n.kind === "handover" ? "hot" : "creek"}>{t(n.kind === "hot_lead" ? "Hot" : n.kind === "handover" ? "Hand-over" : n.kind === "booking" ? "Booking" : n.kind === "reply" ? "Reply" : "New")}</Pill>
                {n.lead_id ? <Link href={`/${locale}/workspace/inbox?lead=${n.lead_id}`} className="hover:underline" dir="auto">{n.body}</Link> : <span dir="auto">{n.body}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map(([v, l]) => <Link key={v} href={href({ filter: v, page: "1" })} className={cx("h-8 rounded-full px-3 text-[13px] leading-8", filter === v ? "bg-ink text-canvas" : "bg-canvas text-ink-2")}>{t(l)}</Link>)}
      </div>
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <Card pad={false} className="max-h-[70dvh] overflow-y-auto">
          <ul>
            {threads.map((l) => (
              <li key={l.id as string}>
                <Link href={href({ lead: l.id as string })} aria-current={active?.id === l.id ? "true" : undefined}
                  className={cx("flex gap-3 border-b border-hairline-soft px-4 py-3 last:border-0", active?.id === l.id ? "bg-creek-soft/60" : "hover:bg-parchment")}>
                  <Monogram name={l.name as string} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2"><span className="truncate text-[15px] font-medium">{l.name as string}</span>{l.last.direction === "in" && <span className="size-2 shrink-0 rounded-full bg-creek" aria-label={t("Waiting on us")} />}</span>
                    <span className="block truncate text-[13px] text-ink-2" dir="auto">{l.last.author === "ai" ? "AI: " : l.last.author === "agent" ? `${t("You")}: ` : ""}{l.last.body}</span>
                    <span className="t-fine mt-0.5 flex items-center gap-2 text-ink-3"><span className="tnum">{l.score as number}</span>{l.ai_mode === "ai" ? "AI" : l.ai_mode === "human" ? t("Agent") : t("Paused")}{l.language ? ` · ${LANGUAGES[l.language as keyof typeof LANGUAGES] ?? l.language}` : ""}</span>
                  </span>
                </Link>
              </li>
            ))}
            {pages > 1 && (
              <li className="flex items-center justify-between px-4 py-3 text-[13px]">
                {page > 1 ? <Link href={href({ page: String(page - 1) })} className="text-creek">{t("Newer")}</Link> : <span />}
                <span className="text-ink-3">{page} / {pages}</span>
                {page < pages ? <Link href={href({ page: String(page + 1) })} className="text-creek">{t("Older")}</Link> : <span />}
              </li>
            )}
            {!threads.length && <li className="px-4 py-10 text-center text-ink-2">{t("No conversations yet. Leads from your forms and ads appear here as soon as the AI replies.")}</li>}
          </ul>
        </Card>
        {lead ? (
          <Card className="flex min-h-[60dvh] flex-col">
            <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-hairline-soft pb-4">
              <Monogram name={lead.name} size={44} />
              <div className="min-w-0 flex-1">
                <Link href={`/${locale}/workspace/leads/${lead.id}`} className="text-[18px] font-semibold hover:underline">{lead.name}</Link>
                <p className="t-caption text-ink-2" dir="auto">{[lead.source, lead.language && LANGUAGES[lead.language as keyof typeof LANGUAGES], lead.assigned_to ? names.get(lead.assigned_to) : t("Unassigned")].filter(Boolean).join(" · ")}</p>
              </div>
              <span className="tnum text-[28px] font-semibold">{lead.score}</span><TempBadge temp={lead.temp} />
              <AiModeSwitch leadId={lead.id} mode={lead.ai_mode} disabled={!editable} />
            </div>
            {lead.handover_reason && lead.ai_mode !== "ai" && <p className="t-caption mb-3 rounded-[10px] bg-warm-soft px-3 py-2 text-warm" dir="auto">{t("Handed over")}: {lead.handover_reason}</p>}
            {lead.opted_out && <p className="t-caption mb-3 rounded-[10px] bg-hot-soft px-3 py-2 text-hot">{t("This person asked not to be contacted.")}</p>}
            <div className="flex-1 overflow-y-auto"><Thread messages={thread} names={names} t={t} locale={locale} assistant={settings?.assistant_name ?? "Noor"} /></div>
            {editable && !lead.opted_out && <div className="mt-4 border-t border-hairline-soft pt-4"><Composer leadId={lead.id} channels={channels} defaultChannel={lastIn?.channel === "email" ? "email" : channels[0] ?? "whatsapp"} /></div>}
          </Card>
        ) : (
          <Card><p className="py-16 text-center text-ink-2">{t("Pick a conversation.")}</p></Card>
        )}
      </div>
    </>
  );
}
