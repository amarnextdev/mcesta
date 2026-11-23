import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { storefrontServerFetch } from "@/lib/shopify/client.server"
import { toProductCard, toProductDetail } from "@/lib/shopify/mappers"
import { COMPLEMENTARY_PRODUCTS_QUERY, PRODUCT_QUERY, PRODUCT_RECOMMENDATIONS_QUERY } from "@/lib/shopify/queries"
import type { ProductCard, ProductDetail, ShopifyProductCard, ShopifyProductDetail } from "@/lib/shopify/types"

/** Cached product for the product page. null = no such product (404). */
export async function getProduct(handle: string): Promise<ProductDetail | null> {
  "use cache"
  cacheLife("minutes")
  cacheTag("products", `product:${handle}`)

  const data = await storefrontServerFetch<{ product: ShopifyProductDetail | null }>({
    query: PRODUCT_QUERY,
    variables: { handle },
  })
  return data.product ? toProductDetail(data.product) : null
}

/** Shopify's related products. Never throws: a page without recommendations is fine. */
export async function getRecommendations(productId: string): Promise<ProductCard[]> {
  "use cache"
  cacheLife("hours")
  cacheTag("products")

  try {
    const data = await storefrontServerFetch<{ productRecommendations: ShopifyProductCard[] | null }>({
      query: PRODUCT_RECOMMENDATIONS_QUERY,
      variables: { productId },
    })
    return (data.productRecommendations ?? []).slice(0, 10).map(toProductCard)
  } catch {
    return []
  }
}

/**
 * "Frequently bought together": the complementary products you pick in Shopify's Search & Discovery
 * app. Falls back to the closest related products so the block isn't empty while you set it up.
 */
export async function getBoughtTogether(productId: string): Promise<ProductCard[]> {
  "use cache"
  cacheLife("hours")
  cacheTag("products")

  try {
    const data = await storefrontServerFetch<{ productRecommendations: ShopifyProductCard[] | null }>({
      query: COMPLEMENTARY_PRODUCTS_QUERY,
      variables: { productId },
    })
    const list = (data.productRecommendations ?? []).map(toProductCard).filter((p) => p.available && !p.hasOptions)
    if (list.length > 0) return list.slice(0, 2)
  } catch {
    // Older API versions don't know `intent`; use related products instead.
  }
  // Single-variant items only: they can be added without choosing a size or colour.
  return (await getRecommendations(productId)).filter((p) => p.available && !p.hasOptions).slice(0, 2)
}
