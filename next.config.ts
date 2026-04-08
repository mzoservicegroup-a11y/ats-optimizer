import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['unpdf', 'ws', '@neondatabase/serverless'],
};

export default nextConfig;
