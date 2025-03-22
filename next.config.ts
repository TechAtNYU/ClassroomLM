import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // apparently for docker see https://github.com/vercel/next.js/tree/canary/examples/with-docker
  eslint: {
    dirs: ["utils", "app", "components"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
