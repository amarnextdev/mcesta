import { Skeleton } from "@/components/ui/skeleton"
import { listLayouts, type ListLayout } from "@/lib/layout"
import { cn } from "@/lib/utils"

/** Mirrors ProductCard's layout so nothing jumps when real data arrives. */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex flex-col overflow-hidden rounded-2xl border border-line-soft bg-white", className)}
    >
      <Skeleton className="mx-2 mt-2 aspect-[5/4] rounded-xl" />
      <div className="flex flex-col gap-2 px-3.5 pt-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-1 h-5 w-16" />
      </div>
      <div className="px-3.5 pt-3 pb-3.5">
        <Skeleton className="h-[2.625rem] w-full rounded-[10px]" />
      </div>
    </div>
  )
}

/** Skeleton list with the same layout classes as ProductGrid. */
export function ProductGridSkeleton({
  count = 8,
  layout = "grid",
  className,
}: {
  count?: number
  layout?: ListLayout
  className?: string
}) {
  return (
    <div role="status" aria-label="Loading products" className={className}>
      <ul className={listLayouts[layout]}>
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="flex">
            <ProductCardSkeleton className="w-full" />
          </li>
        ))}
      </ul>
    </div>
  )
}
