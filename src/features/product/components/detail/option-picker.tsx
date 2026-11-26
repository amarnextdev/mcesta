import Image from "next/image"
import { CheckIcon } from "lucide-react"

import { formatMoney } from "@/lib/format"
import type { ProductDetail, ProductOption } from "@/lib/shopify/types"
import { cn } from "@/lib/utils"

import { isVisualOption, optionState, type Selection } from "../../variants"

type OptionPickerProps = {
  product: ProductDetail
  option: ProductOption
  selection: Selection
  onSelect: (selection: Selection) => void
}

/**
 * One product option (design): photo swatches for finish / colour, cards with price for the rest.
 * Sold-out values stay clickable (so the shopper sees it's sold out) but are struck through.
 */
export function OptionPicker({ product, option, selection, onSelect }: OptionPickerProps) {
  const current = selection[option.name]
  const visual = isVisualOption(option.name)
  const label = option.name.charAt(0).toUpperCase() + option.name.slice(1)
  // Show a price under each swatch only when the choice changes the price.
  const showPrices =
    new Set(option.values.map((v) => optionState(product, selection, option.name, v).variant?.price.amount)).size > 1

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 flex w-full items-baseline justify-between gap-3 text-[0.9375rem]">
        <span>
          <span className="font-bold">{label}:</span> <span className="font-medium text-ink/80">{current}</span>
        </span>
        <span className="text-[0.8125rem] text-slate">
          {option.values.length} {visual ? "options" : "choices"}
        </span>
      </legend>

      <div
        role="radiogroup"
        aria-label={label}
        className={cn(visual ? "flex flex-wrap gap-x-2.5 gap-y-3.5" : "grid grid-cols-2 gap-2.5 sm:grid-cols-3")}
      >
        {option.values.map((value) => {
          const state = optionState(product, selection, option.name, value)
          const on = value === current
          const soldOut = !state.available

          if (visual) {
            const image = state.variant?.image
            const price = state.variant?.price
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={`${value}${soldOut ? " (sold out)" : ""}`}
                title={value}
                onClick={() => onSelect(state.selection)}
                className="group/sw relative flex w-[76px] flex-col items-center gap-1.5 focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "relative block rounded-xl border-[1.5px] bg-white p-[3px] transition-all duration-150 group-focus-visible/sw:ring-3 group-focus-visible/sw:ring-ring/50",
                    on
                      ? "border-teal shadow-[0_0_0_3px_var(--color-teal-soft)]"
                      : "border-line group-hover/sw:-translate-y-0.5 group-hover/sw:border-line-strong group-hover/sw:shadow-[0_6px_14px_-8px_rgba(31,42,46,0.3)]"
                  )}
                >
                  <span className="relative block size-16 overflow-hidden rounded-[9px] bg-sand">
                    {image ? (
                      <Image src={image.url} alt="" fill sizes="64px" className={cn("object-cover", soldOut && "opacity-40 grayscale")} />
                    ) : (
                      <span className="grid size-full place-items-center font-heading text-xl text-ink/40">{value[0]}</span>
                    )}
                    {soldOut && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(to_top_right,transparent_calc(50%-1px),var(--color-slate)_50%,transparent_calc(50%+1px))]"
                      />
                    )}
                  </span>
                  {on && (
                    <span aria-hidden="true" className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full border-2 border-white bg-teal text-cream shadow-sm">
                      <CheckIcon className="size-2.5" strokeWidth={3.5} />
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "line-clamp-2 text-center text-xs leading-tight",
                    on ? "font-bold text-ink" : "text-slate group-hover/sw:text-ink",
                    soldOut && "line-through"
                  )}
                >
                  {value}
                </span>
                {showPrices && price && (
                  <span className={cn("text-[0.6875rem] tabular-nums", on ? "font-semibold text-teal" : "text-slate")}>{formatMoney(price)}</span>
                )}
              </button>
            )
          }

          const price = state.variant?.price
          const compare = state.variant?.compareAtPrice
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onSelect(state.selection)}
              className={cn(
                "flex flex-col gap-1.5 rounded-[14px] border-2 p-3.5 text-left transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                on ? "border-teal bg-teal-tint" : "border-line bg-white hover:border-line-strong"
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span
                  aria-hidden="true"
                  className={cn("grid size-[18px] place-items-center rounded-full border-2", on ? "border-teal" : "border-line-strong")}
                >
                  {on && <span className="size-2 rounded-full bg-teal" />}
                </span>
                {soldOut && (
                  <span className="rounded-full bg-sand px-1.5 py-0.5 text-[0.625rem] font-bold tracking-[0.05em] text-slate uppercase">
                    Sold out
                  </span>
                )}
              </span>
              <span className={cn("text-[0.9375rem] font-bold", soldOut && "text-slate")}>{value}</span>
              {price && (
                <span className="mt-auto flex flex-wrap items-baseline gap-1.5 border-t border-dashed border-line-strong pt-2">
                  <span className="font-bold tabular-nums">{formatMoney(price)}</span>
                  {compare && <span className="text-[0.8125rem] text-slate tabular-nums line-through">{formatMoney(compare)}</span>}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
