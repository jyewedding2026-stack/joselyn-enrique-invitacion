import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  assetPrefix: ".",
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
