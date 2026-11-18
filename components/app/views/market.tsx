"use client";
import { PageHead } from "@/components/app/ui";
import { useT } from "@/components/app/i18n";
import { MarketTables } from "@/components/market/MarketTables";
import { AS_OF } from "@/lib/market/uae";

/** The demo shows the same sourced market data as workspaces. */
export function DemoMarket() {
  const { t } = useT();
  return (
    <>
      <PageHead title={t("UAE market")} sub={`${t("The market data the AI uses with clients. Indicative ranges from public sources, checked")} ${AS_OF}. ${t("Quote them as ranges, not prices.")}`} />
      <MarketTables />
    </>
  );
}
