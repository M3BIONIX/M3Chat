import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Disable image optimization to avoid 400 errors with empty/corrupted images
  },
};

export default nextConfig;
