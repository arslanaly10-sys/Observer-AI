import {
  SquaresFour, Kanban, UsersThree, Target, ChatTeardropText, Lightning, Headset, WhatsappLogo,
  PaperPlaneTilt, InstagramLogo, Funnel, ChartPieSlice, Trophy, Buildings, Calculator, Timer,
  ShieldCheck, Bell, type Icon,
} from "@phosphor-icons/react";

import type { ViewId } from "@/lib/views";
export type { ViewId };

export const navGroups: { label: string; items: { id: ViewId; label: string; icon: Icon; badge?: string }[] }[] = [
  { label: "Core", items: [
    { id: "dashboard", label: "Dashboard", icon: SquaresFour },
    { id: "pipeline", label: "Pipeline", icon: Kanban, badge: "5" },
    { id: "leads", label: "All leads", icon: UsersThree },
  ] },
  { label: "Intelligence", items: [
    { id: "scoring", label: "Lead scoring", icon: Target },
    { id: "intent", label: "Intent detection", icon: ChatTeardropText },
    { id: "next-best-action", label: "Next best action", icon: Lightning },
    { id: "live-call", label: "Live call assistant", icon: Headset },
  ] },
  { label: "Channels", items: [
    { id: "whatsapp", label: "WhatsApp", icon: WhatsappLogo, badge: "14" },
    { id: "sequences", label: "Sequences", icon: PaperPlaneTilt },
    { id: "social", label: "Facebook & Instagram", icon: InstagramLogo },
  ] },
  { label: "Analytics", items: [
    { id: "funnel", label: "Conversion funnel", icon: Funnel },
    { id: "channel-roi", label: "Channel ROI", icon: ChartPieSlice },
    { id: "agents", label: "Agent performance", icon: Trophy },
  ] },
  { label: "UAE market", items: [
    { id: "gcc-developers", label: "GCC developers", icon: Buildings },
    { id: "payment-plans", label: "Broker calculator", icon: Calculator },
  ] },
  { label: "Enterprise", items: [
    { id: "sla", label: "SLA tracking", icon: Timer, badge: "2" },
    { id: "compliance", label: "Compliance", icon: ShieldCheck },
    { id: "notifications", label: "Notifications", icon: Bell, badge: "4" },
  ] },
];

export const viewLabel = Object.fromEntries(navGroups.flatMap((g) => g.items.map((i) => [i.id, i.label]))) as Record<ViewId, string>;
