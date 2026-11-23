import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type PaginationProps = {
  page: number
  pageCount: number
  /** First and last product number on this page, e.g. 25 and 48. */
  from: number
  to: number
  total: number
  totalCapped: boolean
  onPage: (page: number) => void
  /** Warm a page on hover so the click feels instant. */
  onIntent?: (page: number) => void
}

/** Page numbers to show: 1 … 4 5 6 … 12 (always first, last and two around the current one). */
export function pageItems(page: number, pageCount: number): (number | "gap")[] {
  if (!Number.isFinite(pageCount) || pageCount < 1) return [1]
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const items: (number | "gap")[] = [1]
  const start = Math.max(2, Math.min(page - 1, pageCount - 4))
  const end = Math.min(pageCount - 1, Math.max(page + 1, 5))
  if (start > 2) items.push("gap")
  for (let i = start; i <= end; i++) items.push(i)
  if (end < pageCount - 1) items.push("gap")
  items.push(pageCount)
  return items
}

const box =
  "inline-flex h-10 items-center justify-center rounded-[10px] border-[1.5px] text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"

/** Bottom pager (design): "Showing 25–48 of 186 products" · ‹ Prev 1 … 4 5 6 … 12 Next ›. */
export function Pagination({ page, pageCount, from, to, total, totalCapped, onPage, onIntent }: PaginationProps) {
  if (!Number.isFinite(pageCount) || pageCount <= 1) return null
  const hasPrev = page > 1
  const hasNext = page < pageCount

  return (
    <nav aria-label="Pagination" className="mt-3 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
      <span aria-live="polite" className="text-sm text-slate">
        Showing{" "}
        <span className="font-bold text-ink">
          {from}–{to}
        </span>{" "}
        of <span className="font-bold text-ink">{totalCapped ? `${total}+` : total}</span> products
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          onPointerEnter={() => hasPrev && onIntent?.(page - 1)}
          disabled={!hasPrev}
          aria-label="Previous page"
          className={cn(
            box,
            "gap-1 border-line px-3 font-semibold text-ink hover:border-ink disabled:cursor-not-allowed disabled:text-slate/50 disabled:hover:border-line"
          )}
        >
          <ChevronLeftIcon aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {pageItems(page, pageCount).map((item, i) =>
          item === "gap" ? (
            <span key={`gap-${i}`} aria-hidden="true" className="w-6 text-center font-bold text-slate">
              …
            </span>
          ) : (
            <button
              key={`page-${item}`}
              type="button"
              onClick={() => item !== page && onPage(item)}
              onPointerEnter={() => item !== page && onIntent?.(item)}
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                box,
                "min-w-10 px-2 font-bold",
                item === page ? "border-teal bg-teal-soft text-teal" : "border-transparent text-ink hover:border-line hover:bg-white",
                // Phones: keep only first, current and last to fit one row.
                item !== page && item !== 1 && item !== pageCount && "hidden sm:inline-flex"
              )}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPage(page + 1)}
          onPointerEnter={() => hasNext && onIntent?.(page + 1)}
          onFocus={() => hasNext && onIntent?.(page + 1)}
          disabled={!hasNext}
          aria-label="Next page"
          className={cn(
            box,
            "gap-1 border-ink px-3 font-semibold text-ink hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:border-line disabled:text-slate/50 disabled:hover:bg-transparent"
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRightIcon aria-hidden="true" className="size-4" />
        </button>
      </div>
    </nav>
  )
}
