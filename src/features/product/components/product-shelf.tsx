import { connection } from "next/server"
import { Suspense } from "react"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { FilterChipsStatic } from "@/components/shared/filter-chips-static"
import { SectionHeader } from "@/components/shared/section-header"
import { ProductGridSkeleton } from "@/components/skeletons/product-card-skeleton"
import { getCountry } from "@/lib/market/market.server"
import { makeQueryClient } from "@/lib/query/query-client"
import { cn } from "@/lib/utils"

import { getProducts } from "../api.server"
import { productQueries } from "../queries"
import type { ShelfConfig } from "../types"
import { ProductShelfBody } from "./product-shelf-body"

async function ShelfData({ config }: { config: ShelfConfig }) {
  // Hydration stamps the time, so this part renders per request; the data itself is cached.
  await connection()
  const country = await getCountry()
  const params = { ...config.filters[0]?.params, country }
  const queryClient = makeQueryClient()
  // Wait for the data (this part streams in behind its Suspense skeleton), so the server HTML
  // and the browser's first render both start from the same finished result.
  await queryClient.prefetchQuery({ ...productQueries.list(params), queryFn: () => getProducts(params) })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductShelfBody config={config} country={country} />
    </HydrationBoundary>
  )
}

/** A titled row of products with optional filter chips. Streams in with a matching skeleton. */
export function ProductShelf({ config, className }: { config: ShelfConfig; className?: string }) {
  return (
    <section id={config.id} aria-labelledby={`${config.id}-h`} className={cn("container-shop", className)}>
      <Suspense
        fallback={
          <>
            <SectionHeader
              id={`${config.id}-h`}
              title={config.title}
              subtitle={config.subtitle}
              action={config.action}
              tabs={config.filters.length > 1 && <FilterChipsStatic chips={config.filters} />}
            />
            <ProductGridSkeleton layout="shelf" count={5} />
          </>
        }
      >
        <ShelfData config={config} />
      </Suspense>
    </section>
  )
}
