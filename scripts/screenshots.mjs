// Capture product screenshots from the running app for the marketing site.
// Usage: BASE=http://localhost:3000 node scripts/screenshots.mjs [--review dir] [paths...]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:3000";
const args = process.argv.slice(2);
const reviewIdx = args.indexOf("--review");
const reviewDir = reviewIdx >= 0 ? args[reviewIdx + 1] : null;
const paths = args.filter((_, i) => reviewIdx < 0 || (i !== reviewIdx && i !== reviewIdx + 1));

// Marketing product shots: [path, file, width, height, theme]
const base = [
  ["dashboard", "dashboard", 1440, 900, "light"],
  ["whatsapp", "whatsapp", 1440, 900, "light"],
  ["leads", "leads", 1440, 900, "light"],
  ["sequences", "sequences", 1440, 900, "light"],
  ["live-call", "live-call", 1440, 900, "dark"],
  ["payment-plans", "payment-plans", 1440, 900, "light"],
  ["scoring", "scoring", 1440, 900, "light"],
  ["dashboard", "dashboard-mobile", 390, 844, "light"],
];
const productShots = base.flatMap(([v, f, w, h, th]) => [
  [`/en/app/${v}`, f, w, h, th],
  [`/ar/app/${v}`, `${f}-ar`, w, h, th],
]);

const browser = await chromium.launch();
async function shoot(path, out, w, h, theme, full = false, scale = 2) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale, colorScheme: theme });
  await ctx.addInitScript((t) => { try { localStorage.setItem("obs-theme", t); } catch {} document.addEventListener("DOMContentLoaded", () => document.documentElement.classList.add("shot")); }, theme);
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  if (full) {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
      scrollTo(0, 0);
    });
  }
  await page.waitForTimeout(1200);
  await page.screenshot({ path: out, fullPage: full, type: out.endsWith(".jpg") ? "jpeg" : "png", quality: out.endsWith(".jpg") ? 86 : undefined });
  await ctx.close();
  console.log("shot", out);
}

if (reviewDir) {
  mkdirSync(reviewDir, { recursive: true });
  for (const p of paths) {
    const name = p.replace(/\//g, "_").replace(/^_/, "") || "root";
    await shoot(p, `${reviewDir}/${name}.jpg`, 1440, 900, "light", true, 1);
    if (process.env.MOBILE) await shoot(p, `${reviewDir}/${name}-m.jpg`, 390, 844, "light", true, 1);
  }
} else {
  mkdirSync("public/shots", { recursive: true });
  for (const [p, f, w, h, theme] of productShots) await shoot(p, `public/shots/${f}.jpg`, w, h, theme, false, w < 500 ? 3 : 2);
}
await browser.close();
