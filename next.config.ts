import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in production to avoid CSP issues with source-map-js's eval usage
  productionBrowserSourceMaps: false,
};

export default nextConfig;