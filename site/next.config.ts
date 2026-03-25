import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/dark-factory",
  images: { unoptimized: true },
};

export default nextConfig;
