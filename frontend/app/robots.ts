import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Next reads this file to serve /robots.txt. It is the first thing a crawler
// reads: it says what may be crawled and where the sitemap is. We allow
// everything and point at the sitemap so bots find every page fast.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
