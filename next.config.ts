import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Relative assets so Arweave path manifests resolve under /{txId}/
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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 5000,
        maxSize: 90_000,
        maxAsyncRequests: 40,
        maxInitialRequests: 40,
      };
    }
    return config;
  },
};

export default nextConfig;
