import "server-only"

import { z } from "zod"

/** Real Supabase keys are long; anything short is a leftover placeholder. */
function realKey(value: string | undefined) {
  const v = value?.trim()
  return v && v.length >= 20 ? v : undefined
}

const serverSchema = z.object({
  SHOPIFY_STOREFRONT_PRIVATE_TOKEN: z
    .string({ error: "SHOPIFY_STOREFRONT_PRIVATE_TOKEN is missing. Copy the private token from Headless → Storefront API." })
    .trim()
    .min(1, "SHOPIFY_STOREFRONT_PRIVATE_TOKEN is empty"),
  // Supabase (reviews, Q&A). Optional so the shop still runs without it; review features then stay off.
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1).optional(),
})

/** Server-only secrets. Importing this file from a Client Component fails the build. */
export const serverEnv = serverSchema.parse({
  SHOPIFY_STOREFRONT_PRIVATE_TOKEN: process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN || undefined,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  // A placeholder like "..." counts as not set, so reviews/wishlist switch off cleanly instead of erroring.
  SUPABASE_SERVICE_ROLE_KEY: realKey(process.env.SUPABASE_SERVICE_ROLE_KEY),
})
