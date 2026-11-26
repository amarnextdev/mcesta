import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Dev only: lets the site run through an HTTPS tunnel (needed to test Shopify customer login).
  allowedDevOrigins: ["*.trycloudflare.com", "*.ngrok-free.app"],
  images: {
    // Product images from Shopify's CDN.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
