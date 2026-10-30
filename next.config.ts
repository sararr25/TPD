import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL(".", import.meta.url));
const config: NextConfig = {
  poweredByHeader: false,
  turbopack: { root },
  outputFileTracingRoot: root,
  // The nav labels say "Saved" and "Twin"; typed URLs should land on those pages, not the unknown-city 404.
  async redirects() {
    return [
      { source: "/saved", destination: "/collections", permanent: false },
      { source: "/twin", destination: "/swap", permanent: false },
    ];
  },
};
export default config;
