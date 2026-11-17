import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/en/app/", "/ar/app/", "/en/workspace", "/ar/workspace", "/en/login", "/ar/login", "/en/invite/", "/ar/invite/", "/en/account/", "/ar/account/", "/auth/", "/api/"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
