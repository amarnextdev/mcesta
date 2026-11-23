import type { CollectionSort, CollectionTab } from "./types"

/** Products per page. Design shows 12; 24 fills 6 rows of 4 on desktop. */
export const COLLECTION_PAGE_SIZE = 24

/** Handle that lists every product in the store. */
export const ALL_PRODUCTS_HANDLE = "all"

export const DEFAULT_SORT: CollectionSort = "featured"
export const DEFAULT_TAB: CollectionTab = "all"

/**
 * Tabs filter by product tag. Tag products in Shopify with these exact tags
 * (trending, bestseller, new, sale) and the tabs fill up on their own.
 */
export const collectionTabs: { value: CollectionTab; label: string; tag?: string; hot?: boolean }[] = [
  { value: "all", label: "All" },
  { value: "trending", label: "Trending", tag: "trending", hot: true },
  { value: "bestsellers", label: "Bestsellers", tag: "bestseller" },
  { value: "new", label: "New in", tag: "new" },
  { value: "sale", label: "On sale", tag: "sale" },
]

export function tabTag(tab: CollectionTab): string | undefined {
  return collectionTabs.find((t) => t.value === tab)?.tag
}

export function isCollectionTab(value: unknown): value is CollectionTab {
  return collectionTabs.some((t) => t.value === value)
}
