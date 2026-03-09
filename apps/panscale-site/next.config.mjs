import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    mdxRs: true
  },
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["@panscale/config", "@panscale/core", "@panscale/web", "@panscale/react"]
};

export default withMDX(nextConfig);
