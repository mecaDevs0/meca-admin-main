import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.mecabr.com',
  },
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
