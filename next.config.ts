import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  experimental:{
    middlewareClientMaxBodySize: '10000000000mb',
  }
};

export default nextConfig;
