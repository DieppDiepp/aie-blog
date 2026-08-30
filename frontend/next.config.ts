import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a standalone server output for a small production Docker image.
  output: "standalone",
  images: {
    // Article images live on the media CDN (Cloudflare R2). Allow next/image to
    // reference them. SVG diagrams are served unoptimized (see mdx-components).
    remotePatterns: [
      { protocol: "https", hostname: "media.aiengineerblog.com" },
    ],
  },
};

export default nextConfig;
