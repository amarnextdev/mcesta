import { queryOptions } from "@tanstack/react-query"

import { fetchProducts } from "./api"
import type { ProductListParams } from "./types"

/** Query keys for products. Server prefetch and client hooks must use these same keys. */
export const productKeys = {
  all: ["products"] as const,
  list: (params: ProductListParams) => [...productKeys.all, "list", params] as const,
}

export const productQueries = {
  list: (params: ProductListParams = {}) =>
    queryOptions({
      queryKey: productKeys.list(params),
      queryFn: ({ signal }) => fetchProducts(params, signal),
    }),
}
