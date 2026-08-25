import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { Header } from "@/components/site/Header";
import { FeaturedPost, PostRow } from "@/components/post/PostCard";

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
  const [featured, ...rest] = posts;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 md:px-10">
        {/* Hero */}
        <section className="relative py-24 md:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(130% 95% at 90% 6%, rgba(47,95,224,0.11), rgba(47,95,224,0) 50%)",
            }}
          />
          <div className="relative">
            <h1 className="max-w-3xl text-balance font-serif text-[44px] font-medium leading-[1.02] tracking-[-0.025em] text-ink md:text-[68px]">
              Ghi lại cách tôi <em style={{ fontStyle: "italic" }}>nghĩ</em> về
              việc xây dựng hệ thống AI.
            </h1>
            <p className="mt-8 max-w-xl text-[18px] leading-relaxed text-muted md:text-[19px]">
              Một khu vườn số cho ghi chú, bài viết và sơ đồ kiến trúc, được nối
              với nhau như một đồ thị tri thức thay vì một danh sách phẳng.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/brain"
                className="inline-flex items-center gap-3 rounded-[11px] bg-ink py-[11px] pl-[22px] pr-[11px] text-[15px] font-medium transition-opacity hover:opacity-90"
                style={{ color: "var(--bg)" }}
              >
                Đọc bài mới nhất
                <span
                  className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full"
                  style={{ background: "rgba(252,252,250,0.15)" }}
                >
                  <ArrowRight />
                </span>
              </Link>
              <Link
                href="/brain"
                className="inline-flex items-center gap-2 text-[15px] font-medium text-accent transition-colors hover:text-accent-hover"
              >
                Khám phá Brain <ArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* Latest writing */}
        <section className="pb-24">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-serif text-[26px] font-medium tracking-[-0.02em] text-ink md:text-[27px]">
              Bài viết gần đây
            </h2>
            <Link href="/brain" className="text-[14px] font-medium text-accent hover:text-accent-hover">
              Xem tất cả
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className="rounded-card border border-hairline bg-surface p-8 text-[15px] text-muted">
              Chưa có bài viết nào. Bài đầu tiên đang được viết.
            </p>
          ) : (
            <>
              {featured && <FeaturedPost post={featured} />}
              {rest.length > 0 && (
                <div className="mt-1.5">
                  {rest.map((post) => (
                    <PostRow key={post.slug} post={post} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
