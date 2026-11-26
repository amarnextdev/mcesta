import type { CollectionInfo } from "@/lib/shopify/mappers"
import type { PageInfo, ProductCard } from "@/lib/shopify/types"

import type { FilterGroup, FilterInput } from "./filters"

/** Sort options shown to shoppers. Mapped to Shopify sort keys in `sort.ts`. */
export type CollectionSort = "featured" | "best-selling" | "price-asc" | "price-desc" | "newest"

/** Quick tabs above the grid (design: All · Trending · Bestsellers · New in · On sale). */
export type CollectionTab = "all" | "trending" | "bestsellers" | "new" | "sale"

/** Everything that decides which products a collection page shows. Also the query key. */
export type CollectionParams = {
  handle: string
  sort: CollectionSort
  tab: CollectionTab
  /** Active filters (Storefront ProductFilter objects), sorted so equal sets share a cache key. */
  filters: FilterInput[]
  /** 1-based page number. Turned into a Shopify cursor with the cursor index (see api.ts). */
  page: number
  /** Market for prices, currency and stock (ISO code). Not in the URL: it comes from the shopper's choice. */
  country: string
}

export type CollectionPage = {
  collection: CollectionInfo
  products: ProductCard[]
  pageInfo: PageInfo
  /** Products matching the current tab + filters (all pages). */
  total: number
  /** True when there are more products than the index counts (shown as "1000+"). */
  totalCapped: boolean
  pageCount: number
  /** Filters available for this list, with counts. */
  filterGroups: FilterGroup[]
}

export type { CollectionInfo }

