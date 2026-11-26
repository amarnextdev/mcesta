import type { ProductSortKey } from "@/lib/shopify/types"

export type ProductListParams = {
  first?: number
  sortKey?: ProductSortKey
  reverse?: boolean
  /** Shopify search syntax, e.g. "tag:gift" or "product_type:Lamp". */
  query?: string
  /** Market for prices, currency and stock (ISO code). Part of the query key. */
  country?: string
}

export type ShelfFilter = { key: string; label: string; params: ProductListParams }

export type ShelfConfig = {
  /** Section id, also used for the heading id (`${id}-h`). */
  id: string
  title: string
  subtitle?: string
  action?: { label: string; href: string }
  /** First filter is the default and is prefetched on the server. One filter = no chips. */
  filters: ShelfFilter[]
}
