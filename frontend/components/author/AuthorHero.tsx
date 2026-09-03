import Image from "next/image";
import type { Author } from "@/lib/authors";
import { SocialLinks } from "@/components/site/Social";

// The author plate: square portrait full-bleed in its column, accent badge in
// the corner, then name, role, live counters and focus chips. The portrait
// keeps its own colors, no grayscale.
export function AuthorHero({
  author,
  postCount,
  projectCount,
}: {
  author: Author;
  postCount: number;
  projectCount: number;
}) {
  const meta = [
    `${String(postCount).padStart(2, "0")} bài viết`,
    `${String(projectCount).padStart(2, "0")} dự án`,
    author.writingSince ? `Viết từ ${author.writingSince}` : null,
  ].filter(Boolean) as string[];

  return (
    <section className="grid border-b-2 border-rule md:grid-cols-[340px_1fr]">
      <div className="relative min-h-[430px] border-r-2 border-rule bg-ink">
        {author.avatar && (
          <Image
            src={author.avatar}
            alt={`Ảnh chân dung của ${author.name}`}
            fill
            priority
            sizes="340px"
            className="object-cover"
          />
        )}
        <span className="absolute bottom-0 left-0 bg-accent px-3 py-2 text-[9.5px] font-bold uppercase leading-none tracking-[0.2em] text-white">
          {author.name}, 2026
        </span>
      </div>

      <div className="flex flex-col px-14 pb-[34px] pt-11 md:pl-[46px]">
        <h1 className="m-0 text-[62px] font-extrabold leading-[0.92] tracking-[-0.045em] text-ink">
          {author.fullName}
        </h1>
        <p className="mt-4 max-w-[540px] font-serif text-[21px] font-light italic leading-[1.5] text-muted">
          {author.role}
        </p>

        <div className="mt-[26px] flex border-t border-hairline pt-4">
          {meta.map((item, i) => (
            <span
              key={item}
              className={`text-[11px] uppercase leading-none tracking-[0.12em] ${
                i === 0
                  ? "pr-5 font-bold text-ink"
                  : "border-l border-hairline px-5 font-medium text-muted"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-[22px] flex flex-wrap gap-[7px]">
          {author.focus.map((item) => (
            <span
              key={item}
              className="whitespace-nowrap px-[9px] py-1.5 text-[10px] font-semibold uppercase leading-none tracking-[0.1em]"
              style={{ border: "1px solid rgba(32,30,29,0.35)", color: "rgba(32,30,29,0.7)" }}
            >
              {item}
            </span>
          ))}
        </div>

        <span className="flex-1" />
        <SocialLinks className="mt-[26px]" />
      </div>
    </section>
  );
}
