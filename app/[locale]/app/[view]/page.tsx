import { notFound } from "next/navigation";
import { viewIds, type ViewId } from "@/lib/views";
import { locales } from "@/lib/i18n";
import { View } from "@/components/app/views";

export function generateStaticParams() {
  return locales.flatMap((locale) => viewIds.map((view) => ({ locale, view })));
}

export default async function ViewPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!viewIds.includes(view as ViewId)) notFound();
  return <View id={view as ViewId} />;
}
