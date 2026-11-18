/**
 * The Observer concierge: one versioned Managed Agent (system prompt + custom tools), shared by every
 * workspace. Workspace and lead details arrive each turn as a `system.message`, so the agent itself never
 * needs per-tenant copies. Edit here, then run `npm run agent:setup` to publish a new version.
 */
export const AGENT_NAME = "Observer concierge";
export const MODEL = "claude-opus-5-5";

export const SYSTEM_PROMPT = `You are the AI sales assistant for a real-estate brokerage or developer in the Gulf. You talk with people who have just enquired about property, over WhatsApp, email or the phone. Your job is to help them quickly and honestly, learn what they need, and get serious buyers in front of the right human agent.

Who you are
- Use the assistant name and company given in the context for this turn. In your first message to a lead, say plainly that you are an AI assistant and that a colleague can join at any time.
- If someone asks whether you are a person or a bot, tell them you are an AI assistant and offer to bring in a human colleague. Never claim to be human.

Language and tone
- Reply in the language of the lead's most recent message. If it is unclear, use the language in the context. Arabic should be clear Modern Standard Arabic that reads naturally to Gulf buyers.
- Write like a warm, polished concierge: calm, specific, short. On WhatsApp keep each reply to two or three short paragraphs and ask one question at a time. On email you may be a little fuller, with a greeting and a sign-off using the assistant name. On a call, speak in one or two short sentences per turn.
- Plain text only. No markdown headings, tables, or bullet symbols on WhatsApp or calls.

Facts
- Only state prices, availability, payment plans, handover dates, fees, and project details that a tool returned in this conversation. If a tool has nothing, say a colleague will confirm the details and record what they asked with update_lead.
- For costs, use the calculators and present results as estimates: calculate_purchase_costs (fees and cash needed), check_mortgage_eligibility (how much they can borrow), build_payment_schedule (off-plan instalments with dates), calculate_payment_plan (monthly payment and yield), check_golden_visa.
- For market questions (prices per square foot, rental yields, service charges, developers and their usual payment plans), use get_market_overview. These are indicative ranges from public sources: say so and give the month, and never present them as the price of a specific unit. Quote a specific home's price only from search_inventory or get_project.
- Quote published list prices and payment plans. Do not negotiate, offer discounts, or agree to terms. If the lead wants to make an offer, reserve, or discuss a deposit or LOI, call handover_to_human with reason "offer".
- For legal, visa, mortgage-approval, or tax questions, give general information only, then call handover_to_human with reason "specialist".
- Do not share any other client's information.

Working the conversation
- Learn, one question at a time: whether they want to buy, sell, invest or rent; preferred area; budget; bedrooms; timing; and cash or mortgage. Save each answer with update_lead as soon as you learn it.
- When they would like to see a property or talk, use check_availability, offer two or three times in their time zone, then book_appointment once they choose. Confirm the booked time back to them.
- If they ask you to call them, ask whether they are happy to speak with you (the AI assistant) or would prefer a colleague. For you, use call_lead; for a colleague, use handover_to_human with reason "requested". On a call, you are still the AI assistant and say so if asked.
- Send brochures with send_brochure when they ask for details or a floor plan.
- If they are upset, ask for a person, or ask for a phone call with a human, call handover_to_human with reason "requested" or "upset".
- If they ask you to stop contacting them, call opt_out and confirm politely in one sentence.

Hand-over during office hours
- The context says whether the office is open. When it is open and you know at least their intent, area and budget, call handover_to_human with reason "qualified" and a two-line summary, then tell the lead a named colleague will continue shortly.
- Outside office hours, keep helping them yourself until they are booked, ask for a person, or the conversation ends naturally.

Your final text in each turn is sent to the lead exactly as written, on the channel named in the context.`;

type Schema = { type: "object"; properties: Record<string, unknown>; required?: string[] };
export interface ToolDef { name: string; description: string; input_schema: Schema }

export const TOOLS: ToolDef[] = [
  {
    name: "search_inventory",
    description: "Search this company's projects and units. Use before stating any price, availability, or project detail. Returns matching projects with unit types, size, price ranges, and payment plan names.",
    input_schema: { type: "object", properties: {
      query: { type: "string", description: "Free text such as a project name, developer, or feature" },
      area: { type: "string", description: "Area or community, e.g. Dubai Hills" },
      max_price_aed: { type: "number", description: "Upper budget in AED" },
      min_beds: { type: "number", description: "Minimum bedrooms (0 for studio)" },
      status: { type: "string", enum: ["off_plan", "ready", "any"] },
    } },
  },
  {
    name: "get_project",
    description: "Full details for one project: description, amenities, handover, every unit type with prices, and each payment plan's milestone schedule.",
    input_schema: { type: "object", properties: { project_id: { type: "string" } }, required: ["project_id"] },
  },
  {
    name: "calculate_payment_plan",
    description: "Monthly cost of a plan for a price: mortgage payment, illustrative developer or post-handover instalments, the same itemised fees as calculate_purchase_costs, and expected rent.",
    input_schema: { type: "object", properties: {
      price_aed: { type: "number" },
      plan: { type: "string", enum: ["mortgage", "developer", "cash", "posthandover"] },
      down_payment_pct: { type: "number", description: "Default 20" },
      years: { type: "number", description: "Mortgage term, default 25" },
      rate_pct: { type: "number", description: "Annual mortgage rate, default 4.5" },
      rental_yield_pct: { type: "number", description: "Default 6.5" },
    }, required: ["price_aed", "plan"] },
  },
  {
    name: "calculate_purchase_costs",
    description: "Itemised buying costs in the UAE for a price: transfer/Oqood fee, admin and trustee fees, agency commission on resale, mortgage registration, bank and valuation fees, and total cash needed.",
    input_schema: { type: "object", properties: {
      price_aed: { type: "number" },
      emirate: { type: "string", enum: ["dubai", "abu_dhabi", "sharjah", "rak"] },
      status: { type: "string", enum: ["ready", "offplan", "offplan_resale"], description: "offplan = bought from the developer; offplan_resale = an unfinished unit bought from another buyer" },
      financing: { type: "string", enum: ["cash", "mortgage"] },
      loan_aed: { type: "number", description: "Mortgage amount, if financing" },
    }, required: ["price_aed", "status", "financing"] },
  },
  {
    name: "check_mortgage_eligibility",
    description: "How much a buyer can borrow under UAE Central Bank rules (loan-to-value by residency, first or second home, off-plan; 50% debt-burden cap; age limits) and the monthly payment.",
    input_schema: { type: "object", properties: {
      price_aed: { type: "number" },
      residency: { type: "string", enum: ["expat", "national"] },
      first_home: { type: "boolean" },
      offplan: { type: "boolean" },
      monthly_income_aed: { type: "number" },
      monthly_debts_aed: { type: "number", description: "Existing loan and card payments" },
      age: { type: "number" },
      rate_pct: { type: "number", description: "Default: middle of current fixed rates" },
    }, required: ["price_aed", "residency", "monthly_income_aed", "age"] },
  },
  {
    name: "build_payment_schedule",
    description: "An off-plan payment schedule with dates and amounts, from a plan like 10/50/40 or 60/40, post-handover instalments, or 1%-a-month plans.",
    input_schema: { type: "object", properties: {
      price_aed: { type: "number" },
      plan: { type: "string", description: "e.g. '60/40', '10/50/40', '20/40/40 post-handover', '20% + 1% monthly'" },
      months_to_handover: { type: "number" },
      post_handover_months: { type: "number" },
    }, required: ["price_aed", "plan", "months_to_handover"] },
  },
  {
    name: "check_golden_visa",
    description: "Whether a property purchase is likely to qualify for the UAE 10-year Golden Visa (AED 2 million rule), with conditions to confirm.",
    input_schema: { type: "object", properties: {
      value_aed: { type: "number", description: "The official (DLD) valuation if known; otherwise the price, and say the valuation decides" }, mortgaged: { type: "boolean" }, offplan: { type: "boolean" },
      emirate: { type: "string", enum: ["dubai", "abu_dhabi", "sharjah", "rak"] },
    }, required: ["value_aed"] },
  },
  {
    name: "get_market_overview",
    description: "Indicative UAE market data: an area's price per sq ft, gross rental yield and service charges; a developer's profile and usual payment plans; purchase fees, mortgage rules and current rates. Ranges from public sources, with the date.",
    input_schema: { type: "object", properties: {
      area: { type: "string" }, developer: { type: "string" },
      topic: { type: "string", enum: ["area", "developer", "fees", "mortgage_rules", "rates", "golden_visa", "compare_areas"] },
    } },
  },
  {
    name: "check_availability",
    description: "Free slots for a viewing or call with the lead's assigned agent (or the best available agent), in the lead's time zone, over the next days.",
    input_schema: { type: "object", properties: {
      kind: { type: "string", enum: ["viewing", "call", "meeting"] },
      days_ahead: { type: "number", description: "How many days to look ahead, 1 to 14. Default 5" },
    }, required: ["kind"] },
  },
  {
    name: "book_appointment",
    description: "Book a viewing, call, or meeting the lead has agreed to. Use a start time returned by check_availability.",
    input_schema: { type: "object", properties: {
      kind: { type: "string", enum: ["viewing", "call", "meeting"] },
      starts_at: { type: "string", description: "ISO 8601 start time from check_availability" },
      project_id: { type: "string" },
      notes: { type: "string" },
    }, required: ["kind", "starts_at"] },
  },
  {
    name: "send_brochure",
    description: "Send a project's brochure or floor plan PDF to the lead on the current channel.",
    input_schema: { type: "object", properties: { project_id: { type: "string" } }, required: ["project_id"] },
  },
  {
    name: "update_lead",
    description: "Save what you learned about the lead to the CRM. Only include fields you learned.",
    input_schema: { type: "object", properties: {
      intent: { type: "string", enum: ["buyer", "seller", "investor", "renter", "unknown"] },
      area: { type: "string" },
      budget_aed: { type: "number" },
      bedrooms: { type: "number" },
      timeframe: { type: "string", enum: ["<1 mo", "1-2 mo", "3 mo", "6 mo", "12 mo", "18 mo"] },
      financing: { type: "string", enum: ["Cash", "Mortgage", "Unknown"] },
      note: { type: "string", description: "One line worth keeping for the agent" },
    } },
  },
  {
    name: "handover_to_human",
    description: "Hand the conversation to a human agent and alert them now.",
    input_schema: { type: "object", properties: {
      reason: { type: "string", enum: ["qualified", "requested", "upset", "offer", "specialist", "hot"] },
      summary: { type: "string", description: "Two lines for the agent: who they are, what they want, what was promised" },
    }, required: ["reason", "summary"] },
  },
  {
    name: "call_lead",
    description: "Phone the lead with the AI voice assistant. Use only when they ask for a call and are happy to speak with the AI now or at a stated time; if they want a human on the phone, use handover_to_human instead.",
    input_schema: { type: "object", properties: {
      at: { type: "string", description: "ISO 8601 time for the call; omit to call in about a minute" },
      topic: { type: "string", description: "What they want to discuss" },
    } },
  },
  {
    name: "opt_out",
    description: "Stop all automated outreach to this lead because they asked not to be contacted.",
    input_schema: { type: "object", properties: {} },
  },
];

/** Context sent as a `system.message` before each lead message. */
export function turnContext(c: {
  assistantName: string; company: string; channel: string; officeOpen: boolean; nowLocal: string; leadTz: string;
  lead: { name: string; language: string | null; source: string; score: number; temp: string; area: string | null; budget: string | null; intent: string | null; stage: string; assignedAgent: string | null };
  firstContact: boolean; recent: string; instruction?: string;
}) {
  return [
    `Assistant name: ${c.assistantName}. Company: ${c.company}.`,
    `Channel for this reply: ${c.channel}. Lead's local time: ${c.nowLocal} (${c.leadTz}). Office is ${c.officeOpen ? "OPEN" : "CLOSED"} right now.`,
    `Lead: ${c.lead.name}; language ${c.lead.language ?? "unknown"}; came from ${c.lead.source}; score ${c.lead.score} (${c.lead.temp}); intent ${c.lead.intent ?? "unknown"}; area ${c.lead.area ?? "unknown"}; budget ${c.lead.budget ?? "unknown"}; stage ${c.lead.stage}; agent ${c.lead.assignedAgent ?? "not assigned yet"}.`,
    c.firstContact
      ? "This is your first message to this lead. They just enquired; reply to what they wrote, introduce yourself as an AI assistant, and ask one helpful question."
      : c.instruction ?? "Continue the conversation naturally.",
    c.recent ? `Recent messages, oldest first (includes anything a human colleague sent):\n${c.recent}` : "",
  ].filter(Boolean).join("\n");
}
