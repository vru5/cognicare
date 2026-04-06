import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  images: {
    unoptimized: true, // Static export doesn't support Next.js Image Optimization
  },
  // reactCompiler: true,
};

export default nextConfig;
