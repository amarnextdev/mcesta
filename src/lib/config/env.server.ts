import "server-only"

import { z } from "zod"

const serverSchema = z.object({
  SHOPIFY_STOREFRONT_PRIVATE_TOKEN: z.string().trim().optional().default(""),
})

/** Server-only secrets. Importing this file from a Client Component fails the build. */
export const serverEnv = serverSchema.parse({
  SHOPIFY_STOREFRONT_PRIVATE_TOKEN: process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
})
