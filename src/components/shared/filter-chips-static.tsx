import { cn } from "@/lib/utils"

import type { Chip } from "./filter-chips"

/** Same look as FilterChips, without interaction. Used in loading states so the header doesn't jump. */
export function FilterChipsStatic({ chips, className }: { chips: Chip[]; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex flex-wrap gap-2", className)}>
      {chips.map((chip, i) => (
        <span
          key={chip.key}
          className={cn(
            "inline-flex h-9 items-center rounded-full border-[1.5px] px-4 text-sm font-semibold",
            i === 0 ? "border-ink bg-ink text-cream" : "border-line-strong text-ink"
          )}
        >
          {chip.label}
        </span>
      ))}
    </div>
  )
}
