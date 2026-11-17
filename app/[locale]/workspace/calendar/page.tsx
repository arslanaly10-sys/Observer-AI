import Link from "next/link";
import { workspaceContext, getMembers } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { Card, PageHead, Pill } from "@/components/app/ui";
import { AppointmentActions } from "@/components/workspace/growth";

export default async function Calendar({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = makeT(locale);
  const { supabase, current } = await workspaceContext(locale);
  const wsId = current!.workspace.id;
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const [{ data }, team, { data: s }] = await Promise.all([
    supabase.from("appointments").select("id, kind, starts_at, ends_at, status, notes, created_by_ai, agent_id, lead_id, leads(name), projects(name)").eq("workspace_id", wsId).gte("starts_at", since).order("starts_at").limit(200),
    getMembers(supabase, wsId),
    supabase.from("workspace_settings").select("timezone").eq("workspace_id", wsId).maybeSingle(),
  ]);
  const tz = s?.timezone ?? "Asia/Dubai";
  const names = new Map(team.map((m) => [m.user_id, m.full_name || t("Teammate")]));
  const loc = locale === "ar" ? "ar-AE" : "en-GB";
  const dayKey = (d: string) => new Date(d).toLocaleDateString("en-CA", { timeZone: tz });
  const groups = new Map<string, typeof data>();
  for (const a of data ?? []) groups.set(dayKey(a.starts_at as string), [...(groups.get(dayKey(a.starts_at as string)) ?? []), a]);
  const kind: Record<string, string> = { viewing: "Viewing", call: "Call", meeting: "Meeting" };

  return (
    <>
      <PageHead title={t("Calendar")} sub={`${t("Viewings and calls, including the ones the AI books. Times shown in")} ${tz}.`} />
      <div className="grid gap-5">
        {[...groups.entries()].map(([day, list]) => (
          <Card key={day}>
            <h2 className="mb-3 text-[17px] font-semibold">{new Date(`${day}T12:00:00Z`).toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long" })}</h2>
            <ul className="divide-y divide-hairline-soft">
              {(list ?? []).map((a) => (
                <li key={a.id as string} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="tnum w-[110px] text-[15px] font-medium" dir="ltr">{new Date(a.starts_at as string).toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" })}–{new Date(a.ends_at as string).toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" })}</span>
                  <Pill tone={a.kind === "viewing" ? "creek" : "cold"}>{t(kind[a.kind as string] ?? (a.kind as string))}</Pill>
                  <span className="min-w-0 flex-1 text-[15px]">
                    <Link href={`/${locale}/workspace/leads/${a.lead_id}`} className="font-medium hover:underline">{(a.leads as unknown as { name: string } | null)?.name ?? t("Lead")}</Link>
                    {(a.projects as unknown as { name: string } | null)?.name && <span className="text-ink-2"> · {(a.projects as unknown as { name: string }).name}</span>}
                    <span className="t-caption block text-ink-2">{a.agent_id ? names.get(a.agent_id as string) : t("Unassigned")}{a.created_by_ai ? ` · ${t("Booked by AI")}` : ""}{a.notes ? ` · ${a.notes}` : ""}</span>
                  </span>
                  <AppointmentActions id={a.id as string} status={a.status as string} />
                </li>
              ))}
            </ul>
          </Card>
        ))}
        {!groups.size && <Card><p className="py-10 text-center text-ink-2">{t("Nothing booked yet. When a lead agrees to a viewing or call, it lands here and in the agent’s alerts.")}</p></Card>}
      </div>
    </>
  );
}
