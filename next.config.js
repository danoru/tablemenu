/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    swcPlugins: [
      [
        "next-superjson-plugin",
        {
          excluded: [],
        },
      ],
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  transpilePackages: ["@mui/x-charts"],
};
module.exports = nextConfig;
