import type { NextConfig } from "next";

const backendApiUrl =
  process.env.BACKEND_API_URL ??
  (process.env.NODE_ENV === "development" ? "https://localhost:5001" : undefined);

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendApiUrl) {
      return [];
    }

    const backendUrl = backendApiUrl.replace(/\/+$/, "");
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      { source: "/auth/:path*", destination: `${backendUrl}/auth/:path*` },
      { source: "/healthz", destination: `${backendUrl}/healthz` },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
