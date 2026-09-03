import Link from "next/link";
import type { Project } from "@/lib/project-types";
import type { Post } from "@/lib/types";
import { getProjectField, projectHref } from "@/lib/project-types";
import { Thumbnail } from "@/components/post/Thumbnail";
import { TagList } from "@/components/ui/Tag";
import { MetricStrip } from "@/components/project/MetricStrip";
import { formatYearMonth, formatDayMonth, yearOf } from "@/lib/format";

// A project in the author's own list: cover cell, then the same tags and
// metric strip the index uses at the smaller size, then a meta column. The
// meta column carries the date and the chapter count. Reading time was
// removed: a project is read for what it solved, not for how long it takes.
export function AuthorProjectRow({ project, last = false }: { project: Project; last?: boolean }) {
  const field = getProjectField(project.field);

  return (
    <Link
      href={projectHref(project.slug)}
      className={`grid items-stretch transition-colors hover:bg-accent-tint-soft md:grid-cols-[280px_1fr_180px] ${
        last ? "border-b-2 border-rule" : "border-b border-hairline"
      }`}
    >
      <div className="relative min-h-[190px] border-r border-hairline bg-[#cfccc7]">
        <Thumbnail
          src={project.thumbnail}
          alt={`Ảnh dự án ${project.title}`}
          fit="cover"
          className="absolute inset-0"
        />
      </div>

      <div className="px-7 py-6">
        {field && (
          <span className="block text-[9.5px] font-bold uppercase leading-none tracking-[0.2em] text-accent-deep">
            {field.name}
          </span>
        )}
        <h3 className="mt-3 text-[27px] font-bold leading-[1.12] tracking-[-0.025em] text-ink">
          {project.title}
        </h3>
        <p className="mt-2.5 max-w-[560px] font-serif text-[15.5px] leading-relaxed text-muted">
          {project.summary}
        </p>
        <TagList tags={project.tags ?? []} className="mt-3.5" />
        <MetricStrip metrics={project.metrics} size="sm" className="mt-[18px]" />
      </div>

      <div className="flex flex-col items-start justify-between gap-4 border-l border-hairline py-6 pl-5 pr-7">
        <span className="text-[11px] font-semibold uppercase leading-[1.5] tracking-[0.12em] text-muted">
          {formatYearMonth(project.created_at)}
          {project.chapters && (
            <>
              <br />
              {String(project.chapters).padStart(2, "0")} chương
            </>
          )}
        </span>
        <span className="text-[11px] font-bold uppercase leading-none tracking-[0.12em] text-ink">
          Đọc →
        </span>
      </div>
    </Link>
  );
}

// A post in the author's list. Five cells: number, thumbnail, title, tags,
// date. The thumbnail is required by the design (a bare title row read as a
// changelog), and the date sits in the right cell where the reading time used
// to be.
export function AuthorPostRow({
  post,
  index,
  last = false,
}: {
  post: Post;
  index: number;
  last?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`grid items-start gap-[22px] px-14 py-5 transition-colors hover:bg-accent-tint-soft md:grid-cols-[52px_132px_1fr_176px_96px] ${
        last ? "" : "border-b border-hairline"
      }`}
    >
      <span className="pt-1 text-[15px] font-extrabold leading-none tracking-[0.06em] text-[rgba(32,30,29,0.35)]">
        {String(index).padStart(2, "0")}
      </span>
      <span className="relative block h-[88px] w-[132px] border border-rule bg-[#cfccc7]">
        <Thumbnail src={post.thumbnail} alt="" className="absolute inset-0" />
      </span>
      <h3 className="m-0 text-[21px] font-semibold leading-[1.22] tracking-[-0.02em] text-ink">
        {post.title}
      </h3>
      <TagList tags={post.tags ?? []} className="pt-[3px]" />
      <span className="pt-[5px] text-right text-[11px] font-semibold uppercase leading-[1.4] tracking-[0.1em] text-muted">
        {formatDayMonth(post.created_at)}
        <br />
        {yearOf(post.created_at)}
      </span>
    </Link>
  );
}
