import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { FeaturedPost } from "@/components/post/PostCard";
import { PostCarousel } from "@/components/post/PostCarousel";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

function ArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h9M8.5 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function Home() {
  const posts = await getAllPosts();
  const [featured] = posts;

  return (
    <main className="relative">
      {/* Full-bleed hero glow, centered so it reaches symmetrically to both
          edges of the page instead of hugging one corner. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
        style={{
          background:
            "radial-gradient(70% 340px at 50% -6%, rgba(47,95,224,0.13), rgba(47,95,224,0) 72%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 md:px-10">
        {/* Hero: compact masthead on the left, the featured piece on the right. */}
        <section className="py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-[0.82fr_1.18fr] md:items-center md:gap-16">
            <div>
              <h1 className="font-serif text-[34px] font-medium leading-[1.08] tracking-[-0.02em] text-ink md:text-[42px]">
                Building AI systems, thinking out loud.
              </h1>
              <p className="mt-5 max-w-md text-[16.5px] leading-relaxed text-muted">
                Bài viết, ghi chú và sơ đồ kiến trúc về cách mình xây dựng và vận
                hành các hệ thống AI trong thực tế.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-3 rounded-[11px] bg-ink py-[11px] pl-[22px] pr-[11px] text-[15px] font-medium transition-opacity hover:opacity-90"
                  style={{ color: "var(--bg)" }}
                >
                  Read the latest
                  <span
                    className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full"
                    style={{ background: "rgba(252,252,250,0.15)" }}
                  >
                    <ArrowRight />
                  </span>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-[15px] font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  About me <ArrowRight />
                </Link>
              </div>
            </div>

            <div className="md:pt-1">
              {featured ? (
                <FeaturedPost post={featured} />
              ) : (
                <p className="rounded-card border border-hairline bg-surface p-8 text-[15px] text-muted">
                  Chưa có bài viết nào. Bài đầu tiên đang được viết.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Recent posts as a strip that drifts to the right on its own, with
            drag and arrow controls for manual browsing. */}
        {posts.length > 0 && (
          <section className="border-t border-hairline pb-24 pt-12">
            <div className="mb-7 flex items-baseline justify-between">
              <h2 className="font-serif text-[26px] font-medium tracking-[-0.02em] text-ink md:text-[27px]">
                Mới nhất
              </h2>
              <Link href="/blog" className="text-[14px] font-medium text-accent hover:text-accent-hover">
                Xem tất cả
              </Link>
            </div>
            <PostCarousel posts={posts} />
          </section>
        )}
      </div>
    </main>
  );
}
