"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./nav";
import { Wordmark } from "./Wordmark";
import { TOPICS } from "@/lib/topics";
import { SITE_STRAPLINE } from "@/lib/site";

export type NavPost = { slug: string; title: string };

// Visual-only language toggle. Real i18n comes later; for now it just reflects
// the chosen language. Two square cells, flush against each other, no outer
// frame: the ink strip behind them is the frame.
function LangSwitch() {
  const [lang, setLang] = useState<"VI" | "EN">("VI");
  return (
    <div className="flex items-center">
      {(["VI", "EN"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-2 py-[5px] text-[10px] uppercase leading-none tracking-[0.14em] transition-colors ${
            lang === code
              ? "bg-accent font-bold text-white"
              : "font-semibold text-[rgba(243,242,242,0.55)] hover:text-ink-invert"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

const NAV_LINK = "pb-1.5 text-[11px] uppercase leading-none tracking-[0.14em] transition-colors";
const NAV_ON = "border-b-2 border-accent font-bold text-ink";
const NAV_OFF = "border-b-2 border-transparent font-medium text-muted hover:text-ink";

type MenuEntry = { href: string; title: string; sub?: string };

// A nav item that reveals a dropdown on hover/focus. Content is passed in so the
// same shell serves both the Blog (recent posts) and Topics (fields) menus.
// The panel is a 2px-framed square block with no shadow: nothing floats here.
function NavDropdown({
  label,
  href,
  active,
  entries,
  footer,
  width,
}: {
  label: string;
  href: string;
  active: boolean;
  entries: MenuEntry[];
  footer: { href: string; label: string };
  width: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Link
        href={href}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-current={active ? "page" : undefined}
        className={`inline-flex items-center gap-1.5 ${NAV_LINK} ${active ? NAV_ON : NAV_OFF}`}
      >
        {label}
        <Caret open={open} />
      </Link>

      {entries.length > 0 && (
        <div
          role="menu"
          className={`absolute right-0 top-full z-50 pt-4 transition-all duration-150 ${
            open
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0"
          }`}
        >
          <div className={`${width} border-2 border-rule bg-bg p-1.5`}>
            {entries.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                role="menuitem"
                className="block px-3 py-2 transition-colors hover:bg-accent-tint-soft"
              >
                <span className="block text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                  {entry.title}
                </span>
                {entry.sub && (
                  <span className="mt-1 block font-serif text-[13.5px] leading-snug text-muted">
                    {entry.sub}
                  </span>
                )}
              </Link>
            ))}
            <Link
              href={footer.href}
              role="menuitem"
              className="mt-1 block border-t border-hairline px-3 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-deep transition-colors hover:text-accent"
            >
              {footer.label}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Top navigation. An ink strip carries the strapline and the language toggle,
// then the masthead row with the two-line wordmark and the nav. Both are
// sticky, and the header sits on an opaque ground: no blur, nothing floats.
// Below them is the double rule (2px + gap + 1px) that reads as newsprint.
export function Header({ posts = [] }: { posts?: NavPost[] }) {
  const pathname = usePathname();

  return (
    <div id="top" className="sticky top-0 z-40">
      <div className="flex items-center justify-between bg-ink px-14 py-2 text-ink-invert">
        <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.18em]">
          {SITE_STRAPLINE}
        </span>
        <LangSwitch />
      </div>

      <header className="flex items-end justify-between border-b-2 border-rule bg-bg px-14 pb-[18px] pt-6">
        <Wordmark className="text-ink" />
        <nav className="flex items-end gap-8 pb-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);

            if (item.menu === "blog") {
              return (
                <NavDropdown
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  active={active}
                  width="w-[340px]"
                  entries={posts.slice(0, 5).map((p) => ({
                    href: `/blog/${p.slug}`,
                    title: p.title,
                  }))}
                  footer={{ href: "/blog", label: "Xem tất cả bài viết" }}
                />
              );
            }

            if (item.menu === "topics") {
              return (
                <NavDropdown
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  active={active}
                  width="w-[320px]"
                  entries={TOPICS.map((t) => ({
                    href: `/topics/${t.slug}`,
                    title: t.name,
                    sub: t.blurb,
                  }))}
                  footer={{ href: "/topics", label: "Tất cả chủ đề" }}
                />
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${NAV_LINK} ${active ? NAV_ON : NAV_OFF}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* the second line of the double rule */}
      <div className="h-0.5 border-b border-rule bg-bg" />
    </div>
  );
}
