import type { Metadata } from "next";
import { Newsreader, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getAllPosts } from "@/lib/posts";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Editorial serif for headings (Vietnamese subset included), Geist for body
// and UI, Geist Mono for labels and code. Exposed as CSS variables that
// tokens.css / globals.css reference through the Tailwind theme.
const serif = Newsreader({
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const sans = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  // metadataBase turns every relative URL below (and in child pages) into an
  // absolute one on the canonical host, so OpenGraph/canonical links are valid.
  metadataBase: new URL(SITE_URL),
  // A title template: a child page returning `title: "Docker..."` renders as
  // "Docker... · AI Engineer Blog"; the home page uses `default`.
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Blog kỹ thuật của một AI engineer: bài viết đi từ dự án thật về hệ thống, hạ tầng, machine learning và deep learning.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "vi_VN",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pass a light post list (slug + title) to the Header so its Blog dropdown
  // lists real, recent content rather than placeholder links.
  const posts = await getAllPosts();
  const navPosts = posts.map((p) => ({ slug: p.slug, title: p.title }));

  return (
    <html lang="vi" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col">
          <Header posts={navPosts} />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
