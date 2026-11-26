"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { EmptyState } from "@/components/shared/empty-state"
import { FilterChips } from "@/components/shared/filter-chips"
import { SectionHeader } from "@/components/shared/section-header"
import { ProductGridSkeleton } from "@/components/skeletons/product-card-skeleton"
import { cn } from "@/lib/utils"

import { productQueries } from "../queries"
import type { ShelfConfig } from "../types"
import { ProductGrid } from "./product-grid"

/**
 * Client part of a shelf: filter chips + the product row.
 * The default filter is already in the cache (prefetched on the server); other filters fetch on click.
 */
export function ProductShelfBody({ config, country }: { config: ShelfConfig; country: string }) {
  const [active, setActive] = useState(config.filters[0]?.key ?? "all")
  const filter = config.filters.find((f) => f.key === active) ?? config.filters[0]
  const params = { ...filter?.params, country }

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    ...productQueries.list(params),
    placeholderData: keepPreviousData,
  })

  return (
    <>
      <SectionHeader
        id={`${config.id}-h`}
        title={config.title}
        subtitle={config.subtitle}
        action={config.action}
        tabs={
          config.filters.length > 1 && (
            <FilterChips
              label={`Filter ${config.title.toLowerCase()}`}
              chips={config.filters.map(({ key, label }) => ({ key, label }))}
              value={active}
              onChange={setActive}
            />
          )
        }
      />

      {isPending ? (
        <ProductGridSkeleton layout="shelf" count={5} />
      ) : isError ? (
        <EmptyState
          title="We couldn't load these products"
          text="Check your connection and try again."
          className="py-8"
          action={undefined}
          icon={
            <button type="button" onClick={() => refetch()} className="text-sm font-semibold text-teal underline">
              Try again
            </button>
          }
        />
      ) : data && data.length > 0 ? (
        <div aria-busy={isFetching} className={cn("transition-opacity", isFetching && "opacity-60")}>
          <ProductGrid products={data} layout="shelf" />
        </div>
      ) : (
        <EmptyState
          title="Nothing here yet"
          text="New products for this filter are on the way."
          action={config.action}
        />
      )}
    </>
  )
}
