import { workspaceContext, canManage } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { fmtAED } from "@/lib/engine";
import { Card, CardHead, PageHead, Pill } from "@/components/app/ui";
import { ProjectForm, UnitForm, UnitEditForm, PlanForm, CsvImport, DeleteButton, type ProjectView } from "@/components/workspace/growth";

type Unit = { id: string; unit_type: string; beds: number | null; size_sqft: number | null; price_from: number | null; price_to: number | null; available: number | null };
type Plan = { id: string; name: string; summary: string | null; schedule: { milestone: string; percent: number }[]; post_handover: boolean };

export default async function Inventory({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = makeT(locale);
  const { supabase, current } = await workspaceContext(locale);
  const wsId = current!.workspace.id;
  const manager = canManage(current!.role);
  const { data } = await supabase.from("projects").select("*, units(*), payment_plans(*)").eq("workspace_id", wsId).order("updated_at", { ascending: false });
  const projects = (data ?? []) as (ProjectView & { units: Unit[]; payment_plans: Plan[] })[];
  const status: Record<string, string> = { off_plan: "Off-plan", ready: "Ready", sold_out: "Sold out" };
  const price = (u: Unit) => u.price_from ? (u.price_to && u.price_to !== u.price_from ? `${fmtAED(u.price_from)} – ${fmtAED(u.price_to)}` : fmtAED(u.price_from)) : "—";

  return (
    <>
      <PageHead title={t("Inventory")} sub={t("The AI only quotes what is here: projects, unit prices and payment plans. It never invents a price.")} />
      {manager && (
        <div className="mb-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <Card><CardHead title="Add a project" /><ProjectForm workspaceId={wsId} /></Card>
          <Card><CardHead title="Import from CSV" sub="One row per unit type. Projects are created as needed." /><CsvImport workspaceId={wsId} /></Card>
        </div>
      )}
      <div className="grid gap-5">
        {projects.map((p) => (
          <Card key={p.id}>
            <div className="mb-4 flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-[21px] font-semibold tracking-[-0.015em]">{p.name}</h2>
                <p className="t-caption text-ink-2">{[p.developer, p.area, p.city, p.handover && `${t("Handover")} ${p.handover}`].filter(Boolean).join(" · ")}</p>
              </div>
              <Pill tone={p.status === "ready" ? "ok" : p.status === "sold_out" ? "hot" : "creek"}>{t(status[p.status] ?? p.status)}</Pill>
              {p.brochure_path && <Pill tone="cold">{t("Brochure")}</Pill>}
              {manager && <DeleteButton kind="project" id={p.id} confirmText="Delete this project with its units and plans?" />}
            </div>
            {p.description && <p className="mb-4 text-[15px] text-ink-2" dir="auto">{p.description}</p>}
            {manager && (
              <details className="mb-5 rounded-[12px] border border-hairline-soft px-4 py-3">
                <summary className="cursor-pointer text-[14px] font-medium text-creek">{t("Edit project")}</summary>
                <div className="mt-4"><ProjectForm workspaceId={wsId} p={p} /></div>
              </details>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-[14px]">
                <thead><tr className="t-caption text-start text-ink-2">{["Unit", "Beds", "Sq ft", "Price", "Available", ""].map((h) => <th key={h} className="pb-2 text-start font-normal">{t(h)}</th>)}</tr></thead>
                <tbody>
                  {p.units.flatMap((u) => [
                    <tr key={u.id} className="border-t border-hairline-soft">
                      <td className="py-2">{u.unit_type}</td><td className="tnum">{u.beds ?? "—"}</td><td className="tnum">{u.size_sqft?.toLocaleString("en-US") ?? "—"}</td>
                      <td className="tnum" dir="ltr">{price(u)}</td><td className="tnum">{u.available ?? "—"}</td>
                      <td className="text-end">{manager && <DeleteButton kind="unit" id={u.id} confirmText="Delete this unit type?" />}</td>
                    </tr>,
                    manager && (
                      <tr key={`${u.id}-edit`}><td colSpan={6} className="pb-1"><details><summary className="t-caption cursor-pointer text-creek">{t("Edit")}</summary><UnitEditForm u={u} /></details></td></tr>
                    ),
                  ])}
                  {!p.units.length && <tr><td colSpan={6} className="py-3 text-ink-2">{t("No units yet.")}</td></tr>}
                </tbody>
              </table>
            </div>
            {manager && <div className="mt-3"><UnitForm workspaceId={wsId} projectId={p.id} /></div>}
            <div className="mt-6 grid gap-3">
              <p className="text-[15px] font-semibold">{t("Payment plans")}</p>
              {p.payment_plans.map((pl) => (
                <div key={pl.id} className="relative rounded-[12px] bg-parchment px-4 py-3 pe-12">
                  {manager && <div className="absolute end-2 top-2"><DeleteButton kind="plan" id={pl.id} confirmText="Delete this payment plan?" /></div>}
                  <p className="text-[15px] font-medium">{pl.name}{pl.post_handover ? ` · ${t("Post-handover")}` : ""}</p>
                  {pl.summary && <p className="t-caption text-ink-2">{pl.summary}</p>}
                  {!!pl.schedule.length && <p className="t-caption mt-1 text-ink-2">{pl.schedule.map((s) => `${s.milestone} ${s.percent}%`).join(" · ")}</p>}
                </div>
              ))}
              {manager && <PlanForm workspaceId={wsId} projectId={p.id} />}
            </div>
          </Card>
        ))}
        {!projects.length && <Card><p className="py-10 text-center text-ink-2">{t("No projects yet. Add one, or import a CSV, so the AI can answer price and payment-plan questions.")}</p></Card>}
      </div>
    </>
  );
}
