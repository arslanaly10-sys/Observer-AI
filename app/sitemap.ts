import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { audienceIds } from "@/dictionaries/site";

const paths = ["", "/product", "/pricing", "/about", "/contact", "/security", "/privacy", "/terms", ...audienceIds.map((a) => `/solutions/${a}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({
    url: `${SITE}/en${p}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.7,
    alternates: { languages: { en: `${SITE}/en${p}`, ar: `${SITE}/ar${p}` } },
  }));
}
