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
  // Post slugs were renamed to niche, long-tail Vietnamese keywords. These map
  // the original (already-crawled) URLs to the new ones with a permanent (308)
  // redirect so Google moves the index entry over and no shared link 404s.
  // Keep an entry here forever once a live URL has been renamed.
  async redirects() {
    return [
      {
        source: "/blog/docker-co-ban-cho-python-dev",
        destination: "/blog/hoc-docker-qua-du-an-web-that",
        permanent: true,
      },
      {
        source: "/blog/ci-cd-vps-ghcr",
        destination: "/blog/deploy-website-len-vps-github-actions",
        permanent: true,
      },
      {
        source: "/blog/cloudflare-dashboard-named-tunnel",
        destination: "/blog/cloudflare-tunnel-gan-domain-cho-vps",
        permanent: true,
      },
      {
        source: "/blog/domain-dns-tls",
        destination: "/blog/domain-dns-tls-cho-nguoi-moi",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
