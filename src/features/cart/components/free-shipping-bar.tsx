import { CheckIcon, PartyPopperIcon, TruckIcon } from "lucide-react"

import { formatMoney } from "@/lib/format"
import type { Money } from "@/lib/shopify/types"
import { cn } from "@/lib/utils"

import { FREE_SHIPPING_THRESHOLD } from "../config"

/**
 * Free-shipping progress (cart page and drawer).
 * Below the threshold: how much is left, with a bar that ends at a truck marker.
 * Reached: a calm success row instead of a full bar.
 */
export function FreeShippingBar({
  subtotal,
  compact,
  className,
}: {
  subtotal: Money
  /** Smaller version for the cart drawer (no second line, smaller icon). */
  compact?: boolean
  className?: string
}) {
  const left = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal.amount)
  const pct = Math.min(100, (subtotal.amount / FREE_SHIPPING_THRESHOLD) * 100)
  const money = (amount: number) => formatMoney({ amount, currencyCode: subtotal.currencyCode })

  if (left === 0) {
    return (
      <div role="status" className={cn("flex items-center gap-3", className)}>
        <span aria-hidden="true" className={cn("grid flex-none place-items-center rounded-full bg-success-soft text-success", compact ? "size-8" : "size-10")}>
          <PartyPopperIcon className={compact ? "size-4" : "size-5"} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-snug">
          <span className={cn("font-bold text-success", compact ? "text-sm" : "text-[0.9375rem]")}>You&apos;ve unlocked free US shipping</span>
          {!compact && <span className="text-[0.8125rem] text-slate">Tracked delivery in 3–7 business days, on us.</span>}
        </span>
        <span className="hidden items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-bold text-white sm:inline-flex">
          <CheckIcon aria-hidden="true" className="size-3.5" strokeWidth={3} />
          Free
        </span>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col", compact ? "gap-2.5" : "gap-3", className)}>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={cn("grid flex-none place-items-center rounded-full bg-teal-soft text-teal", compact ? "size-8" : "size-10")}>
          <TruckIcon className={compact ? "size-4" : "size-5"} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-snug">
          <span className={compact ? "text-sm" : "text-[0.9375rem]"}>
            You&apos;re <span className="font-bold text-teal">{money(left)}</span> away from{" "}
            <span className="font-bold">free US shipping</span>
          </span>
          {!compact && <span className="text-[0.8125rem] text-slate">Free on US orders over {money(FREE_SHIPPING_THRESHOLD)}</span>}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <span
          role="progressbar"
          aria-label="Progress to free shipping"
          aria-valuemin={0}
          aria-valuemax={FREE_SHIPPING_THRESHOLD}
          aria-valuenow={Math.round(subtotal.amount)}
          aria-valuetext={`${money(subtotal.amount)} of ${money(FREE_SHIPPING_THRESHOLD)}`}
          className="relative h-2 flex-1 overflow-hidden rounded-full bg-line-soft"
        >
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-teal-line to-teal transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(pct, 4)}%` }}
          />
        </span>
        <span className="text-xs font-semibold text-slate tabular-nums">
          {money(subtotal.amount)} / {money(FREE_SHIPPING_THRESHOLD)}
        </span>
      </div>
    </div>
  )
}
