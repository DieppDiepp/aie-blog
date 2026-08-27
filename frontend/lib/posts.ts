import { readdir, readFile } from "fs/promises";
import path from "path";
import matter from "gray-matter";
import type { Post, PostTag } from "@/lib/types";

// See ADR-0004: article bodies live as files in the repo, not in the DB.
const POSTS_DIR = path.join(process.cwd(), "content", "posts");

type Frontmatter = {
  title: string;
  summary: string;
  date: string;
  tags?: PostTag[];
  draft?: boolean;
  thumbnail?: string;
};

async function readPostFile(
  slug: string,
): Promise<{ frontmatter: Frontmatter; content: string } | null> {
  try {
    const raw = await readFile(path.join(POSTS_DIR, slug, "index.mdx"), "utf8");
    const { data, content } = matter(raw);
    return { frontmatter: data as Frontmatter, content: content.trim() };
  } catch {
    return null;
  }
}

function toPost(slug: string, frontmatter: Frontmatter, content: string): Post {
  return {
    slug,
    title: frontmatter.title,
    summary: frontmatter.summary,
    body: content,
    created_at: frontmatter.date,
    tags: frontmatter.tags,
    thumbnail: frontmatter.thumbnail,
  };
}

// All published posts (drafts excluded), newest first.
export async function getAllPosts(): Promise<Post[]> {
  const slugs = await readdir(POSTS_DIR).catch(() => [] as string[]);
  const posts: Post[] = [];
  for (const slug of slugs) {
    const file = await readPostFile(slug);
    if (!file || file.frontmatter.draft) continue;
    posts.push(toPost(slug, file.frontmatter, file.content));
  }
  return posts.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

// A single post by slug. Drafts ARE included here, so a direct link still
// works while a post is being written; only getAllPosts() hides drafts.
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const file = await readPostFile(slug);
  if (!file) return null;
  return toPost(slug, file.frontmatter, file.content);
}
