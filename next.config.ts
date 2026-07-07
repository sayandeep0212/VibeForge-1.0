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

  async rewrites() {
    return [
      {
        // Forward Firebase Auth requests to the actual Firebase project domain
        source: '/__/auth/:path*',
        destination: 'https://vibeforge-d35bc.firebaseapp.com/__/auth/:path*',
      },
    ];
  },

  async headers() {
    return [
      // ── Static assets (fonts, images, media, backgrounds, merch, logos) ──
      // These files almost never change — cache them aggressively.
      // 30 days browser cache + 30 days on CDN + immutable.
      {
        source: "/(fonts|media|backgrounds|Logos|Merch|images|home-frames)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, s-maxage=2592000, immutable",
          },
        ],
      },

      // ── API routes ──────────────────────────────────────────────────────
      // Never cache globally. Individual routes set their own Cache-Control.
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },

      // ── HTML pages (all App Router routes) ──────────────────────────────
      // Allow Vercel's edge CDN to cache pages for 120s, serve stale for 5 min.
      // This massively reduces edge function invocations for repeat visitors.
      // NOTE: /_next/static/* is intentionally excluded — Next.js already
      // gives those files immutable hashed names (max-age=31536000).
      {
        source: "/((?!_next/static|_next/image|api/|fonts|media|backgrounds|Logos|Merch|images|home-frames).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=120, stale-while-revalidate=300",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
