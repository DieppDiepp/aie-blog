import type { Metadata } from "next";
import { Newsreader, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getAllPosts } from "@/lib/posts";

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
  title: "AI Engineer Blog",
  description: "Portfolio và bài viết của một AI engineer.",
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
