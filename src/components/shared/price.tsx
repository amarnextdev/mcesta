import { cn } from "@/lib/utils"
import { formatMoney } from "@/lib/format"
import type { Money } from "@/lib/shopify/types"

type PriceProps = {
  price: Money
  /** Original price; shown struck through with a "Save" note when higher than `price`. */
  compareAtPrice?: Money | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizes = {
  sm: { now: "text-base", was: "text-[0.8125rem]", save: "text-xs" },
  md: { now: "text-[1.1875rem]", was: "text-sm", save: "text-[0.8125rem]" },
  lg: { now: "text-3xl", was: "text-lg", save: "text-sm" },
} as const

/** Price with optional sale state. Sale price uses terracotta, savings use green. */
export function Price({ price, compareAtPrice, size = "md", className }: PriceProps) {
  const onSale = !!compareAtPrice && compareAtPrice.amount > price.amount
  const s = sizes[size]

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-bold tabular-nums", s.now, onSale ? "text-terra-text" : "text-ink")}>
        <span className="sr-only">{onSale ? "Sale price " : "Price "}</span>
        {formatMoney(price)}
      </span>
      {onSale && (
        <>
          <span className={cn("text-muted-foreground tabular-nums line-through", s.was)}>
            <span className="sr-only">Regular price </span>
            {formatMoney(compareAtPrice)}
          </span>
          <span className={cn("font-semibold text-success", s.save)}>
            Save {formatMoney({ amount: compareAtPrice.amount - price.amount, currencyCode: price.currencyCode })}
          </span>
        </>
      )}
    </div>
  )
}
