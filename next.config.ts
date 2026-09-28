import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Our internal links, canonical URLs, and hreflang tags all use trailing
  // slashes (e.g. "/us/"). Without this, static export emits "us.html" with
  // no "us/index.html", which most static hosts won't resolve for a "/us/"
  // request — trailingSlash makes the output match what we actually link to.
  trailingSlash: true,
};

export default nextConfig;
