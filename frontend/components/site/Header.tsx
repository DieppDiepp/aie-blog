import Link from "next/link";

const NAV = [
  { href: "/brain", label: "Viết" },
  { href: "/brain", label: "Brain" },
  { href: "/", label: "Đồ án" },
  { href: "/", label: "Giới thiệu" },
];

// Top navigation. Minimal wordmark plus a few links, kept airy.
export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-7 md:px-10">
      <Link
        href="/"
        className="font-serif text-[21px] font-semibold tracking-[-0.01em] text-ink"
      >
        Nguyên
      </Link>
      <nav className="flex items-center gap-8 text-[15px] text-muted md:gap-9">
        {NAV.map((item, i) => (
          <Link
            key={`${item.label}-${i}`}
            href={item.href}
            className={i === 0 ? "text-ink" : "transition-colors hover:text-ink"}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
