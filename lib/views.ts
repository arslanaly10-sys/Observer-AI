export const viewIds = [
  "dashboard", "pipeline", "leads", "scoring", "intent", "next-best-action", "live-call",
  "whatsapp", "sequences", "social", "funnel", "channel-roi", "agents", "gcc-developers",
  "payment-plans", "sla", "compliance", "notifications",
] as const;
export type ViewId = (typeof viewIds)[number];
