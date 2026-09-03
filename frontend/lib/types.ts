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
  // Small card thumbnail (techstack logos only), sized to read in the 150x88
  // list cells. When absent, the UI renders a placeholder box.
  thumbnail?: string;
  // Large 16/9 cover for the full-bleed bands (home masthead, article top, blog
  // lead). Falls back to `thumbnail` when a post has not supplied one.
  cover?: string;
};

// A single tag on a post. "topic" is a neutral knowledge tag; the others are
// difficulty levels rendered with a subtle tint.
export type PostTag = {
  label: string;
  variant?: "topic" | "easy" | "mid" | "hard";
};
