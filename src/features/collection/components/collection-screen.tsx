import { notFound } from "next/navigation"
import { connection } from "next/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { Breadcrumb, type Crumb } from "@/components/shared/breadcrumb"
import { EmptyState } from "@/components/shared/empty-state"
import { getCountry } from "@/lib/market/market.server"
import { makeQueryClient } from "@/lib/query/query-client"

import { getCollectionPage } from "../api.server"
import { ALL_PRODUCTS_HANDLE } from "../config"
import { collectionQueries } from "../queries"
import { parseCollectionParams } from "../search-params"
import { CollectionView } from "./collection-view"

type SearchParams = Record<string, string | string[] | undefined>

type CollectionScreenProps = {
  /** Shopify collection handle to list. */
  handle: string
  searchParams: SearchParams
  parents: Crumb[]
  title?: string
  /** Shown above the products (department banners, category tiles…). */
  intro?: ReactNode
  /**
   * When the Shopify collection doesn't exist yet: show the intro and a friendly message
   * (menu pages) instead of a 404 (unknown collections).
   */
  allowMissing?: boolean
}

/**
 * Server part of every product-list page: /{department}, /{department}/{category} and
 * /collections/{handle}. Loads the first page (cached), hands it to the client view.
 */
export async function CollectionScreen({
  handle,
  searchParams,
  parents,
  title,
  intro,
  allowMissing,
}: CollectionScreenProps) {
  // Product lists depend on the query string (sort, filters, page), so they render per request.
  // This also keeps TanStack's Date.now() (in setQueryData / dehydrate) out of prerendering.
  // The Storefront data itself is still cached ("use cache" in getCollectionPage).
  await connection()

  const country = await getCountry()
  const query = parseCollectionParams(handle, searchParams, country)
  const data = await getCollectionPage(query)

  // A menu collection that isn't set up in Shopify yet shows "on their way" instead of a 404.
  if (!data) {
    if (!allowMissing) notFound()
    return (
      <>
        {intro}
        <div className="container-shop flex flex-col gap-6 pt-6 pb-16">
          {!intro && (
            <header className="flex flex-col gap-2.5 border-b border-line pb-4">
              <Breadcrumb items={[...parents, { label: title ?? "Collection" }]} />
              <h1 className="text-[1.5rem] leading-[1.15] md:text-[1.625rem]">{title}</h1>
            </header>
          )}
          <EmptyState
            title={`${title ?? "These"} products are on their way`}
            text="We're stocking this category right now. In the meantime, have a look around."
            action={{ label: "Browse all products", href: `/collections/${ALL_PRODUCTS_HANDLE}` }}
          />
        </div>
      </>
    )
  }

  const queryClient = makeQueryClient()
  queryClient.setQueryData(collectionQueries.page(query).queryKey, data)

  return (
    <>
      {intro}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CollectionView
          handle={handle}
          country={country}
          parents={parents}
          title={title}
        />
      </HydrationBoundary>
    </>
  )
}
