import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import { PROJECT_FIELDS, projectsForField } from "@/lib/project-types";
import { AUTHORS } from "@/lib/authors";
import { FieldBand } from "@/components/project/FieldBand";
import { ProjectFilterRail } from "@/components/project/ProjectFilterRail";
import { ProjectRow } from "@/components/project/ProjectRow";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Các dự án được kể lại như một bài trình bày: vấn đề thực tế, những cách đã có, giả thuyết, ràng buộc kỹ thuật và kiến trúc đã chọn.",
  alternates: { canonical: "/projects" },
};

// The index. Grouped by field: one ink band per field that has projects, then
// its rows, alternating cover side. Fields with nothing in them appear in the
// filter rail only.
export default async function ProjectsPage() {
  const projects = await getAllProjects();
  const activeFields = PROJECT_FIELDS.filter((f) => projectsForField(projects, f).length > 0);

  let rowIndex = 0;

  return (
    <main>
      <section className="grid border-b-2 border-rule md:grid-cols-[1fr_320px]">
        <div className="border-r-2 border-rule px-14 pb-[38px] pt-12">
          <h1 className="m-0 text-[74px] font-extrabold leading-[0.9] tracking-[-0.045em] text-ink">
            Projects
          </h1>
          <p className="mt-5 max-w-[600px] font-serif text-[21px] font-light italic leading-[1.5] text-muted">
            Nơi các tác giả của blog kể lại dự án mình đã làm: vấn đề thực tế,
            những cách đã có, giả thuyết, rồi ràng buộc kỹ thuật và kiến trúc đã
            chọn.
          </p>
          <div className="mt-[30px] flex border-t border-hairline pt-4">
            <span className="pr-5 text-[11px] font-bold uppercase leading-none tracking-[0.12em] text-ink">
              {String(projects.length).padStart(2, "0")} dự án
            </span>
            <span className="border-l border-hairline px-5 text-[11px] font-medium uppercase leading-none tracking-[0.12em] text-muted">
              {String(activeFields.length).padStart(2, "0")} lĩnh vực
            </span>
            <span className="border-l border-hairline px-5 text-[11px] font-medium uppercase leading-none tracking-[0.12em] text-muted">
              {String(AUTHORS.length).padStart(2, "0")} tác giả
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-between px-7 py-[26px]">
          <span className="font-serif text-[15px] leading-relaxed text-muted">
            Mỗi bài đi theo tám chương cố định, nên hai dự án của hai tác giả khác
            nhau vẫn đọc được cùng một nhịp.
          </span>
          <Button href="/about" variant="primary" className="self-start">
            Gửi dự án của bạn
          </Button>
        </div>
      </section>

      <ProjectFilterRail projects={projects} fields={PROJECT_FIELDS} />

      {activeFields.map((field, i) => (
        <section key={field.slug}>
          <FieldBand index={i + 1} name={field.name} />
          {projectsForField(projects, field).map((project) => {
            const flip = rowIndex++ % 2 === 1;
            return (
              <Reveal key={project.slug}>
                <ProjectRow project={project} flip={flip} />
              </Reveal>
            );
          })}
        </section>
      ))}

      {projects.length === 0 && (
        <div className="border-b-2 border-rule px-14 py-16">
          <p className="m-0 max-w-[560px] font-serif text-[19px] leading-relaxed text-muted">
            Chưa có dự án nào được đăng. Bài đầu tiên đang được viết.
          </p>
        </div>
      )}

      {/* Pagination placeholder. Real paging arrives when there are enough
          projects (and the DB-backed list lands); for now every cell points
          back at /projects. Kept as a visual so the page foot reads as an
          index, not a dead end. */}
      <nav
        aria-label="Phân trang dự án"
        className="flex items-stretch border-b-2 border-rule"
      >
        <span className="flex items-center whitespace-nowrap border-r border-hairline pl-14 pr-5 text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-muted">
          Trang
        </span>
        {Array.from({ length: 9 }, (_, i) => i + 1).map((page) => {
          const current = page === 1;
          return (
            <Link
              key={page}
              href="/projects"
              aria-current={current ? "page" : undefined}
              className={`flex min-w-[46px] items-center justify-center border-r border-hairline px-[18px] py-3.5 text-[12px] font-bold uppercase leading-none tracking-[0.1em] transition-colors ${
                current
                  ? "bg-ink text-ink-invert"
                  : "text-ink hover:bg-[color-mix(in_srgb,var(--accent)_7%,var(--bg))]"
              }`}
            >
              {String(page).padStart(2, "0")}
            </Link>
          );
        })}
        <span className="flex-1" />
        <Link
          href="/projects"
          className="flex items-center gap-2 whitespace-nowrap border-l border-hairline pl-5 pr-14 text-[11px] font-bold uppercase leading-none tracking-[0.12em] text-accent-deep transition-colors hover:text-accent"
        >
          Trang sau →
        </Link>
      </nav>
    </main>
  );
}
