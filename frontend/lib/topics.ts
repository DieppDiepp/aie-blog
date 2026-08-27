import type { Post } from "@/lib/types";

// The fields this blog is organized around. Each maps to one or more tag labels
// used in post frontmatter, so a topic can gather posts even if their tags were
// written slightly differently over time. Topics with no posts yet still get a
// page — it simply shows an "updating" state.
export type Topic = {
  slug: string;
  name: string;
  labels: string[];
  blurb: string;
};

export const TOPICS: Topic[] = [
  {
    slug: "he-thong",
    name: "Hệ thống",
    labels: ["Hệ thống", "Hạ tầng"],
    blurb: "Hạ tầng, Docker, CI/CD, triển khai và vận hành.",
  },
  {
    slug: "toan",
    name: "Toán",
    labels: ["Toán"],
    blurb: "Nền toán đủ dùng cho machine learning và deep learning.",
  },
  {
    slug: "machine-learning",
    name: "Machine Learning",
    labels: ["Machine Learning", "ML"],
    blurb: "Mô hình, đặc trưng, đánh giá và những cái bẫy quen thuộc.",
  },
  {
    slug: "deep-learning",
    name: "Deep Learning",
    labels: ["Deep Learning", "DL"],
    blurb: "Mạng nơ-ron, huấn luyện, và trực giác đằng sau nó.",
  },
  {
    slug: "llm",
    name: "LLM & ứng dụng",
    labels: ["LLM", "LLM & ứng dụng"],
    blurb: "Mô hình ngôn ngữ, RAG, agent và cách đưa ra sản phẩm thật.",
  },
];

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

export function postsForTopic(posts: Post[], topic: Topic): Post[] {
  return posts.filter((post) =>
    post.tags?.some((tag) => topic.labels.includes(tag.label)),
  );
}
