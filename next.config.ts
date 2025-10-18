import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ⬅️ Ignore ESLint pendant le build
  },
  typescript: {
    ignoreBuildErrors: false, // On garde les vraies erreurs TypeScript
  },
};

export default nextConfig;