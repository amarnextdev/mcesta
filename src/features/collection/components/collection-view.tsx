"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useRef } from "react"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, type Crumb } from "@/components/shared/breadcrumb"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/features/product/components/product-grid"
import { cn } from "@/lib/utils"

import { ALL_PRODUCTS_HANDLE, COLLECTION_PAGE_SIZE, DEFAULT_TAB } from "../config"
import { collectionQueries } from "../queries"
import { collectionSearch, parseCollectionParams } from "../search-params"
import type { CollectionParams } from "../types"
import { CollectionSkeleton } from "./collection-skeleton"
import { CollectionTabs } from "./collection-tabs"
import { FilterPanel } from "./filters/filter-panel"
import { MobileFilters } from "./filters/mobile-filters"
import { Pagination } from "./pagination"
import { SortMenu } from "./sort-menu"

/**
 * Collection page (design: Collection.dc.html).
 * The URL is the source of truth: tabs and sort update it with history.pushState (no server
 * round trip), useSearchParams picks the change up and TanStack Query loads the new list
 * while the old one stays on screen.
 */
type CollectionViewProps = {
  /** Shopify collection handle. The URL may differ (/{department}/{category}). */
  handle: string
  /** Shopper's market, from the server (same value the first page was loaded with). */
  country: string
  /** Breadcrumb trail above the current page, e.g. Home › Electronics. */
  parents: Crumb[]
  /** Page title from the menu. Falls back to the Shopify collection title. */
  title?: string
}

export function CollectionView({ handle, country, parents, title: menuTitle }: CollectionViewProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useMemo(
    () => parseCollectionParams(handle, searchParams, country),
    [handle, searchParams, country]
  )

  const { data, isPending, isError, isPlaceholderData, isFetching, refetch } = useQuery({
    ...collectionQueries.page(params),
    placeholderData: keepPreviousData,
  })

  const queryClient = useQueryClient()
  const topRef = useRef<HTMLElement>(null)

  const update = useCallback(
    (next: Partial<Omit<CollectionParams, "handle">>) => {
      // Any change of list (sort, tab, filters) goes back to page 1.
      const merged = { ...params, page: 1, ...next }
      window.history.pushState(null, "", `${pathname}${collectionSearch(merged)}`)
    },
    [params, pathname]
  )

  const goToPage = (page: number) => {
    update({ page })
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const prefetchPage = (page: number) => {
    void queryClient.prefetchQuery(collectionQueries.page({ ...params, page }))
  }

  if (isPending) return <CollectionSkeleton />

  if (isError || !data) {
    return (
      <div className="container-shop py-16">
        <EmptyState title="We couldn't load this collection" text="Please check your connection and try again." />
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  const { collection, products, filterGroups } = data
  // Defaults guard against data cached before paging totals existed.
  const pageCount = Math.max(1, data.pageCount ?? 1)
  const total = data.total ?? products.length
  const totalCapped = data.totalCapped ?? false
  const title = menuTitle ?? collection.title
  const count = products.length
  const loading = isPlaceholderData && isFetching
  const filtered = params.tab !== DEFAULT_TAB || params.filters.length > 0
  const clearAll = () => update({ tab: DEFAULT_TAB, filters: [] })
  const setFilters = (filters: CollectionParams["filters"]) => update({ filters })
  const panelProps = {
    groups: filterGroups,
    filters: params.filters,
    onChange: setFilters,
    onClearAll: clearAll,
    hasActive: filtered,
  }
  const page = Math.min(params.page, pageCount)
  const from = (page - 1) * COLLECTION_PAGE_SIZE + 1
  const to = from + count - 1
  const totalLabel = totalCapped ? `${total}+` : String(total)
  const showing =
    count === 0
      ? "No products found"
      : pageCount > 1
        ? `Showing ${from}–${to} of ${totalLabel} products`
        : `${total} ${total === 1 ? "product" : "products"}`

  return (
    <section ref={topRef} aria-labelledby="col-h" className="container-shop scroll-mt-[140px] pt-4 pb-16">
      <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Sticks below the sticky header; scrolls on its own when taller than the screen. */}
        <aside
          aria-label="Filters"
          className="sticky top-[8.5rem] -mx-2 hidden max-h-[calc(100vh-152px)] overflow-x-hidden overflow-y-auto px-2 [scrollbar-width:thin] lg:block"
        >
          <FilterPanel {...panelProps} />
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1.5 border-b border-line">
            <Breadcrumb items={[...parents, { label: title }]} />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 id="col-h" className="text-[1.25rem] leading-tight md:text-[1.25rem]">
                {title}
              </h1>
              <span aria-live="polite" className="text-[0.8125rem] text-slate">
                {loading ? "Updating…" : showing}
              </span>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <CollectionTabs value={params.tab} onChange={(tab) => update({ tab })} />
              <div className="flex items-center justify-end gap-2 sm:-mr-2.5">
                <MobileFilters
                  {...panelProps}
                  resultLabel={count === 0 ? "No products found" : `Show ${totalLabel} products`}
                />
                <SortMenu value={params.sort} onChange={(sort) => update({ sort })} />
              </div>
            </div>
          </div>

          {count === 0 ? (
            filtered ? (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <p className="font-heading text-[1.375rem] leading-tight">No products match these filters</p>
                <p className="text-[0.9375rem] text-slate">Try removing a filter or two.</p>
                <Button size="lg" className="mt-1 h-[2.875rem]" onClick={clearAll}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <EmptyState
                title="Nothing here yet"
                text="We're adding products to this collection soon. In the meantime, have a look around."
                action={{ label: "Browse all products", href: `/collections/${ALL_PRODUCTS_HANDLE}` }}
              />
            )
          ) : (
            <div aria-busy={loading} className={cn("transition-opacity", loading && "pointer-events-none opacity-60")}>
              <ProductGrid products={products} layout="collection" preloadCount={3} />
              <Pagination
                page={page}
                pageCount={pageCount}
                from={from}
                to={to}
                total={total}
                totalCapped={totalCapped}
                onPage={goToPage}
                onIntent={prefetchPage}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
