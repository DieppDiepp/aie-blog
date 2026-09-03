import type { PostTag } from "@/lib/types";

// Square chip, zero radius. "topic" is a neutral outlined knowledge tag; the
// difficulty variants carry a tint, and only "hard" is a solid accent field.
// Colors come from tokens.css. whitespace-nowrap is required: a wrapped chip
// breaks the row rhythm and shows up in print and PNG exports.
const VARIANT_STYLE: Record<NonNullable<PostTag["variant"]>, React.CSSProperties> = {
  topic: { border: "1px solid rgba(32,30,29,0.35)", color: "rgba(32,30,29,0.7)" },
  easy: { background: "var(--tag-easy-bg)", color: "var(--tag-easy-fg)" },
  mid: { background: "var(--tag-mid-bg)", color: "var(--tag-mid-fg)" },
  hard: { background: "var(--tag-hard-bg)", color: "var(--tag-hard-fg)" },
};

export function Tag({ label, variant = "topic" }: PostTag) {
  const weight = variant === "topic" ? "font-semibold" : "font-bold";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap px-2 py-[5px] text-[10px] uppercase leading-none tracking-[0.1em] ${weight}`}
      style={VARIANT_STYLE[variant]}
    >
      {label}
    </span>
  );
}

// Convenience row for a list of tags.
export function TagList({ tags, className = "" }: { tags: PostTag[]; className?: string }) {
  if (tags.length === 0) return null;
  return (
    <div className={`flex flex-wrap items-center gap-[7px] ${className}`}>
      {tags.map((tag) => (
        <Tag key={tag.label} {...tag} />
      ))}
    </div>
  );
}
