import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllPosts } from "@/lib/posts";
import { AUTHORS } from "@/lib/authors";
import { TOPICS } from "@/lib/topics";

// Next reads this file to serve /sitemap.xml. It is the machine-readable list
// of every page we want Google to know about, so new posts get discovered
// without waiting for a crawler to stumble onto a link. Built at build time
// from the same data the pages use, so it never drifts out of date.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  // Static, hand-authored routes. /about is intentionally omitted: it redirects
  // to the default author page, and a redirect does not belong in the sitemap.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/projects`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/topics`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/graph`, changeFrequency: "monthly", priority: 0.4 },
  ];

  // One entry per published article. lastModified lets Google prioritise
  // re-crawling pages that actually changed.
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // One entry per topic hub.
  const topicRoutes: MetadataRoute.Sitemap = TOPICS.map((topic) => ({
    url: `${SITE_URL}/topics/${topic.slug}`,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  // One entry per author page.
  const authorRoutes: MetadataRoute.Sitemap = AUTHORS.map((author) => ({
    url: `${SITE_URL}/authors/${author.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // NOTE: project DETAIL pages (/projects/<slug>) are not listed: they are not
  // built yet (PROJECT_DETAIL_READY is false, rows link back to /projects).
  // Add a projectRoutes block here in the same commit that ships that page.

  return [...staticRoutes, ...postRoutes, ...topicRoutes, ...authorRoutes];
}
