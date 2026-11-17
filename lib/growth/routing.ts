/**
 * Pick the human agent for a lead. Rules, in order of weight:
 *   language spoken  >  area/project specialty  >  hot leads to top performers  >  fair rotation.
 * Agents who are unavailable or at capacity are skipped. Returns null when nobody can take it.
 */
export interface Candidate {
  user_id: string;
  name?: string | null;
  languages: string[];
  areas: string[];
  max_open_leads: number;
  open_leads: number;
  available: boolean;
  top_performer: boolean;
  last_assigned_at: string | null;
}
export interface RouteLead { language?: string | null; area?: string | null; score: number; temp: "hot" | "warm" | "cold" }

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, " ").trim();

export function pickAgent(lead: RouteLead, candidates: Candidate[], hotThreshold = 78) {
  const pool = candidates.filter((c) => c.available && c.open_leads < c.max_open_leads);
  if (!pool.length) return null;
  const lang = (lead.language ?? "").toLowerCase().slice(0, 2);
  const area = lead.area ? norm(lead.area) : "";
  const hot = lead.temp === "hot" || lead.score >= hotThreshold;

  const scored = pool.map((c) => {
    const reasons: string[] = [];
    let pts = 0;
    if (lang && c.languages.map((l) => l.toLowerCase().slice(0, 2)).includes(lang)) { pts += 100; reasons.push(`speaks ${lang}`); }
    if (area && c.areas.some((a) => { const n = norm(a); return n && (area.includes(n) || n.includes(area)); })) { pts += 40; reasons.push(`covers ${lead.area}`); }
    if (hot && c.top_performer) { pts += 30; reasons.push("top performer for a hot lead"); }
    pts -= (c.open_leads / Math.max(1, c.max_open_leads)) * 10; // lighter load wins ties
    return { c, pts, reasons };
  });
  scored.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const ta = a.c.last_assigned_at ? Date.parse(a.c.last_assigned_at) : 0;
    const tb = b.c.last_assigned_at ? Date.parse(b.c.last_assigned_at) : 0;
    return ta - tb; // round-robin: longest since last assignment first
  });
  const w = scored[0];
  return { user_id: w.c.user_id, reason: w.reasons.length ? w.reasons.join(", ") : "next in rotation" };
}
