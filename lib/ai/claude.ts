import "server-only";
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;
/** The Claude client, or null when ANTHROPIC_API_KEY isn't set (the engine then falls back to rules). */
export function claude() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return (client ??= new Anthropic({ maxRetries: 2 }));
}
/** Server-side refusal fallback on every Messages request (routes by refusal category; no model list to keep). */
export const FALLBACK = { betas: ["server-side-fallback-2026-07-01"] as Anthropic.Beta.AnthropicBeta[], fallbacks: "default" as const };
