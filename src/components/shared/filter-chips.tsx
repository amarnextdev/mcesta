"use client"

import { cn } from "@/lib/utils"

export type Chip = { key: string; label: string }

type FilterChipsProps = {
  chips: Chip[]
  value: string
  onChange: (key: string) => void
  label: string
  className?: string
}

/** Pill toggles (one active). Dark when selected, outlined otherwise. */
export function FilterChips({ chips, value, onChange, label, className }: FilterChipsProps) {
  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {chips.map((chip) => {
        const on = chip.key === value
        return (
          <button
            key={chip.key}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(chip.key)}
            className={cn(
              "h-9 rounded-full border-[1.5px] px-4 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              on ? "border-ink bg-ink text-cream" : "border-line-strong bg-transparent text-ink hover:border-ink"
            )}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
