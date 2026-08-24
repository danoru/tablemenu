import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcrypt", "sharp"],
  images: {
    // Scoped to the hosts board-game art actually comes from. `hostname: "**"`
    // turned the Next image optimizer into an open proxy for any HTTPS URL.
    remotePatterns: [
      { hostname: "**.geekdo-images.com", protocol: "https" },
      { hostname: "geekdo-images.com", protocol: "https" },
      { hostname: "**.boardgamegeek.com", protocol: "https" },
      { hostname: "boardgamegeek.com", protocol: "https" },
    ],
  },
};

export default nextConfig;
