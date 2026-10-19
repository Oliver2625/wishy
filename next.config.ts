import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev-only MCP endpoint (/_next/mcp) accepts input from any HMR client and feeds coding agents. Not used here.
  experimental: { mcpServer: false },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        // Never framed: state-changing pages can't be clickjacked even if the cookie policy changes.
        { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        { key: "X-Frame-Options", value: "DENY" },
        // Keeps share links (/l/<code>) out of the Referer sent to other sites.
        { key: "Referrer-Policy", value: "same-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    }];
  },
};

export default nextConfig;
