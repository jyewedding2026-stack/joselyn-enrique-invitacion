import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: true,
  // "." is required for the Arweave export. Dev needs the default prefix
  // or the flight runtime never hydrates.
  assetPrefix: process.env.NODE_ENV === "production" ? "." : undefined,
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@base-ui/react"],
  },
  // Prefer fewer larger chunks — Arweave latency hurts many small requests.
  // Oversized files are split later by scripts/prepare-arweave.mjs.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20_000,
        maxAsyncRequests: 8,
        maxInitialRequests: 8,
      };
    }
    return config;
  },
};

export default nextConfig;
