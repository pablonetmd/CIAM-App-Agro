import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint ya no se configura aquí en versiones recientes de Next.js
};

export default nextConfig;