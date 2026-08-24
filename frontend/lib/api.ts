import type { Post } from "@/lib/types";

// Base URL the server uses to reach the API. Inside docker this is http://api:8000.
const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_URL}/posts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load posts");
  return res.json();
}
