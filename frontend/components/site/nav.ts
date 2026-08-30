// Single source of truth for site navigation, shared by the Header and Footer
// so the two never drift. Labels are in English (structural chrome); article
// and page content stays in Vietnamese. Items with a `menu` open a dropdown in
// the Header: "blog" lists recent posts, "topics" lists the fields.
export type NavItem = { label: string; href: string; menu?: "blog" | "topics" };

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog", menu: "blog" },
  { label: "Topics", href: "/topics", menu: "topics" },
  { label: "Graph", href: "/graph" },
  { label: "About", href: "/about" },
];

// True when `href` is the current route or an ancestor of it, so /blog stays
// active while reading a post at /blog/<slug>. Home only matches exactly.
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
