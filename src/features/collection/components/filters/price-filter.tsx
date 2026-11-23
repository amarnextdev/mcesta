"use client"

import { useState } from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { priceStops } from "../../filters"

type Range = { min?: number; max?: number }

const last = priceStops.length - 1
const stopLabel = (i: number) => (i === last ? `$${priceStops[last]}+` : `$${priceStops[i]}`)

/** Nearest stop at or above a price (for showing a URL price on the slider). */
function toIndex(price: number | undefined, fallback: number) {
  if (price === undefined) return fallback
  const i = priceStops.findIndex((p) => p >= price)
  return i === -1 ? last : i
}

function toRange(lo: number, hi: number): Range | null {
  const range: Range = {}
  if (lo > 0) range.min = priceStops[lo]
  if (hi < last) range.max = priceStops[hi]
  return range.min === undefined && range.max === undefined ? null : range
}

const thumb =
  "pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent focus-visible:outline-none " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-teal [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(31,42,46,0.25)] " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-teal [&::-moz-range-thumb]:bg-white " +
  "focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-ring/30"

/**
 * Price filter: two-handle slider on fixed stops plus Min / Max dropdowns (shadcn Select).
 * The slider applies when you let go (not on every pixel), the dropdowns apply straight away.
 */
export function PriceFilter({ value, onChange }: { value: Range | null; onChange: (range: Range | null) => void }) {
  const fromValue = (): [number, number] => [toIndex(value?.min, 0), toIndex(value?.max, last)]
  const [[lo, hi], setDraft] = useState(fromValue)
  const [synced, setSynced] = useState(value)

  // Follow outside changes (chip removed, Clear all, back button).
  if (synced?.min !== value?.min || synced?.max !== value?.max) {
    setSynced(value)
    setDraft(fromValue())
  }

  const commit = (nextLo = lo, nextHi = hi) => {
    const next = toRange(nextLo, nextHi)
    if (next?.min !== value?.min || next?.max !== value?.max) onChange(next)
  }

  const pct = (i: number) => (i / last) * 100

  return (
    <div className="flex flex-col gap-4 pt-1">
      <div className="relative mx-2.5 h-5">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-teal"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={lo}
          aria-label="Minimum price"
          aria-valuetext={stopLabel(lo)}
          onChange={(e) => setDraft([Math.min(Number(e.target.value), hi - 1), hi])}
          onPointerUp={() => commit()}
          onKeyUp={() => commit()}
          className={cn(thumb, lo > last - 2 && "z-10")}
        />
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={hi}
          aria-label="Maximum price"
          aria-valuetext={stopLabel(hi)}
          onChange={(e) => setDraft([lo, Math.max(Number(e.target.value), lo + 1)])}
          onPointerUp={() => commit()}
          onKeyUp={() => commit()}
          className={thumb}
        />
      </div>

      <div aria-hidden="true" className="-mt-2 mx-2.5 flex justify-between px-[7px]">
        {priceStops.map((p, i) => (
          <span key={p} className={cn("size-1 rounded-full", i >= lo && i <= hi ? "bg-teal/50" : "bg-line-strong")} />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={String(lo)}
          onValueChange={(v) => {
            const next = Number(v)
            setDraft([next, hi])
            commit(next, hi)
          }}
        >
          <SelectTrigger aria-label="Minimum price" className="min-w-0 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priceStops.slice(0, last).map((p, i) => (
              <SelectItem key={p} value={String(i)} disabled={i >= hi}>
                {i === 0 ? "Min" : stopLabel(i)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-slate">to</span>
        <Select
          value={String(hi)}
          onValueChange={(v) => {
            const next = Number(v)
            setDraft([lo, next])
            commit(lo, next)
          }}
        >
          <SelectTrigger aria-label="Maximum price" className="min-w-0 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priceStops.map((p, i) =>
              i === 0 ? null : (
                <SelectItem key={p} value={String(i)} disabled={i <= lo}>
                  {stopLabel(i)}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
