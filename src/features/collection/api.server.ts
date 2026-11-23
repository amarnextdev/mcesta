import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { storefrontServerFetch } from "@/lib/shopify/client.server"
import { toCollectionInfo } from "@/lib/shopify/mappers"
import { COLLECTIONS_QUERY } from "@/lib/shopify/queries"
import type { Image, ShopifyCollection } from "@/lib/shopify/types"

import { loadCollectionPage, loadCursorIndex, type ListParams } from "./api"
import type { CollectionPage, CollectionParams } from "./types"

/** Cached server read of one collection page. Revalidated by the `collections` / `products` tags. */
export async function getCollectionPage(params: CollectionParams): Promise<CollectionPage | null> {
  "use cache"
  cacheLife("minutes")
  cacheTag("collections", "products", `collection:${params.handle}`)

  return loadCollectionPage(params, storefrontServerFetch, getCursorIndex)
}

/** Cached cursor index of a list (total count + page start cursors), shared by all its pages. */
async function getCursorIndex(list: ListParams) {
  "use cache"
  cacheLife("minutes")
  cacheTag("collections", "products", `collection:${list.handle}`)

  return loadCursorIndex(list, storefrontServerFetch)
}

/** All collections, for the /collections index. */
export async function getCollections() {
  "use cache"
  cacheLife("hours")
  cacheTag("collections")

  const data = await storefrontServerFetch<{ collections: { nodes: ShopifyCollection[] } }>({
    query: COLLECTIONS_QUERY,
    variables: { first: 50 },
  })
  return data.collections.nodes.map(toCollectionInfo)
}

/** Collection photos by handle (set the image on each collection in Shopify). Never throws. */
export async function getCollectionImages(): Promise<Map<string, Image>> {
  try {
    const collections = await getCollections()
    return new Map(collections.flatMap((c) => (c.image ? [[c.handle, c.image] as const] : [])))
  } catch {
    return new Map()
  }
}
