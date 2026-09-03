import Link from "next/link";

// The site name, set as a two-line uppercase block in the display face. The
// nowrap is load-bearing: without it "AI ENGINEER" wraps at narrow widths and
// the 2px header rule clips the descenders.
export function Wordmark({
  className = "",
  size = "text-[34px]",
}: {
  className?: string;
  size?: string;
}) {
  return (
    <Link
      href="/"
      className={`block whitespace-nowrap font-sans ${size} font-extrabold uppercase leading-[0.86] tracking-[-0.03em] ${className}`}
    >
      AI Engineer
      <br />
      Blog
    </Link>
  );
}
