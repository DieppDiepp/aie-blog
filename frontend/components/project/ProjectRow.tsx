import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/project-types";
import { projectHref } from "@/lib/project-types";
import { getAuthor } from "@/lib/authors";
import { Thumbnail } from "@/components/post/Thumbnail";
import { TagList } from "@/components/ui/Tag";
import { MetricStrip } from "@/components/project/MetricStrip";
import { formatYearMonth } from "@/lib/format";

// A byline cell: square avatar, author name, then meta separated by 1px rules.
// The author's ROLE is deliberately not here. It lives on the author page, and
// repeating it in every row was noise.
function Byline({ project }: { project: Project }) {
  const author = getAuthor(project.author);
  const meta = [
    formatYearMonth(project.created_at),
    project.chapters ? `${String(project.chapters).padStart(2, "0")} chương` : null,
    project.artifacts ?? null,
  ].filter(Boolean) as string[];

  return (
    <div className="mt-5 flex items-center gap-3.5">
      <span className="relative block h-[30px] w-[30px] shrink-0 border border-rule bg-[var(--bg)]">
        {author?.avatar && (
          <Image
            src={author.avatar}
            alt={`Ảnh của ${author.name}`}
            fill
            sizes="30px"
            className="object-cover"
          />
        )}
      </span>
      <span className="text-[11px] font-bold uppercase leading-none tracking-[0.12em] text-ink">
        {author?.name ?? project.author}
      </span>
      {meta.map((item) => (
        <span
          key={item}
          className="border-l border-hairline pl-3.5 text-[11px] font-medium uppercase leading-none tracking-[0.12em] text-[rgba(32,30,29,0.5)]"
        >
          {item}
        </span>
      ))}
      <span className="flex-1" />
      <span className="text-[11px] font-bold uppercase leading-none tracking-[0.12em] text-accent-deep">
        Đọc dự án →
      </span>
    </div>
  );
}

// A project on the index: full-bleed row, text on one side and the cover on
// the other. `flip` puts the cover first, and the index alternates so the page
// keeps a rhythm. No card, no shadow: the 2px bottom rule is the container.
export function ProjectRow({ project, flip = false }: { project: Project; flip?: boolean }) {
  const text = (
    <div className={`flex flex-col ${flip ? "px-14 pb-[30px] pt-[34px] md:pl-10" : "px-10 pb-[30px] pt-[34px] md:pl-14"}`}>
      <TagList tags={project.tags ?? []} />
      <h3 className="mt-4 max-w-[520px] text-[40px] font-bold leading-[1.04] tracking-[-0.035em] text-ink">
        {project.title}
      </h3>
      <p className="mt-3.5 max-w-[500px] font-serif text-[17px] leading-relaxed text-muted">
        {project.summary}
      </p>
      <MetricStrip metrics={project.metrics} className="mt-6" />
      <Byline project={project} />
    </div>
  );

  const cover = (
    <div
      className={`relative min-h-[420px] bg-[#cfccc7] ${flip ? "border-r-2" : "border-l-2"} border-rule`}
    >
      <Thumbnail
        src={project.cover}
        alt={`Ảnh bìa dự án ${project.title}`}
        fit="cover"
        className="absolute inset-0"
      />
    </div>
  );

  return (
    <Link
      href={projectHref(project.slug)}
      className="grid border-b-2 border-rule md:grid-cols-[1.05fr_1fr]"
    >
      {flip ? (
        <>
          {cover}
          {text}
        </>
      ) : (
        <>
          {text}
          {cover}
        </>
      )}
    </Link>
  );
}
