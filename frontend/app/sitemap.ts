import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllPosts } from "@/lib/posts";
import { TOPICS } from "@/lib/topics";

// Next reads this file to serve /sitemap.xml. It is the machine-readable list
// of every page we want Google to know about, so new posts get discovered
// without waiting for a crawler to stumble onto a link. Built at build time
// from the same data the pages use, so it never drifts out of date.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  // Static, hand-authored routes.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/topics`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/graph`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.3 },
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

  return [...staticRoutes, ...postRoutes, ...topicRoutes];
}
