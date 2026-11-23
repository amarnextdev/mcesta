import { FlameIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { collectionTabs } from "../config"
import type { CollectionTab } from "../types"

/** Underlined quick tabs. They filter the grid, so they're toggle buttons, not page links. */
export function CollectionTabs({ value, onChange }: { value: CollectionTab; onChange: (tab: CollectionTab) => void }) {
  return (
    <div
      role="group"
      aria-label="Show"
      className="-mx-4 flex items-center gap-6 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {collectionTabs.map((tab) => {
        const on = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(tab.value)}
            className={cn(
              "-mb-px inline-flex h-10 flex-none items-center gap-1.5 border-b-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              on ? "border-teal font-bold" : "border-transparent font-medium hover:border-line-strong",
              tab.hot ? "text-terra-text" : on ? "text-teal" : "text-ink"
            )}
          >
            {tab.hot && <FlameIcon aria-hidden="true" className="size-4" />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
