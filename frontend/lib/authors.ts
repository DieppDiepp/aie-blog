import type { Post } from "@/lib/types";

// The people who write here. Today there is one; the section was built for
// more, so every byline, filter and project row resolves an author by slug
// instead of hard-coding a name. Adding an author is adding an entry here
// plus an avatar, and /authors/<slug> exists immediately.
export type Author = {
  slug: string;
  // Short display name used in bylines and chips.
  name: string;
  // Full name for the author page heading.
  fullName: string;
  // One line under the heading. This is where the role goes, so the project
  // rows do not have to repeat it.
  role: string;
  // Two paragraphs, printed side by side on the author page.
  bio: [string, string];
  // What this author works on. Neutral outlined chips, four is the designed
  // count.
  focus: string[];
  // Square portrait. A local /public path or an R2 URL; see NOTES.md.
  avatar?: string;
  // Small square avatar for bylines. Falls back to avatar.
  portrait?: string;
  links?: { linkedin?: string; github?: string; email?: string };
  // Month the author started writing here, printed in the meta row.
  writingSince?: string;
};

export const AUTHORS: Author[] = [
  {
    slug: "nguyen",
    name: "Nguyên",
    fullName: "Lương Đắc Nguyên",
    role: "Founder của AI Engineer Blog. Sinh viên Khoa học Dữ liệu, đang tập làm AI engineer và thích viết.",
    bio: [
      "Mình đang học Khoa học Dữ liệu và đi dần về phía AI engineer. Thứ mình thích nhất là biến một mô hình trong đầu thành một hệ thống chạy được thật. Blog này là nơi mình ghi lại cách mình nghĩ về chuyện đó: từ mô hình ngôn ngữ, agent, tới hạ tầng và quy trình đưa một tính năng ra sản phẩm.",
      "Mình tin vào việc học công khai. Nhiều thứ ở đây là ghi chú vừa làm vừa hiểu ra, nên bạn sẽ thấy cả những chỗ mình từng nhầm và cách mình gỡ. Phần dự án là chỗ mình kể dài hơn: một bài toán thật, những cách đã có, và vì sao mình chọn kiến trúc đó.",
    ],
    focus: ["LLM & agent", "Context engineering", "Hệ thống, MLOps", "Object detection"],
    avatar: "/nguyen.png",
    links: {
      linkedin: "https://www.linkedin.com/in/nguyendsc/",
      github: "https://github.com/DieppDiepp",
      email: "mailto:luongdacnguyennguyen@gmail.com",
    },
    writingSince: "08.2026",
  },
];

export function getAuthor(slug: string): Author | undefined {
  return AUTHORS.find((a) => a.slug === slug);
}

// Posts written by an author. Post frontmatter has no author field yet (there
// was only one writer), so everything falls back to the default author. Once
// posts carry `author`, read it here and the author page needs no change.
export const DEFAULT_AUTHOR = "nguyen";

export function postsByAuthor(posts: Post[], slug: string): Post[] {
  return slug === DEFAULT_AUTHOR ? posts : [];
}
