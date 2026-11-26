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
  // Browser traffic to Supabase (review photo uploads and images) goes through our own domain:
  // several Indian ISPs block *.supabase.co, but not this site.
  async rewrites() {
    const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "")
    return supabase ? [{ source: "/supabase/:path*", destination: `${supabase}/:path*` }] : []
  },
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
