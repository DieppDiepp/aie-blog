// Build a table of contents from raw MDX. We derive heading ids with the same
// slugify used by the article's h2/h3 components, so TOC links match anchors.

export type TocItem = { level: 2 | 3; text: string; id: string };

// Turn heading text into an anchor id: strip Vietnamese diacritics, lowercase,
// and collapse anything non-alphanumeric into single dashes.
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, (c) => (c === "đ" ? "d" : "D"))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Extract ## and ### headings, ignoring anything inside fenced code blocks.
export function extractToc(body: string): TocItem[] {
  const items: TocItem[] = [];
  let inFence = false;

  for (const raw of body.split("\n")) {
    const line = raw.trimEnd();
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;
    const level = match[1].length === 2 ? 2 : 3;
    const text = match[2].replace(/\s*#+\s*$/, "").trim();
    items.push({ level: level as 2 | 3, text, id: slugify(text) });
  }

  return items;
}
