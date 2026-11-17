import { redirect } from "next/navigation";
import { workspaceContext } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { OnboardingForm } from "@/components/workspace/forms";

export default async function Onboarding({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ new?: string }> }) {
  const { locale } = await params;
  const t = makeT(locale);
  const ctx = await workspaceContext(locale, { allowNone: true });
  if (ctx.memberships.length && !(await searchParams).new) redirect(`/${locale}/workspace`);
  return (
    <div className="mx-auto max-w-[560px] py-6">
      <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.024em]">{t(ctx.memberships.length ? "Create another workspace" : "Set up your workspace")}</h1>
      <p className="mt-2 text-[17px] text-ink-2">{t("A workspace is your brokerage or team. You’ll be its owner, and you can invite managers and agents next.")}</p>
      <div className="mt-8 rounded-[22px] bg-canvas p-6 sm:p-8"><OnboardingForm /></div>
    </div>
  );
}
