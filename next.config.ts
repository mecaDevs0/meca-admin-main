import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://ec2-3-144-213-137.us-east-2.compute.amazonaws.com:9000',
  },
};

export default nextConfig;
