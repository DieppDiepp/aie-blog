// Single source of truth for site navigation, shared by the Header and Footer
// so the two never drift. Labels are in English (structural chrome); article
// and page content stays in Vietnamese. Items with a `menu` open a dropdown in
// the Header: "blog" lists recent posts, "topics" lists the fields.
export type NavItem = { label: string; href: string; menu?: "blog" | "topics" };

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog", menu: "blog" },
  { label: "Projects", href: "/projects" },
  { label: "Topics", href: "/topics", menu: "topics" },
  { label: "Graph", href: "/graph" },
  { label: "About", href: "/about" },
];

// True when `href` is the current route or an ancestor of it, so /blog stays
// active while reading a post at /blog/<slug>. Home only matches exactly.
// /projects also stays active on /authors/<slug>, because an author page is
// reached from the Projects section and nothing else in the nav owns it.
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/projects" && pathname.startsWith("/authors")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}
