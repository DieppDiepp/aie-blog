import Link from "next/link";
import type { Post } from "@/lib/types";
import { Tag, TagList } from "@/components/ui/Tag";
import { Thumbnail } from "@/components/post/Thumbnail";
import { formatDayMonth, formatDotDate, readingTimeMinutes, yearOf } from "@/lib/format";

// Post lists in this design are tables, not cards: a row of aligned columns
// divided by 1px rules, with the whole row tinting on hover. Three shapes are
// used across the site.

// The home page row: date, cover, title with summary and tags, reading time.
export function PostRow({ post }: { post: Post }) {
  const tags = post.tags ?? [];
  const minutes = readingTimeMinutes(post.body);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="grid grid-cols-[96px_150px_1fr_108px] items-start gap-7 border-b border-hairline px-14 py-[22px] transition-colors last:border-b-0 hover:bg-accent-tint-soft"
    >
      <span className="pt-1 text-[11px] font-semibold uppercase leading-[1.3] tracking-[0.1em] text-muted">
        {formatDayMonth(post.created_at)}
        <br />
        {yearOf(post.created_at)}
      </span>
      <div className="h-[88px] border border-[rgba(32,30,29,0.3)]">
        <Thumbnail src={post.thumbnail} alt={post.title} />
      </div>
      <div>
        <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink">
          {post.title}
        </h3>
        {post.summary && (
          <p className="mt-2 max-w-[520px] font-serif text-[15px] leading-relaxed text-muted">
            {post.summary}
          </p>
        )}
        <TagList tags={tags} className="mt-3" />
      </div>
      <span className="whitespace-nowrap pt-1 text-right text-[11px] font-bold uppercase leading-[1.4] tracking-[0.1em] text-ink">
        {minutes} phút
        <br />
        <span className="text-accent-deep">Đọc</span>
      </span>
    </Link>
  );
}

// The blog index row: a numbered variant, with the tag column split out so the
// five rows read as an ordered table.
export function NumberedRow({ post, index }: { post: Post; index: number }) {
  const tags = post.tags ?? [];
  const minutes = readingTimeMinutes(post.body);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="grid grid-cols-[52px_100px_1fr_200px_96px] items-start gap-6 border-b border-hairline px-14 py-6 transition-colors last:border-b-0 hover:bg-accent-tint-soft"
    >
      <span className="pt-[5px] text-[15px] font-extrabold leading-none tracking-[0.06em] text-[rgba(32,30,29,0.35)]">
        {String(index).padStart(2, "0")}
      </span>
      <span className="pt-1.5 text-[11px] font-semibold uppercase leading-[1.4] tracking-[0.1em] text-muted">
        {formatDayMonth(post.created_at)}
        <br />
        {yearOf(post.created_at)}
      </span>
      <div>
        <h3 className="text-[23px] font-semibold leading-tight tracking-[-0.02em] text-ink">
          {post.title}
        </h3>
        {post.summary && (
          <p className="mt-2 max-w-[520px] font-serif text-[15px] leading-relaxed text-muted">
            {post.summary}
          </p>
        )}
      </div>
      <TagList tags={tags} className="pt-1" />
      <span className="whitespace-nowrap pt-[5px] text-right text-[11px] font-bold uppercase leading-none tracking-[0.1em] text-ink">
        {minutes} phút
      </span>
    </Link>
  );
}

// The topic page row: the tightest of the three, date and title and time only.
export function CompactRow({ post }: { post: Post }) {
  const minutes = readingTimeMinutes(post.body);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="grid grid-cols-[100px_1fr_120px] items-baseline gap-6 border-b border-hairline px-14 py-5 transition-colors last:border-b-0 hover:bg-accent-tint-soft"
    >
      <span className="whitespace-nowrap text-[11px] font-semibold uppercase leading-none tracking-[0.1em] text-muted">
        {formatDotDate(post.created_at)}
      </span>
      <span className="text-[21px] font-semibold leading-tight tracking-[-0.02em] text-ink">
        {post.title}
      </span>
      <span className="whitespace-nowrap text-right text-[11px] font-bold uppercase leading-none tracking-[0.1em] text-ink">
        {minutes} phút
      </span>
    </Link>
  );
}

// The lead post on the blog index: two columns, cover on the right, and a meta
// rule under the copy. Not a card, a spread.
export function LeadPost({ post }: { post: Post }) {
  const tags = post.tags ?? [];
  const minutes = readingTimeMinutes(post.body);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="grid border-b-2 border-rule md:grid-cols-[1.05fr_1fr]"
    >
      <div className="px-14 py-9">
        <span className="block text-[12px] font-extrabold leading-none tracking-[0.18em] text-accent-deep">
          01
        </span>
        <h2 className="mt-3.5 text-[38px] font-bold leading-[1.06] tracking-[-0.03em] text-ink">
          {post.title}
        </h2>
        {post.summary && (
          <p className="mt-3.5 max-w-[480px] font-serif text-[17px] leading-relaxed text-muted">
            {post.summary}
          </p>
        )}
        <TagList tags={tags} className="mt-5" />
        <div className="mt-6 flex items-center gap-4 border-t border-hairline pt-4">
          <span className="text-[11px] font-semibold uppercase leading-none tracking-[0.12em] text-muted">
            {formatDotDate(post.created_at)}
          </span>
          <span className="text-[11px] font-semibold uppercase leading-none tracking-[0.12em] text-muted">
            {minutes} phút
          </span>
          <span className="text-[11px] font-bold uppercase leading-none tracking-[0.12em] text-accent-deep">
            Đọc bài này
          </span>
        </div>
      </div>
      <div className="min-h-[340px] border-l-2 border-rule">
        <Thumbnail src={post.cover} alt={post.title} fit="cover" priority />
      </div>
    </Link>
  );
}
