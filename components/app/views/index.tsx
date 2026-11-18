"use client";
import type { ViewId } from "../nav";
import { Dashboard, Pipeline, Leads } from "./core";
import { Scoring, Intent, NextBestAction, LiveCall } from "./intel";
import { WhatsApp, Sequences, Social } from "./channels";
import { Funnel, ChannelROI, Agents } from "./analytics";
import { DemoMarket } from "./market";
import { DemoCalculator } from "./calculator";
import { Sla, Compliance, Notifications } from "./enterprise";

const views: Record<ViewId, () => React.JSX.Element> = {
  dashboard: Dashboard, pipeline: Pipeline, leads: Leads,
  scoring: Scoring, intent: Intent, "next-best-action": NextBestAction, "live-call": LiveCall,
  whatsapp: WhatsApp, sequences: Sequences, social: Social,
  funnel: Funnel, "channel-roi": ChannelROI, agents: Agents,
  "gcc-developers": DemoMarket, "payment-plans": DemoCalculator,
  sla: Sla, compliance: Compliance, notifications: Notifications,
};

export function View({ id }: { id: ViewId }) {
  const V = views[id];
  return <V />;
}
