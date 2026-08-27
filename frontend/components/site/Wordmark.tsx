import Link from "next/link";

// The site name. Plain serif wordmark, no ornament. Shared by Header and
// Footer; no hooks, so it renders fine on the server.
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-serif text-[20px] font-semibold tracking-[-0.01em] text-ink ${className}`}
    >
      AI Engineer Blog
    </Link>
  );
}
