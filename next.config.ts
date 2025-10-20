import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },
  output: 'standalone', // Para Docker
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:9000/:path*',
      },
    ];
  },
};

export default nextConfig;
