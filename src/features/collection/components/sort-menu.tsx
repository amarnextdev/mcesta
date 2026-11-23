"use client"

import { CheckIcon, ChevronDownIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { isCollectionSort, sortOptions } from "../sort"
import type { CollectionSort } from "../types"

/** "Sort by: Featured ▾" with a radio list (keyboard and screen-reader friendly via Radix). */
export function SortMenu({ value, onChange }: { value: CollectionSort; onChange: (sort: CollectionSort) => void }) {
  const current = sortOptions.find((o) => o.value === value) ?? sortOptions[0]

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="inline-flex h-9 flex-none items-center gap-2 rounded-[10px] px-2.5 text-sm text-slate transition-colors hover:bg-sand focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-[state=open]:bg-sand">
        Sort by:
        <span className="font-bold text-ink">{current.label}</span>
        <ChevronDownIcon aria-hidden="true" className="size-4 text-ink" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-auto min-w-[230px] rounded-xl border border-line bg-white p-1.5 shadow-[0_12px_32px_rgba(31,42,46,0.14)] ring-0"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => isCollectionSort(v) && onChange(v)}>
          {sortOptions.map((option) => {
            const on = option.value === value
            return (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className={cn(
                  "h-10 rounded-lg px-3 pr-3 text-sm focus:bg-sand [&>[data-slot=dropdown-menu-radio-item-indicator]]:hidden",
                  on ? "bg-teal-soft font-bold text-teal focus:bg-teal-soft focus:text-teal" : "font-medium text-ink"
                )}
              >
                <span className="flex-1">{option.label}</span>
                {on && <CheckIcon aria-hidden="true" className="size-4" />}
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
