"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./nav";
import { Wordmark } from "./Wordmark";
import { TOPICS } from "@/lib/topics";

export type NavPost = { slug: string; title: string };

// Visual-only language toggle. Real i18n comes later; for now it just reflects
// the chosen language so the control looks and feels right.
function LangSwitch() {
  const [lang, setLang] = useState<"VI" | "EN">("VI");
  return (
    <div className="flex items-center rounded-full border border-hairline p-0.5">
      {(["VI", "EN"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`rounded-full px-2.5 py-1 font-mono text-[11px] tracking-[0.04em] transition-colors ${
            lang === code ? "" : "text-muted hover:text-ink"
          }`}
          style={lang === code ? { background: "var(--ink)", color: "var(--bg)" } : undefined}
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
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type MenuEntry = { href: string; title: string; sub?: string };

// A nav item that reveals a dropdown on hover/focus. Content is passed in so the
// same shell serves both the Blog (recent posts) and Topics (fields) menus.
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
        className={`inline-flex items-center gap-1.5 ${
          active ? "text-ink" : "text-muted transition-colors hover:text-ink"
        }`}
      >
        {label}
        <Caret open={open} />
      </Link>

      {entries.length > 0 && (
        <div
          role="menu"
          className={`absolute right-0 top-full pt-3 transition-all duration-150 ${
            open
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0"
          }`}
        >
          <div
            className={`${width} rounded-card border border-hairline bg-surface p-2 shadow-[0_16px_40px_-24px_rgba(22,24,29,0.28)]`}
          >
            {entries.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                role="menuitem"
                className="block rounded-[9px] px-3 py-2 transition-colors hover:bg-[rgba(47,95,224,0.06)]"
              >
                <span className="block font-serif text-[15.5px] leading-snug text-ink-body">
                  {entry.title}
                </span>
                {entry.sub && (
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">
                    {entry.sub}
                  </span>
                )}
              </Link>
            ))}
            <Link
              href={footer.href}
              role="menuitem"
              className="mt-1 block border-t border-hairline px-3 pb-1 pt-2.5 text-[13.5px] font-medium text-accent transition-colors hover:text-accent-hover"
            >
              {footer.label}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Top navigation bar. Sticky, English labels, with real dropdowns under Blog
// (recent posts) and Topics (fields).
export function Header({ posts = [] }: { posts?: NavPost[] }) {
  const pathname = usePathname();

  return (
    <header
      id="top"
      className="sticky top-0 z-40 border-b border-hairline backdrop-blur-md"
      style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Wordmark />
        <div className="flex items-center gap-5 md:gap-7">
          <nav className="flex items-center gap-6 text-[15px] md:gap-8">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);

              if (item.menu === "blog") {
                return (
                  <NavDropdown
                    key={item.href}
                    label={item.label}
                    href={item.href}
                    active={active}
                    width="w-[320px]"
                    entries={posts.slice(0, 5).map((p) => ({
                      href: `/blog/${p.slug}`,
                      title: p.title,
                    }))}
                    footer={{ href: "/blog", label: "View all posts" }}
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
                    width="w-[300px]"
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
                  className={
                    active ? "text-ink" : "text-muted transition-colors hover:text-ink"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <LangSwitch />
        </div>
      </div>
    </header>
  );
}
