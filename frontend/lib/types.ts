// A post as read from its MDX file (see ADR-0004: content/posts/<slug>/index.mdx
// is the source of truth). "body" holds the raw MDX source, used both for the
// reading-time estimate and as the input to the MDX renderer on the article page.
export type Post = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  created_at: string;
  tags?: PostTag[];
};

// A single tag on a post. "topic" is a neutral knowledge tag; the others are
// difficulty levels rendered with a subtle tint.
export type PostTag = {
  label: string;
  variant?: "topic" | "easy" | "mid" | "hard";
};
