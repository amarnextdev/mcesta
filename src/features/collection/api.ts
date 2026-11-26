import { storefrontFetch, type StorefrontRequest } from "@/lib/shopify/client"
import { toCollectionInfo, toProductCard } from "@/lib/shopify/mappers"
import {
  ALL_PRODUCT_CURSORS_QUERY,
  ALL_PRODUCTS_PAGE_QUERY,
  COLLECTION_CURSORS_QUERY,
  COLLECTION_PRODUCTS_QUERY,
} from "@/lib/shopify/queries"
import type { ShopifyCollection, ShopifyFilter, ShopifyPageInfo, ShopifyProductCard } from "@/lib/shopify/types"

import { ALL_PRODUCTS_HANDLE, COLLECTION_PAGE_SIZE, tabTag } from "./config"
import { allProductsFilterGroups, toFilterGroups, toSearchQuery } from "./filters"
import { allProductsSortVariables, collectionSortVariables } from "./sort"
import type { CollectionPage, CollectionParams } from "./types"

type ProductPage = { pageInfo: ShopifyPageInfo; nodes: ShopifyProductCard[] }
type CollectionData = {
  collection: (ShopifyCollection & { products: ProductPage & { filters: ShopifyFilter[] } }) | null
}
type AllProductsData = { products: ProductPage }
type CursorPage = { pageInfo: { hasNextPage: boolean; endCursor: string | null }; edges: { cursor: string }[] }

/** Any Storefront fetcher: the browser one, or the server one with the private token. */
export type Fetcher = <TData>(req: StorefrontRequest<Record<string, unknown>>) => Promise<TData>

/** Everything that decides the list, minus the page. Pages of one list share one cursor index. */
export type ListParams = Omit<CollectionParams, "page">

/** Cursor index of a list (see COLLECTION_CURSORS_QUERY). null = collection doesn't exist. */
export type CursorIndex = {
  total: number
  capped: boolean
  /** `after` cursor for each page: index 0 → page 1 (null), index 1 → page 2, … */
  pageStarts: (string | null)[]
}

/** How many products the index walks at most (4 small requests). Beyond that: "1000+". */
const INDEX_LIMIT = 1000
const INDEX_BATCH = 250

const allProductsInfo = {
  handle: ALL_PRODUCTS_HANDLE,
  title: "All products",
  description: "Everything in the shop, in one place.",
  seoTitle: "All products",
  seoDescription: "Browse every product in the shop.",
  image: null,
}

/** Shared list variables (sort, tab, filters) for the collection or the all-products query. */
function listVariables(params: ListParams) {
  const tag = tabTag(params.tab)
  const filters = tag ? [...params.filters, { tag }] : params.filters
  if (params.handle === ALL_PRODUCTS_HANDLE) {
    return { ...allProductsSortVariables(params.sort), query: toSearchQuery(filters) || null, country: params.country }
  }
  return { handle: params.handle, ...collectionSortVariables(params.sort), filters, country: params.country }
}

export async function loadCursorIndex(params: ListParams, fetcher: Fetcher, signal?: AbortSignal): Promise<CursorIndex | null> {
  const isAll = params.handle === ALL_PRODUCTS_HANDLE
  const cursors: string[] = []
  let after: string | null = null
  let hasNext = true

  while (hasNext && cursors.length < INDEX_LIMIT) {
    const variables: Record<string, unknown> = { ...listVariables(params), first: INDEX_BATCH, after }
    let page: CursorPage | null
    if (isAll) {
      page = (await fetcher<{ products: CursorPage }>({ query: ALL_PRODUCT_CURSORS_QUERY, variables, signal })).products
    } else {
      const data = await fetcher<{ collection: { products: CursorPage } | null }>({
        query: COLLECTION_CURSORS_QUERY,
        variables,
        signal,
      })
      if (!data.collection) return null
      page = data.collection.products
    }
    cursors.push(...page.edges.map((e) => e.cursor))
    hasNext = page.pageInfo.hasNextPage
    after = page.pageInfo.endCursor
  }

  const pageStarts: (string | null)[] = [null]
  for (let i = COLLECTION_PAGE_SIZE; i < cursors.length; i += COLLECTION_PAGE_SIZE) pageStarts.push(cursors[i - 1])
  return { total: cursors.length, capped: hasNext, pageStarts }
}

/**
 * One page of a collection. Returns null when the collection does not exist.
 * `getIndex` loads the cursor index (cached separately on the server and in the browser).
 */
export async function loadCollectionPage(
  params: CollectionParams,
  fetcher: Fetcher,
  getIndex: (list: ListParams) => Promise<CursorIndex | null>,
  signal?: AbortSignal
): Promise<CollectionPage | null> {
  const { page: requested, ...list } = params
  const index = await getIndex(list)
  if (!index) return null

  const pageCount = Math.max(1, index.pageStarts.length)
  const page = Math.min(requested, pageCount)
  const after = index.pageStarts[page - 1] ?? null
  const variables = { ...listVariables(list), first: COLLECTION_PAGE_SIZE, after }
  const totals = { total: index.total, totalCapped: index.capped, pageCount }

  if (params.handle === ALL_PRODUCTS_HANDLE) {
    const data = await fetcher<AllProductsData>({ query: ALL_PRODUCTS_PAGE_QUERY, variables, signal })
    return {
      collection: allProductsInfo,
      products: data.products.nodes.map(toProductCard),
      pageInfo: data.products.pageInfo,
      filterGroups: allProductsFilterGroups,
      ...totals,
    }
  }

  const data = await fetcher<CollectionData>({ query: COLLECTION_PRODUCTS_QUERY, variables, signal })
  if (!data.collection) return null

  return {
    collection: toCollectionInfo(data.collection),
    products: data.collection.products.nodes.map(toProductCard),
    pageInfo: data.collection.products.pageInfo,
    // No filters set up in Shopify's Search & Discovery app yet → offer price and availability anyway.
    filterGroups: data.collection.products.filters.length
      ? toFilterGroups(data.collection.products.filters)
      : allProductsFilterGroups,
    ...totals,
  }
}

// ---- Browser ----

/** Cursor indexes already loaded in this tab (5 min), so paging doesn't re-count every time. */
const browserIndexes = new Map<string, { at: number; index: Promise<CursorIndex | null> }>()
const INDEX_TTL = 5 * 60_000

function browserIndex(list: ListParams, signal?: AbortSignal) {
  const key = JSON.stringify(list)
  const hit = browserIndexes.get(key)
  if (hit && Date.now() - hit.at < INDEX_TTL) return hit.index
  const index = loadCursorIndex(list, storefrontFetch, signal)
  browserIndexes.set(key, { at: Date.now(), index })
  index.catch(() => browserIndexes.delete(key))
  return index
}

/** Browser-safe version for TanStack Query. */
export function fetchCollectionPage(params: CollectionParams, signal?: AbortSignal) {
  return loadCollectionPage(params, storefrontFetch, (list) => browserIndex(list, signal), signal)
}
