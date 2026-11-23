import { ProductGridSkeleton } from "@/components/skeletons/product-card-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

/** Same shape as CollectionView (filters + header + grid), shown while the page streams in. */
export function CollectionSkeleton() {
  return (
    <div className="container-shop pt-4 pb-16">
      <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div aria-hidden="true" className="hidden flex-col gap-3 lg:flex">
          <Skeleton className="h-6 w-20" />
          <div className="mt-2 flex flex-col gap-3 border-t border-line pt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="mt-2 h-3.5 w-16" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 rounded-[10px]" />
              ))}
            </div>
            <Skeleton className="mt-2 h-3.5 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-[18px]">
          <div aria-hidden="true" className="flex flex-col gap-3 border-b border-line pb-3">
            <Skeleton className="h-3.5 w-40" />
            <div className="flex flex-wrap items-baseline gap-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex items-end justify-between gap-4 pt-2">
              <div className="flex gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-14" />
                ))}
              </div>
              <Skeleton className="hidden h-[2.375rem] w-44 rounded-[10px] sm:block" />
            </div>
          </div>
          <ProductGridSkeleton count={6} layout="collection" />
        </div>
      </div>
    </div>
  )
}
