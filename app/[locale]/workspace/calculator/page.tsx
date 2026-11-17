import { workspaceContext } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { PageHead } from "@/components/app/ui";
import { Calculator } from "@/components/workspace/Calculator";

export default async function CalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = makeT(locale);
  const { supabase, current } = await workspaceContext(locale);
  const { data } = await supabase.from("leads").select("id, name").eq("workspace_id", current!.workspace.id).not("stage", "in", "(won,lost)").order("updated_at", { ascending: false }).limit(200);
  return (
    <>
      <PageHead title={t("Broker calculator")} sub={t("Buying costs, mortgages, payment plans, yields, commission and the Golden Visa, the same maths the AI uses with clients. Send any result to a lead.")} />
      <Calculator leads={(data ?? []) as { id: string; name: string }[]} />
    </>
  );
}
