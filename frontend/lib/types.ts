// Types that mirror the backend response schemas.
export type Post = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  created_at: string;
  // Tags are not yet served by the API (they arrive with the topics module).
  // Optional here so components can render them once the data exists.
  tags?: PostTag[];
};

// A single tag on a post. "topic" is a neutral knowledge tag; the others are
// difficulty levels rendered with a subtle tint.
export type PostTag = {
  label: string;
  variant?: "topic" | "easy" | "mid" | "hard";
};
