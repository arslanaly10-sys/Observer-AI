import {
  SquaresFour, Kanban, UsersThree, Target, ChatTeardropText, Lightning, Headset, WhatsappLogo,
  PaperPlaneTilt, InstagramLogo, Funnel, ChartPieSlice, Trophy, Buildings, Calculator, Timer,
  ShieldCheck, Bell, Crown, AddressBook, Handshake, CheckSquare, BuildingApartment, RocketLaunch,
  Sparkle, FlowArrow, Microphone, UsersFour, Storefront, type Icon,
} from "@phosphor-icons/react";
import type { ViewId } from "@/lib/views";
import type { RoleId } from "@/lib/demo/group";
export type { ViewId };

type Item = { id: ViewId; label: string; icon: Icon; badge?: string };

/** Every screen once, with its label and icon. */
const items: Record<ViewId, Item> = {
  board: { id: "board", label: "Group overview", icon: Crown },
  partner: { id: "partner", label: "Partner home", icon: Storefront },
  dashboard: { id: "dashboard", label: "Sales command", icon: SquaresFour },
  clients: { id: "clients", label: "Clients", icon: AddressBook },
  pipeline: { id: "pipeline", label: "Pipeline", icon: Kanban },
  leads: { id: "leads", label: "All enquiries", icon: UsersThree },
  deals: { id: "deals", label: "Deals & commissions", icon: Handshake },
  tasks: { id: "tasks", label: "Tasks", icon: CheckSquare, badge: "4" },
  projects: { id: "projects", label: "Projects & inventory", icon: BuildingApartment },
  launch: { id: "launch", label: "Launch night", icon: RocketLaunch },
  "ai-activity": { id: "ai-activity", label: "AI activity", icon: Sparkle, badge: "3" },
  automations: { id: "automations", label: "Automations", icon: FlowArrow },
  voice: { id: "voice", label: "Voice agent & ledger", icon: Microphone },
  scoring: { id: "scoring", label: "Lead scoring", icon: Target },
  intent: { id: "intent", label: "Intent detection", icon: ChatTeardropText },
  "next-best-action": { id: "next-best-action", label: "My day", icon: Lightning },
  "live-call": { id: "live-call", label: "Live call assistant", icon: Headset },
  whatsapp: { id: "whatsapp", label: "WhatsApp", icon: WhatsappLogo, badge: "14" },
  sequences: { id: "sequences", label: "Sequences", icon: PaperPlaneTilt },
  social: { id: "social", label: "Facebook & Instagram", icon: InstagramLogo },
  funnel: { id: "funnel", label: "Conversion funnel", icon: Funnel },
  "channel-roi": { id: "channel-roi", label: "Channel ROI", icon: ChartPieSlice },
  agents: { id: "agents", label: "Consultants", icon: Trophy },
  brokers: { id: "brokers", label: "Broker network", icon: UsersFour },
  "gcc-developers": { id: "gcc-developers", label: "Developers & areas", icon: Buildings },
  "payment-plans": { id: "payment-plans", label: "Broker calculator", icon: Calculator },
  sla: { id: "sla", label: "SLA tracking", icon: Timer, badge: "2" },
  compliance: { id: "compliance", label: "Compliance", icon: ShieldCheck },
  notifications: { id: "notifications", label: "Notifications", icon: Bell, badge: "4" },
};

/** Navigation per role: each role sees its own home and only what it needs. */
const byRole: Record<RoleId, { label: string; ids: ViewId[] }[]> = {
  chairman: [
    { label: "Overview", ids: ["board"] },
    { label: "Portfolio", ids: ["projects", "launch", "gcc-developers"] },
    { label: "Sales", ids: ["deals", "dashboard", "agents", "brokers"] },
    { label: "AI", ids: ["ai-activity", "voice", "automations"] },
    { label: "Governance", ids: ["compliance", "notifications"] },
  ],
  director: [
    { label: "Command", ids: ["dashboard", "ai-activity", "tasks"] },
    { label: "Clients", ids: ["clients", "leads", "pipeline", "deals"] },
    { label: "Inventory", ids: ["projects", "launch"] },
    { label: "AI", ids: ["automations", "voice", "scoring", "intent", "next-best-action", "live-call"] },
    { label: "Channels", ids: ["whatsapp", "sequences", "social"] },
    { label: "Team & partners", ids: ["agents", "brokers", "sla"] },
    { label: "Analytics", ids: ["funnel", "channel-roi"] },
    { label: "Market", ids: ["gcc-developers", "payment-plans"] },
    { label: "Governance", ids: ["compliance", "notifications"] },
  ],
  agent: [
    { label: "Today", ids: ["next-best-action", "tasks", "whatsapp", "live-call"] },
    { label: "Clients", ids: ["clients", "pipeline", "deals"] },
    { label: "Inventory", ids: ["projects", "payment-plans", "gcc-developers"] },
    { label: "Inbox", ids: ["notifications"] },
  ],
  broker: [
    { label: "Partner", ids: ["partner"] },
    { label: "Inventory", ids: ["projects", "payment-plans", "gcc-developers"] },
  ],
};

export function navFor(role: RoleId) {
  return byRole[role].map((g) => ({ label: g.label, items: g.ids.map((id) => items[id]) }));
}
export function canSee(role: RoleId, id: ViewId) {
  return byRole[role].some((g) => g.ids.includes(id));
}

/** All screens grouped (the director's full set plus homes), for search and page labels. */
export const navGroups = [{ label: "Overview", items: [items.board, items.partner] }, ...navFor("director")];
export const viewLabel = Object.fromEntries(Object.values(items).map((i) => [i.id, i.label])) as Record<ViewId, string>;
