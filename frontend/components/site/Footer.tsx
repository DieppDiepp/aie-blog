import Link from "next/link";
import { NAV_ITEMS } from "./nav";
import { Wordmark } from "./Wordmark";
import { SocialLinks } from "./Social";

// Site footer, shared across every page via the root layout. Links resolve to
// real routes only and grow with NAV_ITEMS as sections ship; no placeholder or
// invented data.
export function Footer() {
  const year = new Date().getFullYear();
  const links = NAV_ITEMS;

  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
              Ghi chép và sơ đồ về việc xây dựng hệ thống AI.
            </p>
            <SocialLinks className="mt-5" />
          </div>

          <nav className="flex flex-col gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.09em] text-muted">
              Explore
            </span>
            {links.map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className="text-[15px] text-ink-body transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-hairline pt-6">
          <span className="font-mono text-[12.5px] text-muted">
            © {year} AI Engineer Blog
          </span>
          <a
            href="#top"
            className="group inline-flex items-center gap-1.5 font-mono text-[12.5px] text-muted transition-colors hover:text-ink"
          >
            Back to top
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 13V4M4 7.5l4-4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
