import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (via pdfjs-dist) resolves its own worker file relative to its
  // package location at runtime — bundling it breaks that resolution, so it
  // must stay external and be required directly from node_modules.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
