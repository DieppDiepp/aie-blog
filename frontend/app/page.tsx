import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { TOPICS, postsForTopic } from "@/lib/topics";
import { PostRow } from "@/components/post/PostCard";
import { MastheadFeature } from "@/components/post/MastheadFeature";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Grain } from "@/components/ui/Grain";
import { readingTimeMinutes } from "@/lib/format";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const posts = await getAllPosts();
  const [featured, ...rest] = posts;
  const latest = posts.slice(0, 4);
  const totalMinutes = posts.reduce((sum, p) => sum + readingTimeMinutes(p.body), 0);
  void rest;

  return (
    <main>
      {/* Masthead. Two columns divided by a 2px rule: the statement on the
          left, the featured cover running full-bleed on the right. */}
      <section className="relative grid border-b-2 border-rule lg:grid-cols-[1.32fr_1fr]">
        <Grain />
        <div className="relative border-r-2 border-rule px-14 pb-10 pt-[52px]">
          <span aria-hidden className="mb-6 block h-0.5 w-[26px] bg-accent" />
          <h1 className="text-[64px] font-extrabold leading-[0.94] tracking-[-0.035em] text-ink">
            Xây hệ thống AI,
            <br />
            và nghĩ thành tiếng.
          </h1>
          <p className="mt-5 max-w-[440px] font-serif text-[21px] font-light italic leading-[1.5] text-muted [text-wrap:pretty]">
            Bài viết, ghi chú và sơ đồ kiến trúc về cách mình xây dựng và vận hành
            các hệ thống AI trong thực tế.
          </p>
          <div className="mt-8 flex items-stretch gap-3.5">
            <Button href={featured ? `/blog/${featured.slug}` : "/blog"} withArrow>
              Đọc bài mới nhất
            </Button>
            <Button href="/about" variant="outline">
              Về mình
            </Button>
          </div>
        </div>

        {/* Featured slot: cycles through recent posts every 5s, cover filling
            the frame with no dark overlay. */}
        <MastheadFeature
          posts={posts.map((p) => ({ slug: p.slug, title: p.title, cover: p.cover }))}
        />
      </section>

      {/* Counters, computed from the real post set. */}
      <section className="grid grid-cols-2 border-b-2 border-rule md:grid-cols-4">
        <Counter value={String(posts.length).padStart(2, "0")} label="Bài viết" first />
        <Counter value={String(TOPICS.length).padStart(2, "0")} label="Chủ đề" />
        <Counter value={String(totalMinutes)} label="Phút đọc" />
        <Counter value="VI/EN" label="Song ngữ" accent last />
      </section>

      {/* Latest posts, as a table. */}
      <Reveal as="section">
        <div className="flex items-baseline justify-between border-b border-rule px-14 pb-3 pt-11">
          <h2 className="text-[26px] font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">
            Mới nhất
          </h2>
          <Link
            href="/blog"
            className="text-[11px] font-bold uppercase leading-none tracking-[0.14em] text-accent-deep transition-colors hover:text-accent"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="border-b-2 border-rule">
          {latest.length === 0 ? (
            <p className="px-14 py-14 font-serif text-[17px] italic text-muted">
              Chưa có bài viết nào. Bài đầu tiên đang được viết.
            </p>
          ) : (
            latest.map((post) => <PostRow key={post.slug} post={post} />)
          )}
        </div>
      </Reveal>

      {/* Topics. 1px gaps on a hairline ground, so the gaps read as rules. */}
      <Reveal as="section">
        <h2 className="px-14 pb-5 pt-11 text-[26px] font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">
          Chủ đề
        </h2>
        <div className="mx-14 grid gap-px border-y-2 border-rule bg-hairline md:grid-cols-3">
          {TOPICS.map((topic, i) => {
            const count = postsForTopic(posts, topic).length;
            return (
              <Link key={topic.slug} href={`/topics/${topic.slug}`} className="block bg-bg p-[22px]">
                <span className="block text-[11px] font-extrabold leading-none tracking-[0.16em] text-[rgba(32,30,29,0.45)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-3 block text-[19px] font-bold leading-tight tracking-[-0.02em] text-ink">
                  {topic.name}
                </span>
                <span className="mt-2 block font-serif text-[14px] leading-relaxed text-muted">
                  {topic.blurb}
                </span>
                <span className="mt-3.5 block text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-muted">
                  {count > 0 ? `${count} bài` : "Đang cập nhật"}
                </span>
              </Link>
            );
          })}
        </div>
      </Reveal>

      {/* The poster band: the single accent field on the site. */}
      <Reveal as="section">
        <div className="relative mt-13 overflow-hidden bg-accent px-14 py-14 text-white">
          <Grain opacity={0.6} />
          <div className="relative grid items-end gap-12 md:grid-cols-[1.5fr_1fr]">
            <p className="max-w-[620px] text-[44px] font-extrabold leading-[1.02] tracking-[-0.035em] [text-wrap:balance]">
              Nếu một bài giúp bạn đỡ mất thời gian hơn mình, vậy là nó đã làm xong
              việc của nó.
            </p>
            <div className="text-right">
              <Button href="/about" variant="invert">
                Về mình →
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </main>
  );
}

function Counter({
  value,
  label,
  accent = false,
  first = false,
  last = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`px-5 py-4 ${first ? "pl-14" : "border-l border-hairline"} ${last ? "md:pr-14" : ""}`}
    >
      <span
        className={`block text-[26px] font-extrabold leading-none ${accent ? "text-accent" : "text-ink"}`}
      >
        {value}
      </span>
      <span className="mt-[5px] block text-[9.5px] font-semibold uppercase leading-none tracking-[0.18em] text-muted">
        {label}
      </span>
    </div>
  );
}
