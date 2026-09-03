import Link from "next/link";

// Square buttons, zero radius, uppercase label flush left. "primary" is the one
// accent field allowed on most pages; "outline" is a 2px ink frame that fills
// with ink on hover; "invert" sits on an ink field.
const VARIANTS = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  outline: "border-2 border-ink text-ink hover:bg-ink hover:text-ink-invert",
  invert: "bg-ink text-ink-invert hover:bg-accent",
} as const;

export function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  withArrow = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  withArrow?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-3 whitespace-nowrap px-[18px] py-[15px] text-[12px] font-bold uppercase leading-none tracking-[0.12em] transition-colors ${VARIANTS[variant]} ${className}`}
    >
      {children}
      {withArrow && <ArrowRight />}
    </Link>
  );
}
