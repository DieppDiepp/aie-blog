import { readdir, readFile } from "fs/promises";
import path from "path";
import matter from "gray-matter";
import type { PostTag } from "@/lib/types";
import type { Project, ProjectMetric } from "@/lib/project-types";

// Same contract as lib/posts.ts (ADR-0004): the write-up lives in the repo as
// MDX, the DB holds nothing about it. content/projects/<slug>/index.mdx.
const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

type Frontmatter = {
  title: string;
  summary: string;
  date: string;
  author: string;
  field: string;
  tags?: PostTag[];
  metrics: ProjectMetric[];
  chapters?: number;
  artifacts?: string;
  draft?: boolean;
  cover?: string;
  thumbnail?: string;
};

async function readProjectFile(
  slug: string,
): Promise<{ frontmatter: Frontmatter; content: string } | null> {
  try {
    const raw = await readFile(path.join(PROJECTS_DIR, slug, "index.mdx"), "utf8");
    const { data, content } = matter(raw);
    return { frontmatter: data as Frontmatter, content: content.trim() };
  } catch {
    return null;
  }
}

function toProject(slug: string, fm: Frontmatter, content: string): Project {
  return {
    slug,
    title: fm.title,
    summary: fm.summary,
    body: content,
    created_at: fm.date,
    author: fm.author,
    field: fm.field,
    tags: fm.tags,
    metrics: (fm.metrics ?? []).slice(0, 3),
    chapters: fm.chapters,
    artifacts: fm.artifacts,
    cover: fm.cover ?? fm.thumbnail,
    thumbnail: fm.thumbnail ?? fm.cover,
  };
}

// All published projects, newest first.
export async function getAllProjects(): Promise<Project[]> {
  const slugs = await readdir(PROJECTS_DIR).catch(() => [] as string[]);
  const projects: Project[] = [];
  for (const slug of slugs) {
    const file = await readProjectFile(slug);
    if (!file || file.frontmatter.draft) continue;
    projects.push(toProject(slug, file.frontmatter, file.content));
  }
  return projects.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const file = await readProjectFile(slug);
  if (!file) return null;
  return toProject(slug, file.frontmatter, file.content);
}

export async function getProjectsByAuthor(author: string): Promise<Project[]> {
  const all = await getAllProjects();
  return all.filter((p) => p.author === author);
}
