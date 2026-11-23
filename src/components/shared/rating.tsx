import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type RatingProps = {
  /** Average 0–5. Leave empty when the product has no reviews yet. */
  value?: number | null
  count?: number | null
  className?: string
}

/** Star rating. With no reviews it says so honestly instead of showing fake stars. */
export function Rating({ value, count, className }: RatingProps) {
  const hasReviews = !!count && count > 0 && value != null

  return (
    <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = hasReviews && value >= i + 0.5
          return (
            <StarIcon
              key={i}
              className={cn("size-3.5", filled ? "fill-star text-star" : "fill-line-strong text-line-strong")}
            />
          )
        })}
      </span>
      {hasReviews ? (
        <span>
          <span className="sr-only">Rated </span>
          <span className="font-semibold text-ink">{value.toFixed(1)}</span>
          <span className="sr-only"> out of 5,</span> ({count})
        </span>
      ) : (
        <span>No reviews yet</span>
      )}
    </div>
  )
}
