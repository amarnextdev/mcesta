"use client"

import { useState } from "react"
import { SlidersHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import type { FilterGroup, FilterInput } from "../../filters"
import { FilterPanel } from "./filter-panel"

type MobileFiltersProps = {
  groups: FilterGroup[]
  filters: FilterInput[]
  onChange: (filters: FilterInput[]) => void
  onClearAll: () => void
  hasActive: boolean
  /** Products found with the current filters (shown on the close button). */
  resultLabel: string
}

/** Phones and tablets: "Filters" button that opens the same panel in a side sheet. */
export function MobileFilters({ resultLabel, ...panel }: MobileFiltersProps) {
  const [open, setOpen] = useState(false)
  const count = panel.filters.length

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex h-[2.375rem] items-center gap-2 rounded-[10px] border-[1.5px] border-line-strong bg-white px-3 text-sm font-semibold text-ink hover:border-ink lg:hidden">
        <SlidersHorizontalIcon aria-hidden="true" className="size-4" />
        Filters
        {count > 0 && (
          <span className="min-w-5 rounded-full bg-teal px-1.5 text-center text-[0.6875rem] leading-5 text-cream">{count}</span>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[88vw] max-w-sm flex-col gap-0 bg-cream p-0">
        <SheetHeader className="flex-row items-center justify-between border-b border-line px-5 py-4">
          <SheetTitle className="font-sans text-xl font-bold">Filters</SheetTitle>
          {panel.hasActive && (
            <button type="button" onClick={panel.onClearAll} className="mr-8 text-[0.8125rem] font-bold tracking-[0.04em] text-teal uppercase">
              Clear all
            </button>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5">
          <FilterPanel {...panel} hideTitle />
        </div>
        <div className="border-t border-line bg-white p-4">
          <Button size="lg" className="h-12 w-full" onClick={() => setOpen(false)}>
            {resultLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
