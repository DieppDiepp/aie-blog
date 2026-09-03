// Format an ISO timestamp as "YYYY.MM" for compact post meta.
export function formatYearMonth(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}.${month}`;
}

// Format an ISO timestamp as "DD.MM" and "YYYY", the two-line date used in the
// left column of every post list. Dots, never a middot.
export function formatDayMonth(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}

// Format an ISO timestamp as "DD.MM.YYYY" for single-line meta rows.
export function formatDotDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatDayMonth(iso)}.${date.getFullYear()}`;
}

export function yearOf(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return String(date.getFullYear());
}

// Format an ISO timestamp as "D thang M, YYYY" for article bylines.
const MONTHS = [
  "tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
  "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12",
];

export function formatLongDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

// Estimate reading time from body text, at roughly 200 words per minute.
export function readingTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Total reading time across a post set, for the index counters.
export function totalReadingMinutes(bodies: string[]): number {
  return bodies.reduce((sum, body) => sum + readingTimeMinutes(body), 0);
}
