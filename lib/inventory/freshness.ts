/**
 * Inventory without an API: how fresh each unit's data is, what the AI may quote, and reading a
 * developer's price list (CSV exported from Excel or a Google Sheet) into units, with the changes since
 * the last list.
 */
export const FRESH_HOURS = 6;
export const STALE_HOURS = 24;
const HOUR = 3_600_000;

export type SourceKind = "crm" | "price-list" | "email" | "broker-portal" | "sheet" | "sales-admin";
export type Freshness = "fresh" | "aging" | "stale";

export function freshness(lastConfirmedAt: number, now: number): { level: Freshness; hours: number } {
  const hours = Math.max(0, (now - lastConfirmedAt) / HOUR);
  return { level: hours < FRESH_HOURS ? "fresh" : hours < STALE_HOURS ? "aging" : "stale", hours };
}

/**
 * What the AI may tell a client about a unit. Over 24 hours old, it never quotes: it tells the client it is
 * confirming availability and asks sales admin first.
 */
export function quotePolicy(lastConfirmedAt: number, now: number): "quote" | "quote-with-date" | "confirm-first" {
  const { level } = freshness(lastConfirmedAt, now);
  return level === "fresh" ? "quote" : level === "aging" ? "quote-with-date" : "confirm-first";
}

export type Unit = { code: string; beds?: number; price?: number; status: "available" | "held" | "booked" | "sold" };

const HEAD: Record<string, keyof Unit> = {
  unit: "code", "unit no": "code", "unit number": "code", code: "code", "رقم الوحدة": "code", الوحدة: "code",
  beds: "beds", bedrooms: "beds", bed: "beds", type: "beds", "غرف النوم": "beds", الغرف: "beds",
  price: "price", "price (aed)": "price", "price aed": "price", "price (sar)": "price", السعر: "price",
  status: "status", availability: "status", الحالة: "status",
};
const STATUS: Record<string, Unit["status"]> = {
  available: "available", avail: "available", open: "available", "": "available", متاح: "available", متاحة: "available",
  hold: "held", held: "held", reserved: "held", "on hold": "held", محجوز: "held", محجوزة: "held",
  booked: "booked", booking: "booked", eoi: "booked", مدفوع: "booked",
  sold: "sold", "sold out": "sold", مباع: "sold", مباعة: "sold",
};

function splitCsv(line: string, sep: string): string[] {
  const out: string[] = []; let cur = "", q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === sep && !q) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

/** "3.4M", "AED 3,400,000", "3400000" → 3400000. "Studio" → 0 beds; "2BR" → 2. */
export function parseMoney(s: string): number | undefined {
  const n = parseFloat(s.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return undefined;
  return /m\b|m$|million/i.test(s) ? Math.round(n * 1e6) : /k\b|k$/i.test(s) ? Math.round(n * 1e3) : n;
}
function parseBeds(s: string): number | undefined {
  if (/studio|استوديو/i.test(s)) return 0;
  const n = parseInt(s.replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : undefined;
}

/** Read a price list exported as CSV (comma, semicolon or tab). Unknown columns are ignored. */
export function parsePriceList(text: string): { units: Unit[]; skipped: number; columns: string[] } {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { units: [], skipped: 0, columns: [] };
  const sep = [",", ";", "\t"].sort((a, b) => lines[0].split(b).length - lines[0].split(a).length)[0];
  const head = splitCsv(lines[0], sep).map((h) => HEAD[h.toLowerCase()]);
  if (!head.includes("code")) return { units: [], skipped: lines.length - 1, columns: [] };
  const units: Unit[] = []; let skipped = 0;
  for (const line of lines.slice(1)) {
    const cells = splitCsv(line, sep);
    const u: Unit = { code: "", status: "available" };
    head.forEach((k, i) => {
      const v = cells[i] ?? "";
      if (k === "code") u.code = v;
      else if (k === "beds") u.beds = parseBeds(v);
      else if (k === "price") u.price = parseMoney(v);
      else if (k === "status") u.status = STATUS[v.toLowerCase()] ?? "available";
    });
    if (u.code) units.push(u); else skipped++;
  }
  return { units, skipped, columns: [...new Set(head.filter(Boolean))] as string[] };
}

export type Change = { code: string; kind: "new" | "removed" | "price" | "status"; from?: string | number; to?: string | number };

/** What changed between the last list and this one: the AI only re-quotes changed units. */
export function diffLists(before: Unit[], after: Unit[]): Change[] {
  const old = new Map(before.map((u) => [u.code, u]));
  const changes: Change[] = [];
  for (const u of after) {
    const o = old.get(u.code);
    if (!o) { changes.push({ code: u.code, kind: "new", to: u.price }); continue; }
    if (o.price !== undefined && u.price !== undefined && o.price !== u.price) changes.push({ code: u.code, kind: "price", from: o.price, to: u.price });
    if (o.status !== u.status) changes.push({ code: u.code, kind: "status", from: o.status, to: u.status });
    old.delete(u.code);
  }
  for (const code of old.keys()) changes.push({ code, kind: "removed" });
  return changes;
}
