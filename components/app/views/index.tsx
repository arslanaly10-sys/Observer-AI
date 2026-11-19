"use client";
import type { ViewId } from "../nav";
import { Dashboard, Pipeline, Leads } from "./core";
import { Scoring, Intent, NextBestAction, LiveCall } from "./intel";
import { WhatsApp, Sequences, Social } from "./channels";
import { Funnel, ChannelROI, Agents } from "./analytics";
import { DemoMarket } from "./market";
import { DemoCalculator } from "./calculator";
import { Sla, Compliance, Notifications } from "./enterprise";
import { Board } from "./exec";
import { Clients, Deals, Tasks } from "./crm";
import { Projects } from "./inventory";
import { Brokers, Partner, Holds } from "./network";
import { InventorySources } from "./sources";
import { LaunchControls } from "./controls";
import { GccIntel } from "./gcc";
import { AiActivity, Automations, Voice } from "./ai";
import { LaunchNight } from "./launch";

const views: Record<ViewId, () => React.JSX.Element> = {
  board: Board, partner: Partner,
  dashboard: Dashboard, clients: Clients, pipeline: Pipeline, leads: Leads, deals: Deals, tasks: Tasks,
  projects: Projects, launch: LaunchNight, "launch-controls": LaunchControls, "inventory-sources": InventorySources, holds: Holds,
  "ai-activity": AiActivity, automations: Automations, voice: Voice,
  scoring: Scoring, intent: Intent, "next-best-action": NextBestAction, "live-call": LiveCall,
  whatsapp: WhatsApp, sequences: Sequences, social: Social,
  funnel: Funnel, "channel-roi": ChannelROI, agents: Agents, brokers: Brokers,
  "gcc-developers": DemoMarket, "gcc-intel": GccIntel, "payment-plans": DemoCalculator,
  sla: Sla, compliance: Compliance, notifications: Notifications,
};

export function View({ id }: { id: ViewId }) {
  const V = views[id];
  return <V />;
}
