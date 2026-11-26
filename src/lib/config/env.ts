import { z } from "zod"

/**
 * Public environment variables (inlined into the browser bundle).
 * Each value must be read as `process.env.NEXT_PUBLIC_X` literally so Next.js can inline it.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: z
    .string({ error: "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is missing. Add it to .env.local (yourstore.myshopify.com)." })
    .trim()
    .regex(/^[a-z0-9-]+\.myshopify\.com$/, "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN must look like yourstore.myshopify.com"),
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: z
    .string({ error: "NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN is missing. Copy the public token from Headless → Storefront API." })
    .trim()
    .min(1, "NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN is empty"),
  NEXT_PUBLIC_SHOPIFY_API_VERSION: z.string().trim().default("2026-10"),
})

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || undefined,
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || undefined,
  NEXT_PUBLIC_SHOPIFY_API_VERSION: process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || undefined,
})
