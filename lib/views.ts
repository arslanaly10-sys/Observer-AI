export const viewIds = [
  // Executive and partner homes
  "board", "partner",
  // Sales and CRM
  "dashboard", "clients", "pipeline", "leads", "deals", "tasks",
  // Inventory
  "projects", "launch",
  // AI
  "ai-activity", "automations", "voice", "scoring", "intent", "next-best-action", "live-call",
  // Channels
  "whatsapp", "sequences", "social",
  // Analytics and network
  "funnel", "channel-roi", "agents", "brokers",
  // Market
  "gcc-developers", "payment-plans",
  // Governance
  "sla", "compliance", "notifications",
] as const;
export type ViewId = (typeof viewIds)[number];
