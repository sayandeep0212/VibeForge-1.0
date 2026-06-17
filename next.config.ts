import type { NextConfig } from "next";
import { execSync } from "child_process";

// Use git commit hash as the build ID so every deployment gets a unique ID.
// This ensures /_next/static/<buildId>/ chunk URLs always change on deploy,
// preventing browsers from loading stale JS/CSS after an update.
function getBuildId(): string {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return Date.now().toString();
  }
}

const nextConfig: NextConfig = {
  generateBuildId: async () => getBuildId(),

  async headers() {
    return [
      // ── API routes ──────────────────────────────────────────────────────
      // Never cache. Responses contain live data and must always be fresh.
      // Does NOT affect cookies or session tokens.
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },

      // ── HTML pages (all App Router routes) ──────────────────────────────
      // Browser must revalidate on every visit. If the server says "not
      // modified" (ETag match) the browser uses its copy — so it's still
      // fast. But it will always pick up a new deploy immediately.
      // NOTE: /_next/static/* is intentionally excluded — Next.js already
      // gives those files immutable hashed names (max-age=31536000).
      {
        source: "/((?!_next/static|_next/image|api/).*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;

