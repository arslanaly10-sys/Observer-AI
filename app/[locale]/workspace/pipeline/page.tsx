import { workspaceContext, STAGES, STAGE_LABEL, STAGE_PROB, canManage, type LeadRow } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { fmtAED } from "@/lib/engine";
import { PageHead, Stat, Stats } from "@/components/app/ui";
import { PipelineBoard } from "@/components/workspace/PipelineBoard";

export default async function Pipeline({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = makeT(locale);
  const { supabase, current, user } = await workspaceContext(locale);
  const { data } = await supabase.from("leads").select("id, name, budget_aed, temp, stage, area, assigned_to").eq("workspace_id", current!.workspace.id).limit(1000);
  const leads = (data ?? []) as Pick<LeadRow, "id" | "name" | "budget_aed" | "temp" | "stage" | "area" | "assigned_to">[];
  const manager = canManage(current!.role);
  const open = leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
  const weighted = open.reduce((a, l) => a + (l.budget_aed ?? 0) * STAGE_PROB[l.stage] / 100, 0);
  const best = open.reduce((a, l) => a + (l.budget_aed ?? 0), 0);
  const commit = open.filter((l) => l.stage === "offer").reduce((a, l) => a + (l.budget_aed ?? 0), 0);
  return (
    <>
      <PageHead title={t("Pipeline")} sub={t("Drag a card to change its stage, or use its arrow.")} />
      <Stats>
        <Stat label="Weighted pipeline" value={fmtAED(weighted)} />
        <Stat label="Best case" value={fmtAED(best)} />
        <Stat label="At offer stage" value={fmtAED(commit)} />
        <Stat label="Open deals" value={open.length} />
      </Stats>
      <PipelineBoard
        stages={STAGES} labels={STAGE_LABEL} probs={STAGE_PROB}
        cards={leads.map((l) => ({ id: l.id, name: l.name, budget_aed: l.budget_aed, temp: l.temp, stage: l.stage, area: l.area, editable: manager || l.assigned_to === user.id }))}
      />
    </>
  );
}
