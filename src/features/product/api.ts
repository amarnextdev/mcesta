import { storefrontFetch } from "@/lib/shopify/client"
import { toProductCard } from "@/lib/shopify/mappers"
import { PRODUCTS_QUERY } from "@/lib/shopify/queries"
import type { ProductCard, ShopifyProductCard } from "@/lib/shopify/types"

import type { ProductListParams } from "./types"

type ProductsData = { products: { nodes: ShopifyProductCard[] } }

export function productListVariables(params: ProductListParams = {}) {
  return {
    first: params.first ?? 12,
    sortKey: params.sortKey ?? "BEST_SELLING",
    reverse: params.reverse ?? false,
    query: params.query ?? null,
    country: params.country ?? null,
  }
}

/** Browser-safe fetch used by TanStack Query on the client. */
export async function fetchProducts(
  params: ProductListParams = {},
  signal?: AbortSignal
): Promise<ProductCard[]> {
  const data = await storefrontFetch<ProductsData>({
    query: PRODUCTS_QUERY,
    variables: productListVariables(params),
    signal,
  })
  return data.products.nodes.map(toProductCard)
}
