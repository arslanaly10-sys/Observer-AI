import Link from "next/link";
import { workspaceContext, getMembers, canManage } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { Card, PageHead, Pill } from "@/components/app/ui";
import { AppointmentActions, BookingForm } from "@/components/workspace/growth";
import { Card as Box, CardHead } from "@/components/app/ui";

export default async function Calendar({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = makeT(locale);
  const { supabase, current, user } = await workspaceContext(locale);
  const wsId = current!.workspace.id;
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const [{ data }, team, { data: s }, { data: leadOpts }] = await Promise.all([
    supabase.from("appointments").select("id, kind, starts_at, ends_at, status, notes, created_by_ai, agent_id, lead_id, leads(name), projects(name)").eq("workspace_id", wsId).gte("starts_at", since).order("starts_at").limit(200),
    getMembers(supabase, wsId),
    supabase.from("workspace_settings").select("timezone").eq("workspace_id", wsId).maybeSingle(),
    supabase.from("leads").select("id, name").eq("workspace_id", wsId).not("stage", "in", "(won,lost)").order("updated_at", { ascending: false }).limit(200),
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
      {(() => {
        // The next seven days at a glance; each day links to its list below.
        const strip = Array.from({ length: 7 }, (_, i) => dayKey(new Date(Date.now() + i * 864e5).toISOString()));
        return (
          <nav aria-label={t("This week")} className="mb-5 grid grid-cols-7 gap-1.5">
            {strip.map((d) => {
              const n = (groups.get(d) ?? []).filter((a) => a.status === "booked").length;
              return (
                <a key={d} href={n ? `#d-${d}` : undefined} className={`rounded-[12px] px-2 py-2.5 text-center ${n ? "bg-canvas hover:bg-creek-soft" : "bg-canvas/50 text-ink-3"}`}>
                  <span className="t-fine block">{new Date(`${d}T12:00:00Z`).toLocaleDateString(loc, { weekday: "short" })}</span>
                  <span className="tnum block text-[19px] font-semibold">{new Date(`${d}T12:00:00Z`).getUTCDate()}</span>
                  <span className={`t-fine block ${n ? "text-creek" : ""}`}>{n || "—"}</span>
                </a>
              );
            })}
          </nav>
        );
      })()}
      <Box className="mb-5">
        <CardHead title="Book a viewing or call" />
        <BookingForm workspaceId={wsId} leads={(leadOpts ?? []) as { id: string; name: string }[]} agents={team.map((m) => ({ id: m.user_id, name: m.full_name || t("Teammate") }))} meId={user.id} canPickAgent={canManage(current!.role)} />
      </Box>
      <div className="grid gap-5">
        {[...groups.entries()].map(([day, list]) => (
          <Card key={day} className="scroll-mt-24"><span id={`d-${day}`} />
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
