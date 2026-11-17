import Link from "next/link";
import { workspaceContext, getMembers, STAGE_LABEL, canManage, type LeadRow } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { fmtAED } from "@/lib/engine";
import { Card, PageHead, Monogram, ScoreBar, TempBadge, Table, cx } from "@/components/app/ui";
import { AddLeadButton } from "@/components/workspace/forms";

const FILTERS = ["all", "hot", "warm", "cold", "mine", "unassigned"] as const;

export default async function Leads({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string; f?: string; page?: string }> }) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = makeT(locale);
  const { supabase, current, user } = await workspaceContext(locale);
  const wsId = current!.workspace.id;
  const f = (FILTERS as readonly string[]).includes(sp.f ?? "") ? sp.f! : "all";
  const q = (sp.q ?? "").trim().slice(0, 80);

  const PER = 100, page = Math.max(1, Number(sp.page) || 1);
  let query = supabase.from("leads").select("*", { count: "exact" }).eq("workspace_id", wsId).order("score", { ascending: false }).order("created_at", { ascending: false }).range((page - 1) * PER, page * PER - 1);
  if (f === "hot" || f === "warm" || f === "cold") query = query.eq("temp", f);
  if (f === "mine") query = query.eq("assigned_to", user.id);
  if (f === "unassigned") query = query.is("assigned_to", null);
  if (q) {
    const safe = q.replace(/[%_,().*\\]/g, " ");
    query = query.or(`name.ilike.%${safe}%,area.ilike.%${safe}%,source.ilike.%${safe}%,phone.ilike.%${safe}%`);
  }
  const [{ data, count }, team] = await Promise.all([query, getMembers(supabase, wsId)]);
  const leads = (data ?? []) as LeadRow[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PER));
  const pageHref = (n: number) => `?${new URLSearchParams({ ...(q ? { q } : {}), ...(f !== "all" ? { f } : {}), ...(n > 1 ? { page: String(n) } : {}) })}`;
  const name = new Map(team.map((m) => [m.user_id, m.full_name || t("Teammate")]));
  const members = team.filter((m) => m.user_id !== user.id).map((m) => ({ id: m.user_id, name: m.full_name || t("Teammate") }));
  const href = (nf: string) => `?${new URLSearchParams({ ...(q ? { q } : {}), ...(nf !== "all" ? { f: nf } : {}) })}`;
  const label: Record<string, string> = { all: "All", hot: "Hot", warm: "Warm", cold: "Cold", mine: "Mine", unassigned: "Unassigned" };

  return (
    <>
      <PageHead title={t("Leads")} sub={t(canManage(current!.role) ? "Every lead in the workspace, highest score first." : "Your leads and the unassigned pool, highest score first.")}
        actions={<AddLeadButton workspaceId={wsId} members={members} canAssign={canManage(current!.role)} />} />
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <nav aria-label={t("Filter leads")} className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1">
            {FILTERS.map((x) => (
              <Link key={x} href={href(x)} aria-current={f === x ? "page" : undefined}
                className={cx("flex h-8 shrink-0 items-center rounded-full px-3.5 text-[13px] font-medium", f === x ? "bg-ink text-canvas" : "text-ink-2 hover:bg-parchment hover:text-ink")}>{t(label[x])}</Link>
            ))}
          </nav>
          <form className="w-full sm:w-72" role="search">
            {f !== "all" && <input type="hidden" name="f" value={f} />}
            <label className="sr-only" htmlFor="lq">{t("Search leads")}</label>
            <input id="lq" name="q" defaultValue={q} placeholder={t("Name, area, source or phone")} className="h-10 w-full rounded-full border border-hairline-soft bg-pearl px-4 text-[14px] outline-none focus:border-creek" />
          </form>
        </div>
        {leads.length ? (
          <Table head={["Lead", "Score", "Temperature", "Stage", "Budget", "Source", "Assigned to"]} minWidth={820}>
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-pearl">
                <td>
                  <Link href={`/${locale}/workspace/leads/${l.id}`} className="flex items-center gap-3">
                    <Monogram name={l.name} size={32} />
                    <span><span className="block font-medium">{l.name}</span><span className="t-caption text-ink-2">{t(l.type === "seller" ? "Seller" : "Buyer")}{l.area ? ` · ${l.area}` : ""}</span></span>
                  </Link>
                </td>
                <td><ScoreBar score={l.score} /></td>
                <td><TempBadge temp={l.temp} /></td>
                <td>{t(STAGE_LABEL[l.stage])}</td>
                <td className="tnum">{l.budget_aed ? fmtAED(l.budget_aed) : "—"}</td>
                <td className="text-ink-2">{t(l.source)}</td>
                <td className={cx(!l.assigned_to && "text-ink-3")}>{l.assigned_to ? (l.assigned_to === user.id ? t("Me") : name.get(l.assigned_to) ?? t("Teammate")) : t("Unassigned")}</td>
              </tr>
            ))}
          </Table>
        ) : null}
        {leads.length > 0 && pages > 1 && (
          <nav aria-label={t("Pages")} className="mt-4 flex items-center justify-between text-[14px]">
            {page > 1 ? <Link href={pageHref(page - 1)} className="text-creek">{t("Previous")}</Link> : <span />}
            <span className="text-ink-3">{t("Page")} {page} / {pages} · {count} {t("leads")}</span>
            {page < pages ? <Link href={pageHref(page + 1)} className="text-creek">{t("Next")}</Link> : <span />}
          </nav>
        )}
        {leads.length ? null : (
          <p className="py-12 text-center text-ink-2">{q || f !== "all" ? t("No leads match. Clear the search or pick another filter.") : t("No leads yet. Add your first one and Observer will score it.")}</p>
        )}
      </Card>
    </>
  );
}
