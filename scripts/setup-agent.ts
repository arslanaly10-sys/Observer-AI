/**
 * Creates (or updates) the Observer concierge as a Claude Managed Agent, plus the cloud environment its
 * sessions run in. Run once, then again whenever lib/ai/definition.ts changes:
 *
 *   ANTHROPIC_API_KEY=... npm run agent:setup
 *
 * Prints OBSERVER_AGENT_ID and OBSERVER_ENVIRONMENT_ID to add to Vercel. Pass them back in the environment
 * on later runs and the script publishes a new agent version instead of creating another agent.
 */
import Anthropic from "@anthropic-ai/sdk";
import { AGENT_NAME, MODEL, SYSTEM_PROMPT, TOOLS } from "../lib/ai/definition.ts";

const client = new Anthropic();
const tools = TOOLS.map((t) => ({ type: "custom" as const, name: t.name, description: t.description, input_schema: t.input_schema }));

let envId = process.env.OBSERVER_ENVIRONMENT_ID;
if (!envId) {
  // Tools run on our own server (custom tools), so the sandbox needs no network at all.
  const env = await client.beta.environments.create({
    name: "observer-concierge",
    description: "Sessions for the Observer AI sales concierge. No outbound network: every tool runs on the Observer server.",
    config: { type: "cloud", networking: { type: "limited", allowed_hosts: [], allow_mcp_servers: false, allow_package_managers: false } },
  });
  envId = env.id;
  console.log("Created environment", envId);
}

let agentId = process.env.OBSERVER_AGENT_ID;
const body = { name: AGENT_NAME, model: MODEL, system: SYSTEM_PROMPT, tools, description: "Multilingual real-estate sales concierge for Observer AI workspaces." };
if (agentId) {
  const current = await client.beta.agents.retrieve(agentId);
  const updated = await client.beta.agents.update(agentId, { ...body, version: current.version });
  console.log(`Updated agent ${agentId} to version ${updated.version}`);
} else {
  const agent = await client.beta.agents.create(body);
  agentId = agent.id;
  console.log("Created agent", agentId);
}

console.log(`\nAdd these to your Vercel project (Production):\n  OBSERVER_AGENT_ID=${agentId}\n  OBSERVER_ENVIRONMENT_ID=${envId}\n`);
