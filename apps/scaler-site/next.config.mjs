import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    mdxRs: true
  },
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["@scaler/config"]
};

export default withMDX(nextConfig);
