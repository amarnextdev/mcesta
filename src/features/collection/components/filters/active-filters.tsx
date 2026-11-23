import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { filterKey, filterLabel, type FilterGroup, type FilterInput } from "../../filters"

/** Removable chips for the filters in use, shown under the "Filters" heading. */
export function ActiveFilters({
  filters,
  groups,
  onRemove,
  className,
}: {
  filters: FilterInput[]
  groups: FilterGroup[]
  onRemove: (input: FilterInput) => void
  className?: string
}) {
  if (filters.length === 0) return null

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.map((input) => {
        const label = filterLabel(input, groups)
        return (
          <button
            key={filterKey(input)}
            type="button"
            onClick={() => onRemove(input)}
            aria-label={`Remove filter ${label}`}
            className="inline-flex h-[2.125rem] items-center gap-2 rounded-full bg-teal-soft px-3 text-[0.8125rem] font-semibold text-teal transition-colors hover:bg-teal hover:text-cream focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {label}
            <XIcon aria-hidden="true" className="size-3.5" />
          </button>
        )
      })}
    </div>
  )
}
