// Post thumbnail. Renders the real image when a post supplies `src`, otherwise
// a calm placeholder box so layouts can be tuned before art exists. Swap in a
// real image later by setting `thumbnail` in a post's frontmatter.
export function Thumbnail({
  src,
  alt = "",
  className = "",
  rounded = "rounded-[12px]",
}: {
  src?: string;
  alt?: string;
  className?: string;
  rounded?: string;
}) {
  const base = `relative overflow-hidden ${rounded} ${className}`;

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`${base} h-full w-full object-cover`} />;
  }

  return (
    <div
      aria-hidden
      className={`${base} flex items-center justify-center border border-hairline`}
      style={{
        background:
          "linear-gradient(135deg, rgba(47,95,224,0.06), rgba(47,95,224,0.02) 60%), var(--surface)",
      }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2.5"
          stroke="var(--muted)"
          strokeWidth="1.3"
          opacity="0.5"
        />
        <circle cx="8.5" cy="9.5" r="1.6" fill="var(--muted)" opacity="0.5" />
        <path
          d="M4 17l5-4 4 3 3-2 4 3"
          stroke="var(--muted)"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
