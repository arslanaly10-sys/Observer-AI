import Link from "next/link";
import { workspaceContext, getMembers, STAGE_LABEL, STAGE_PROB, canManage, type LeadRow, type Stage } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { fmtAED } from "@/lib/engine";
import { Card, CardHead, Stat, Stats, Monogram, ScoreBar, TempBadge, Bars } from "@/components/app/ui";
import { AddLeadButton } from "@/components/workspace/forms";

export default async function Overview({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = makeT(locale);
  const { supabase, current, user, profile } = await workspaceContext(locale);
  const wsId = current!.workspace.id;
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const [{ data: leadsData }, { data: acts }, team, ai, aiBooked, handed] = await Promise.all([
    supabase.from("leads").select("*").eq("workspace_id", wsId).order("score", { ascending: false }).limit(500),
    supabase.from("activities").select("id, kind, body, created_at, lead:leads(id, name)").eq("workspace_id", wsId).order("created_at", { ascending: false }).limit(8),
    getMembers(supabase, wsId),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("workspace_id", wsId).eq("author", "ai").gte("created_at", since),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("workspace_id", wsId).eq("created_by_ai", true).gte("created_at", since),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("workspace_id", wsId).eq("ai_mode", "human").not("handover_reason", "is", null).gte("updated_at", since),
  ]);
  const leads = (leadsData ?? []) as LeadRow[];
  const open = leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
  const weighted = open.reduce((a, l) => a + (l.budget_aed ?? 0) * STAGE_PROB[l.stage as Stage] / 100, 0);
  const won = leads.filter((l) => l.stage === "won");
  const hot = open.filter((l) => l.temp === "hot").slice(0, 6);
  const week = Date.now() - 7 * 864e5;
  const days = Array.from({ length: 14 }, (_, i) => {
    const d0 = new Date(); d0.setHours(0, 0, 0, 0); d0.setDate(d0.getDate() - (13 - i));
    const d1 = d0.getTime() + 864e5;
    return leads.filter((l) => { const c = new Date(l.created_at).getTime(); return c >= d0.getTime() && c < d1; }).length;
  });
  const members = team.map((m) => ({ id: m.user_id, name: m.full_name || t("Teammate") }));
  const first = (profile?.full_name ?? "").split(" ")[0];
  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-ink-2">{current!.workspace.name}</p>
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.022em] sm:text-[34px]">{first ? `${t("Welcome back")}, ${first}` : t("Welcome back")}</h1>
        </div>
        <AddLeadButton workspaceId={wsId} members={members.filter((m) => m.id !== user.id)} canAssign={canManage(current!.role)} />
      </div>
      <Stats>
        <Stat label="Open leads" value={open.length} note={`${leads.filter((l) => new Date(l.created_at).getTime() > week).length} ${t("added this week")}`} />
        <Stat label="Hot leads" value={open.filter((l) => l.temp === "hot").length} />
        <Stat label="Weighted pipeline" value={fmtAED(weighted)} />
        <Stat label="Won" value={won.length} note={won.length ? fmtAED(won.reduce((a, l) => a + (l.budget_aed ?? 0), 0)) : undefined} />
      </Stats>
      <Card className="mb-5">
        <CardHead title="Observer this week" aside={<Link className="t-caption text-creek hover:underline" href={`/${locale}/workspace/inbox`}>{t("Open the inbox")}</Link>} />
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[[ai.count ?? 0, "AI messages sent"], [aiBooked.count ?? 0, "Viewings and calls booked by AI"], [handed.count ?? 0, "Leads handed to your team"]].map(([n, l]) => (
            <div key={l as string}><dd className="tnum text-[28px] font-semibold leading-none">{n}</dd><dt className="t-caption mt-1.5 text-ink-2">{t(l as string)}</dt></div>
          ))}
        </dl>
      </Card>
      {!leads.length ? (
        <Card className="py-14 text-center">
          <h2 className="text-[21px] font-semibold">{t("No leads yet")}</h2>
          <p className="mx-auto mt-2 max-w-[44ch] text-ink-2">{t("Add your first lead and Observer will score it straight away. Hot leads will appear here.")}</p>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHead title="Hot leads to call now" aside={<Link className="t-caption text-creek hover:underline" href={`/${locale}/workspace/leads`}>{t("See all leads")}</Link>} />
            {hot.length ? (
              <ul className="divide-y divide-hairline-soft">
                {hot.map((l) => (
                  <li key={l.id}>
                    <Link href={`/${locale}/workspace/leads/${l.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                      <Monogram name={l.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{l.name}</p>
                        <p className="t-caption truncate text-ink-2">{[t(STAGE_LABEL[l.stage]), l.area, l.budget_aed ? fmtAED(l.budget_aed) : null].filter(Boolean).join(" · ")}</p>
                      </div>
                      <ScoreBar score={l.score} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="py-6 text-center text-ink-2">{t("No hot leads right now.")}</p>}
          </Card>
          <Card>
            <CardHead title="Recent activity" />
            <ol className="space-y-3.5">
              {((acts ?? []) as unknown as { id: number; kind: string; body: string | null; created_at: string; lead: { id: string; name: string } | null }[]).map((a) => (
                <li key={a.id} className="text-[15px]">
                  <Link href={`/${locale}/workspace/leads/${a.lead?.id}`} className="font-medium hover:underline">{a.lead?.name}</Link>{" "}
                  <span className="text-ink-2">{t(a.kind === "created" ? "added" : a.kind === "stage" ? "moved to" : a.kind === "assigned" ? "reassigned" : a.kind === "call" ? "call logged" : a.kind === "message" ? "message logged" : "note added")}{a.kind === "stage" && a.body ? ` ${t(STAGE_LABEL[a.body as Stage] ?? a.body)}` : ""}</span>
                  <span className="t-caption block text-ink-3">{new Date(a.created_at).toLocaleString(locale === "ar" ? "ar-AE" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
                </li>
              ))}
              {!acts?.length && <li className="text-ink-2">{t("Activity will appear here as your team works.")}</li>}
            </ol>
          </Card>
          <Card className="xl:col-span-2">
            <CardHead title="New leads, last 14 days" />
            <Bars data={days.map((d) => d || 0.0001)} height={120} labels={[t("2 weeks ago"), t("Today")]} />
          </Card>
        </div>
      )}
    </>
  );
}
