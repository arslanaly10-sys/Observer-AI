import "server-only";
import * as z from "zod/v4";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { claude, FALLBACK } from "./claude";
import { MODEL } from "./definition";
import { analyzeEnquiry } from "@/lib/engine";
import { detectLanguage } from "@/lib/growth/language";

export const Assessment = z.object({
  score: z.number().int().min(0).max(100),
  temp: z.enum(["hot", "warm", "cold"]),
  intent: z.enum(["buyer", "seller", "investor", "renter", "unknown"]),
  language: z.enum(["en", "ar", "hi", "ur", "es", "pt", "ru", "fr", "zh", "fa"]),
  area: z.string().nullable(),
  budget_aed: z.number().nullable(),
  timeframe: z.enum(["<1 mo", "1-2 mo", "3 mo", "6 mo", "12 mo", "18 mo"]).nullable(),
  financing: z.enum(["Cash", "Mortgage", "Unknown"]),
  reason: z.string().describe("One sentence an agent can read: why this score"),
});
export type Assessment = z.infer<typeof Assessment>;

const RUBRIC = `You score real-estate leads for a Gulf brokerage. Read the enquiry and any conversation, then return:
- score 0-100: likelihood this person transacts within 90 days. Weigh stated budget and financing (cash > mortgage approved > unknown), timing, specificity (named project, unit type, viewing request), engagement and replies, and source quality (portals and WhatsApp above social ads).
- temp: hot at 78 or more, warm 55-77, cold below 55.
- intent, language of the lead's own words, area (as written, or null), budget in AED as a number (convert "2.5M" or "2.5 مليون" to 2500000; null if absent), timeframe, financing.
- reason: one plain sentence naming the two or three signals that drove the score.
Score what is written, not what you hope. A form with only a name and phone is cold-to-warm (40-55) unless the source or message adds signal.`;

export interface ScoreInput { name: string; message: string; source: string; area?: string | null; budget?: string | null; transcript?: string }

/** Claude's assessment when a key is set; the deterministic engine otherwise (or on any failure). */
export async function assessLead(i: ScoreInput): Promise<Assessment & { by: "claude" | "rules" }> {
  const c = claude();
  if (c) {
    try {
      const res = await c.beta.messages.parse({
        model: MODEL,
        max_tokens: 2000,
        ...FALLBACK,
        system: RUBRIC,
        output_config: { effort: "low", format: betaZodOutputFormat(Assessment) },
        messages: [{ role: "user", content: [
          `Source: ${i.source}`, `Name: ${i.name}`, i.area ? `Area field: ${i.area}` : "", i.budget ? `Budget field: ${i.budget}` : "",
          `Enquiry:\n${i.message || "(no message)"}`, i.transcript ? `Conversation so far:\n${i.transcript}` : "",
        ].filter(Boolean).join("\n") }],
      });
      if (res.stop_reason !== "refusal" && res.parsed_output) return { ...res.parsed_output, by: "claude" };
    } catch (e) {
      console.error("assessLead: falling back to rules", (e as Error).message);
    }
  }
  return rulesAssessment(i);
}

export function rulesAssessment(i: ScoreInput): Assessment & { by: "rules" } {
  const text = [i.message, i.area, i.budget, i.transcript].filter(Boolean).join(" ");
  const language = detectLanguage(text || i.name);
  const a = analyzeEnquiry(text, language === "ar" ? "ar" : "en");
  const has = (k: string) => a.intent.hits.some((h) => h.key === k);
  const m = (i.budget ?? a.budget ?? "").match(/([\d.]+)\s*(m|million|k)?/i);
  const budget_aed = m ? Math.round(parseFloat(m[1]) * (/k/i.test(m[2] ?? "") ? 1e3 : parseFloat(m[1]) < 1000 ? 1e6 : 1)) : null;
  return {
    score: a.score, temp: a.temp,
    intent: has("seller") ? "seller" : has("investor") ? "investor" : has("buyer") ? "buyer" : "unknown",
    language, area: i.area ?? a.area, budget_aed,
    timeframe: has("urgent") ? "<1 mo" : has("researching") ? "12 mo" : null,
    financing: has("cash") ? "Cash" : /mortgage|loan/i.test(text) ? "Mortgage" : "Unknown",
    reason: a.parts.slice(0, 3).map((p) => p.label).join(", ") + " drove this score (rules engine).",
    by: "rules",
  };
}
