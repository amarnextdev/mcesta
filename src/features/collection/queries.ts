import { queryOptions } from "@tanstack/react-query"

import { fetchCollectionPage } from "./api"
import type { CollectionParams } from "./types"

/** Server prefetch and client hooks must use these same keys. */
export const collectionKeys = {
  all: ["collection"] as const,
  page: (params: CollectionParams) => [...collectionKeys.all, "page", params] as const,
}

export const collectionQueries = {
  page: (params: CollectionParams) =>
    queryOptions({
      queryKey: collectionKeys.page(params),
      queryFn: ({ signal }) => fetchCollectionPage(params, signal),
    }),
}
