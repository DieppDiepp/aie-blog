// Types for the Projects section. Kept in its own file on purpose: lib/types.ts
// is shared by the post pipeline and ADR-0004 treats it as frozen, so nothing
// here touches it.
import type { PostTag } from "@/lib/types";

// One headline number on a project card. Exactly three per project: the card
// grid is a fixed three-column strip and a fourth would break the rhythm.
export type ProjectMetric = {
  // The number itself, already formatted for display (e.g. "3h20", "8.894",
  // "6-9"). Never compute or localize this at render time.
  value: string;
  // Optional small unit printed right after the value in a lighter tone.
  unit?: string;
  // One line, uppercase, under the number. Keep it under about 30 characters.
  label: string;
  // True for the single metric that carries the accent color in the strip.
  // At most one per project, and it is allowed to be none.
  accent?: boolean;
};

// The field a project belongs to. Fields are the grouping axis of the index:
// the page prints one ink band per field, then that field's projects.
export type ProjectField = {
  slug: string;
  name: string;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  created_at: string;
  // Author slug, resolved against AUTHORS in lib/authors.ts.
  author: string;
  // Field slug, resolved against PROJECT_FIELDS below.
  field: string;
  // Technique chips. Same shape and same component as post tags, so the two
  // sections stay visually identical. Three is the designed count.
  tags?: PostTag[];
  // Exactly three, in display order.
  metrics: ProjectMetric[];
  // Number of chapters in the write-up, printed in the meta column. The design
  // has eight: context, related work, hypothesis, constraints, architecture,
  // decisions dropped, results, product shots.
  chapters?: number;
  // Short uppercase note in the byline row, e.g. "Có repo, có demo". Optional.
  artifacts?: string;
  // 16/9 cover for the index row. Absent is fine: the placeholder box in
  // Thumbnail renders instead and the layout does not move.
  cover?: string;
  // Small 132x88 thumbnail for the author page rows. Falls back to cover.
  thumbnail?: string;
};

// The grouping axis of /projects. Add a field here and the index prints its
// band and its filter cell automatically. A field with no projects is dimmed
// in the filter, never hidden: the empty slots are part of the map.
export const PROJECT_FIELDS: ProjectField[] = [
  { slug: "reasoning-slm", name: "Reasoning, SLM" },
  { slug: "agentic-retrieval", name: "Agentic retrieval" },
  { slug: "computer-vision", name: "Computer vision" },
];

export function getProjectField(slug: string): ProjectField | undefined {
  return PROJECT_FIELDS.find((f) => f.slug === slug);
}

export function projectsForField(projects: Project[], field: ProjectField): Project[] {
  return projects.filter((p) => p.field === field.slug);
}

// The project DETAIL page (/projects/<slug>) has not been designed yet: only
// the index and the author page were. Flip this to true in the same commit
// that adds app/projects/[slug]/page.tsx, and every row starts linking to it.
// Until then rows link back to /projects so nothing 404s.
export const PROJECT_DETAIL_READY = false;

export function projectHref(slug: string): string {
  return PROJECT_DETAIL_READY ? `/projects/${slug}` : "/projects";
}
