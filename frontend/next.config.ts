import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a standalone server output for a small production Docker image.
  output: "standalone",
};

export default nextConfig;
