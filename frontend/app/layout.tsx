import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIE_Blog",
  description: "A second brain and portfolio for an AI engineer.",
};

// Real fonts (serif display + mono) will be wired with next/font later.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
