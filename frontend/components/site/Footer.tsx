import Link from "next/link";
import { NAV_ITEMS } from "./nav";
import { Wordmark } from "./Wordmark";
import { SocialLinks } from "./Social";
import { TOPICS } from "@/lib/topics";

// Site footer, shared across every page via the root layout. A solid ink field
// that touches the page edges: no top margin, no border, nothing floating.
// Links resolve to real routes only and grow with NAV_ITEMS as sections ship.
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink px-14 pb-[26px] pt-11 text-ink-invert">
      <div className="grid gap-11 border-b border-[rgba(243,242,242,0.22)] pb-[30px] md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark size="text-[22px]" className="leading-[0.9] text-ink-invert" />
          <p className="mt-3.5 max-w-[280px] font-serif text-[15px] leading-relaxed text-[rgba(243,242,242,0.65)]">
            Ghi chép và sơ đồ về việc xây dựng hệ thống AI.
          </p>
          <SocialLinks tone="dark" className="mt-[18px]" />
        </div>

        <nav className="flex flex-col gap-2.5">
          <span className="text-[9.5px] font-bold uppercase leading-none tracking-[0.2em] text-[rgba(243,242,242,0.5)]">
            Explore
          </span>
          {NAV_ITEMS.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className="text-[14px] font-medium leading-none text-ink-invert transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <nav className="flex flex-col gap-2.5">
          <span className="text-[9.5px] font-bold uppercase leading-none tracking-[0.2em] text-[rgba(243,242,242,0.5)]">
            Chủ đề
          </span>
          {TOPICS.slice(0, 3).map((topic) => (
            <Link
              key={topic.slug}
              href={`/topics/${topic.slug}`}
              className="text-[14px] font-medium leading-none text-ink-invert transition-colors hover:text-accent"
            >
              {topic.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center justify-between pt-5">
        <span className="text-[11px] font-semibold uppercase leading-none tracking-[0.1em] text-[rgba(243,242,242,0.5)]">
          © {year} AI Engineer Blog,{" "}
          <Link href="/authors/nguyen" className="transition-colors hover:text-ink-invert">
            Nguyên
          </Link>
        </span>
        <a
          href="#top"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase leading-none tracking-[0.1em] text-[rgba(243,242,242,0.5)] transition-colors hover:text-ink-invert"
        >
          Back to top
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 13V4M4 7.5l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
