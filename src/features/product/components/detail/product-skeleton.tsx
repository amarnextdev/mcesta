import { Skeleton } from "@/components/ui/skeleton"

/** Same shape as the product page while it loads. */
export function ProductSkeleton() {
  return (
    <div aria-hidden="true" className="container-shop flex flex-col gap-4 pt-4 pb-16">
      <Skeleton className="h-3.5 w-64" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-12">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className={i === 0 ? "aspect-square rounded-2xl" : "hidden aspect-square rounded-2xl lg:block"} />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-2 h-9 w-36" />
          <div className="mt-4 flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="size-[78px] rounded-[14px]" />
            ))}
          </div>
          <div className="mt-4 flex gap-2.5">
            <Skeleton className="h-[3.25rem] w-28 rounded-[10px]" />
            <Skeleton className="h-[3.25rem] flex-1 rounded-[10px]" />
            <Skeleton className="h-[3.25rem] flex-1 rounded-[10px]" />
          </div>
          <Skeleton className="mt-2 h-56 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
