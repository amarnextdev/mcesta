"use client"

import { useState } from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { priceOf, sameFilter, setPrice, toggleFilter, type FilterGroup, type FilterInput } from "../../filters"
import { ActiveFilters } from "./active-filters"
import { PriceFilter } from "./price-filter"

type FilterPanelProps = {
  groups: FilterGroup[]
  filters: FilterInput[]
  onChange: (filters: FilterInput[]) => void
  onClearAll: () => void
  hasActive: boolean
  /** Hide the "Filters" title (the mobile sheet has its own). */
  hideTitle?: boolean
}

/** Lists longer than this fold behind "Show more". */
const VISIBLE = 6

const sectionTitle = "text-[0.8125rem] font-bold tracking-[0.08em] text-ink uppercase"
const clearButton = "text-xs font-bold tracking-[0.04em] text-teal uppercase hover:underline"

/** Filter sidebar. Used on desktop and inside the mobile sheet. */
export function FilterPanel({ groups, filters, onChange, onClearAll, hasActive, hideTitle }: FilterPanelProps) {
  return (
    <div className="flex flex-col">
      {!hideTitle && (
        <div className="flex items-center justify-between border-b border-line pb-3.5">
          <span className="text-xl font-bold">Filters</span>
          {hasActive && (
            <button type="button" onClick={onClearAll} className={clearButton}>
              Clear all
            </button>
          )}
        </div>
      )}

      {filters.length > 0 && (
        <ActiveFilters
          filters={filters}
          groups={groups}
          onRemove={(input) => onChange(filters.filter((f) => !sameFilter(f, input)))}
          className="border-b border-line py-3.5"
        />
      )}

      {groups.map((group) => (
        <FilterSection key={group.id} group={group} filters={filters} onChange={onChange} />
      ))}
    </div>
  )
}

function FilterSection({
  group,
  filters,
  onChange,
}: {
  group: FilterGroup
  filters: FilterInput[]
  onChange: (filters: FilterInput[]) => void
}) {
  const [open, setOpen] = useState(true)
  const [all, setAll] = useState(false)
  if (group.type !== "PRICE_RANGE" && group.values.length === 0) return null

  const isPrice = group.type === "PRICE_RANGE"
  const price = isPrice ? priceOf(filters) : null
  const selectedValues = group.values.filter((v) => filters.some((f) => sameFilter(f, v.input)))
  const selected = isPrice ? (price ? 1 : 0) : selectedValues.length
  const clear = () =>
    onChange(isPrice ? setPrice(filters, null) : filters.filter((f) => !group.values.some((v) => sameFilter(f, v.input))))
  const panelId = `${group.id}-panel`.replace(/[^\w-]/g, "-")
  const values = all ? group.values : group.values.slice(0, VISIBLE)
  const hidden = group.values.length - values.length

  return (
    <div className="border-b border-line">
      <div className="flex items-center justify-between gap-2 py-4">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className={cn(sectionTitle, "flex flex-1 items-center gap-2 text-left")}
        >
          <ChevronDownIcon aria-hidden="true" className={cn("size-4 transition-transform", !open && "-rotate-90")} />
          {group.label}
          {selected > 0 && (
            <span className="min-w-5 rounded-full bg-teal px-1.5 text-center text-[0.6875rem] leading-5 tracking-normal text-cream">
              {selected}
            </span>
          )}
        </button>
        {selected > 0 && (
          <button type="button" onClick={clear} className={clearButton}>
            Clear
          </button>
        )}
      </div>

      {open && (
        <div id={panelId} className="pb-4">
          {isPrice ? (
            <PriceFilter value={price} onChange={(range) => onChange(setPrice(filters, range))} />
          ) : (
            <>
              <ul className="flex flex-col">
                {values.map((value) => {
                  const checked = filters.some((f) => sameFilter(f, value.input))
                  const empty = value.count === 0 && !checked
                  return (
                    <li key={value.id}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        disabled={empty}
                        onClick={() => onChange(toggleFilter(filters, value.input))}
                        className="-mx-1.5 flex min-h-9 w-[calc(100%+0.75rem)] items-center gap-2.5 rounded-lg px-1.5 text-left text-sm text-ink transition-colors hover:bg-sand focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "grid size-[18px] flex-none place-items-center rounded-[5px] border-[1.5px] transition-colors",
                            checked ? "border-teal bg-teal text-cream" : "border-line-strong bg-white"
                          )}
                        >
                          {checked && <CheckIcon className="size-3" strokeWidth={3} />}
                        </span>
                        <span className={cn("flex-1", checked && "font-semibold")}>{value.label}</span>
                        {value.count !== null && <span className="text-xs text-slate tabular-nums">{value.count}</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
              {hidden > 0 && (
                <button type="button" onClick={() => setAll(true)} className="mt-1 text-[0.8125rem] font-semibold text-teal hover:underline">
                  Show {hidden} more
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
