import type { ProductCollectionSortKey, ProductSortKey } from "@/lib/shopify/types"

import type { CollectionSort } from "./types"

export const sortOptions: { value: CollectionSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best selling" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
]

export function isCollectionSort(value: unknown): value is CollectionSort {
  return sortOptions.some((o) => o.value === value)
}

/** Sort for products inside a collection. "Featured" = the order set in the Shopify admin. */
export function collectionSortVariables(sort: CollectionSort): { sortKey: ProductCollectionSortKey; reverse: boolean } {
  switch (sort) {
    case "best-selling":
      return { sortKey: "BEST_SELLING", reverse: false }
    case "price-asc":
      return { sortKey: "PRICE", reverse: false }
    case "price-desc":
      return { sortKey: "PRICE", reverse: true }
    case "newest":
      return { sortKey: "CREATED", reverse: true }
    default:
      return { sortKey: "COLLECTION_DEFAULT", reverse: false }
  }
}

/** Same sorts for `/collections/all`, which uses the products query. */
export function allProductsSortVariables(sort: CollectionSort): { sortKey: ProductSortKey; reverse: boolean } {
  switch (sort) {
    case "price-asc":
      return { sortKey: "PRICE", reverse: false }
    case "price-desc":
      return { sortKey: "PRICE", reverse: true }
    case "newest":
      return { sortKey: "CREATED_AT", reverse: true }
    default:
      return { sortKey: "BEST_SELLING", reverse: false }
  }
}
