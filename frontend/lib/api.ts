import type { Post } from "@/lib/types";

// Base URL the server uses to reach the API. Inside docker this is http://api:8000.
const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_URL}/posts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load posts");
  return res.json();
}

// Fetch a single post by slug. Returns null when the API reports 404.
export async function getPost(slug: string): Promise<Post | null> {
  const res = await fetch(`${API_URL}/posts/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load post");
  return res.json();
}
