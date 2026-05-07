import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'i.ibb.co' },
      { hostname: 'lh3.googleusercontent.com' },
      { hostname: 'avatars.githubusercontent.com' },
      { hostname: 'gameliminals.vercel.app' },
    ],
  },
};

export default nextConfig;
