import { z } from "zod"

/**
 * Public environment variables (inlined into the browser bundle).
 * Each value must be read as `process.env.NEXT_PUBLIC_X` literally so Next.js can inline it.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: z.string().trim().optional().default(""),
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: z.string().trim().optional().default(""),
  NEXT_PUBLIC_SHOPIFY_API_VERSION: z.string().trim().default("2026-10"),
  NEXT_PUBLIC_MOCK_SHOP_URL: z.url().default("https://furniture.mock.shop/api"),
})

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
  NEXT_PUBLIC_SHOPIFY_API_VERSION: process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || undefined,
  NEXT_PUBLIC_MOCK_SHOP_URL: process.env.NEXT_PUBLIC_MOCK_SHOP_URL || undefined,
})

/** True while no real store is connected: data comes from mock.shop. */
export const isMockShop = publicEnv.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN === ""
