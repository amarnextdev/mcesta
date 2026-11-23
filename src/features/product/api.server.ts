import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { storefrontServerFetch } from "@/lib/shopify/client.server"
import { toProductCard } from "@/lib/shopify/mappers"
import { PRODUCTS_QUERY } from "@/lib/shopify/queries"
import type { ProductCard, ShopifyProductCard } from "@/lib/shopify/types"

import { productListVariables } from "./api"
import type { ProductListParams } from "./types"

type ProductsData = { products: { nodes: ShopifyProductCard[] } }

/** Cached server read of a product list. Revalidated by the `products` tag (webhooks, later). */
export async function getProducts(params: ProductListParams = {}): Promise<ProductCard[]> {
  "use cache"
  cacheLife("minutes")
  cacheTag("products")

  const data = await storefrontServerFetch<ProductsData>({
    query: PRODUCTS_QUERY,
    variables: productListVariables(params),
  })
  return data.products.nodes.map(toProductCard)
}
