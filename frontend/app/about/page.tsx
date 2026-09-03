import { redirect } from "next/navigation";
import { DEFAULT_AUTHOR } from "@/lib/authors";

// Tạm thời: trang giới thiệu cá nhân đã gộp vào trang tác giả. Giữ /about như
// một lối vào quen thuộc (nav, nút "Về mình", link cũ ngoài site) và chuyển
// hướng sang trang tác giả mặc định. Khi cần một trang About riêng cho cả
// blog, khác với trang một tác giả, thì dựng lại nội dung ở đây.
export default function AboutPage() {
  redirect(`/authors/${DEFAULT_AUTHOR}`);
}
