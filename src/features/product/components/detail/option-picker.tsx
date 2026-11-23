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

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 flex w-full items-baseline justify-between gap-3 text-[0.9375rem]">
        <span>
          <span className="font-bold">{option.name}:</span> <span className="text-slate">{current}</span>
        </span>
        <span className="text-[0.8125rem] text-slate">
          {option.values.length} {visual ? "options" : "choices"}
        </span>
      </legend>

      <div
        role="radiogroup"
        aria-label={option.name}
        className={cn(visual ? "flex flex-wrap gap-3" : "grid grid-cols-2 gap-2.5 sm:grid-cols-3")}
      >
        {option.values.map((value) => {
          const state = optionState(product, selection, option.name, value)
          const on = value === current
          const soldOut = !state.available

          if (visual) {
            const image = state.variant?.image
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={`${value}${soldOut ? " (sold out)" : ""}`}
                onClick={() => onSelect(state.selection)}
                className="group/sw relative flex w-[84px] flex-col items-center gap-2 focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "block rounded-[14px] border-2 bg-white p-[3px] transition-colors group-focus-visible/sw:ring-3 group-focus-visible/sw:ring-ring/50",
                    on ? "border-teal" : "border-line hover:border-line-strong"
                  )}
                >
                  <span className="relative block size-[72px] overflow-hidden rounded-[10px] bg-sand">
                    {image ? (
                      <Image src={image.url} alt="" fill sizes="72px" className={cn("object-cover", soldOut && "opacity-40")} />
                    ) : (
                      <span className="grid size-full place-items-center font-heading text-xl text-ink/40">{value[0]}</span>
                    )}
                  </span>
                </span>
                {on && (
                  <span aria-hidden="true" className="absolute -top-1.5 right-0.5 grid size-[22px] place-items-center rounded-full border-2 border-cream bg-teal text-cream">
                    <CheckIcon className="size-3" strokeWidth={3} />
                  </span>
                )}
                <span className={cn("text-center text-[0.8125rem] leading-tight", on ? "font-bold text-ink" : "text-slate", soldOut && "line-through")}>
                  {value}
                </span>
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
