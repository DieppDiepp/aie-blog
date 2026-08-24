// Types that mirror the backend response schemas.
export type Post = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  created_at: string;
};
