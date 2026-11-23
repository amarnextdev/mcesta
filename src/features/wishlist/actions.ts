"use server"

import { cacheLife, cacheTag } from "next/cache"
import { z } from "zod"

import { storefrontServerFetch } from "@/lib/shopify/client.server"
import { toProductCard } from "@/lib/shopify/mappers"
import { PRODUCTS_BY_ID_QUERY } from "@/lib/shopify/queries"
import type { ProductCard, ShopifyProductCard } from "@/lib/shopify/types"

async function getProductsById(ids: string[]): Promise<(ProductCard | null)[]> {
  "use cache"
  cacheLife("minutes")
  cacheTag("products")

  const data = await storefrontServerFetch<{ nodes: (ShopifyProductCard | null)[] }>({
    query: PRODUCTS_BY_ID_QUERY,
    variables: { ids },
  })
  // nodes() returns {} for ids that aren't products, null for deleted ones.
  return data.nodes.map((n) => (n && "handle" in n ? toProductCard(n) : null))
}

/**
 * Current price and stock for wishlist items, so the page can show price drops and sold-out
 * items. Returns a map of product id → card (missing = product no longer exists).
 */
export async function refreshWishlistAction(ids: string[]): Promise<Record<string, ProductCard>> {
  const parsed = z.array(z.string().startsWith("gid://shopify/Product/")).max(100).safeParse(ids)
  if (!parsed.success || parsed.data.length === 0) return {}
  try {
    const sorted = [...new Set(parsed.data)].sort()
    const cards = await getProductsById(sorted)
    return Object.fromEntries(cards.flatMap((c) => (c ? [[c.id, c] as const] : [])))
  } catch (error) {
    console.error("[wishlist] refresh failed", error)
    return {}
  }
}
