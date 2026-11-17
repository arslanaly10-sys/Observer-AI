"use client";
import { PageHead } from "@/components/app/ui";
import { useT } from "@/components/app/i18n";
import { Calculator } from "@/components/workspace/Calculator";

/** The demo uses the same broker calculator as workspaces, without sending. */
export function DemoCalculator() {
  const { t } = useT();
  return (
    <>
      <PageHead title={t("Broker calculator")} sub={t("Buying costs, mortgages, payment plans, yields, commission and the Golden Visa, the same maths the AI uses with clients. Send any result to a lead.")} />
      <Calculator leads={[]} demo />
    </>
  );
}
