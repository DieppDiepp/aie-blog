import Link from "next/link";

// The breadcrumb strip that sits directly under the header rule on article,
// topic and tag pages. One row, 1px bottom rule, accent slash separators.
export function Breadcrumb({
  trail,
  current,
}: {
  trail: { href: string; label: string }[];
  current: string;
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-hairline px-14 py-2.5">
      {trail.map((item) => (
        <span key={item.href} className="flex items-center gap-2.5">
          <Link
            href={item.href}
            className="text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-muted transition-colors hover:text-ink"
          >
            {item.label}
          </Link>
          <span aria-hidden className="text-accent-deep">
            /
          </span>
        </span>
      ))}
      <span className="truncate text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-ink">
        {current}
      </span>
    </div>
  );
}
