import Link from "next/link";
import type { Project, ProjectField } from "@/lib/project-types";
import { projectsForField } from "@/lib/project-types";

// One unbroken rail, same pattern as the blog filter. Counts are live and an
// empty field is dimmed rather than hidden. The links are real routes only if
// you add /projects/field/<slug>; until then they point back at /projects and
// the rail reads as a map, which is what the design does.
export function ProjectFilterRail({
  projects,
  fields,
}: {
  projects: Project[];
  fields: ProjectField[];
}) {
  return (
    <nav aria-label="Lọc theo lĩnh vực" className="flex items-stretch border-b-2 border-rule">
      <span className="flex items-center whitespace-nowrap border-r border-hairline pl-14 pr-5 text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-muted">
        Lĩnh vực
      </span>
      <span className="flex items-center whitespace-nowrap bg-ink px-[18px] py-3.5 text-[11px] font-bold uppercase leading-none tracking-[0.12em] text-ink-invert">
        Tất cả {projects.length}
      </span>
      {fields.map((field) => {
        const count = projectsForField(projects, field).length;
        return (
          <Link
            key={field.slug}
            href="/projects"
            className={`flex items-center whitespace-nowrap border-r border-hairline px-[18px] py-3.5 text-[11px] font-semibold uppercase leading-none tracking-[0.12em] transition-colors ${
              count > 0 ? "text-ink hover:bg-accent-tint" : "text-[rgba(32,30,29,0.4)]"
            }`}
          >
            {field.name} {count}
          </Link>
        );
      })}
      <span className="flex-1" />
      <span className="flex items-center whitespace-nowrap border-l border-hairline pl-5 pr-14 text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-muted">
        Mới nhất trước
      </span>
    </nav>
  );
}
