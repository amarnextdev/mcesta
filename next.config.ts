import type { NextConfig } from "next";

import {
  allCategories,
  categoryHref,
  collectionHandle,
  departmentAllHref,
  departments,
} from "./src/lib/config/navigation";

/**
 * Old / Shopify-style links to menu collections go to the clean URL:
 *   /collections/smart-home   →  /electronics/smart-home   (308, query string kept)
 *   /collections/electronics  →  /electronics/all
 */
function menuRedirects() {
  return departments.flatMap((d) => [
    { source: `/collections/${collectionHandle(d)}`, destination: departmentAllHref(d), permanent: true },
    ...allCategories(d).map((c) => ({
      source: `/collections/${collectionHandle(c)}`,
      destination: categoryHref(d, c),
      permanent: true,
    })),
  ]);
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    // Product images from Shopify's CDN (real store and mock.shop).
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "**.mock.shop" },
    ],
  },
  partialPrefetching: true,
  async redirects() {
    // De-duplicate: a collection used in two places redirects to its first menu spot.
    const seen = new Set<string>();
    return menuRedirects().filter((r) => !seen.has(r.source) && seen.add(r.source));
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
