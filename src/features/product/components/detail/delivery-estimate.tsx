"use client"

import { useEffect, useState, type FormEvent } from "react"
import { CheckIcon, MapPinIcon, PackageIcon, ShoppingBagIcon, TruckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Business days: order handling and carrier transit (keep in line with the shipping policy). */
const HANDLING = [1, 2] as const
const TRANSIT = [3, 7] as const

function addBusinessDays(from: Date, days: number) {
  const date = new Date(from)
  let left = days
  while (left > 0) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) left--
  }
  return date
}

const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })

/**
 * Delivery box (design): optional ZIP, then Order today → Ships → Arrives.
 * Dates are an estimate from handling + transit times; carrier rates come from Shopify checkout.
 */
export function DeliveryEstimate() {
  const [zip, setZip] = useState("")
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState(false)

  // Dates use the shopper's own clock and time zone, so they're worked out in the browser.
  const [dates, setDates] = useState<{ today: string; ships: string; arrives: string } | null>(null)
  useEffect(() => {
    const today = new Date()
    setDates({
      today: fmt(today),
      ships: `${fmt(addBusinessDays(today, HANDLING[0]))}–${fmt(addBusinessDays(today, HANDLING[1]))}`,
      arrives: `${fmt(addBusinessDays(today, HANDLING[0] + TRANSIT[0]))}–${fmt(addBusinessDays(today, HANDLING[1] + TRANSIT[1]))}`,
    })
  }, [])

  function check(event: FormEvent) {
    event.preventDefault()
    if (!/^\d{5}$/.test(zip)) return setError(true)
    setError(false)
    setSaved(zip)
  }

  const steps = [
    { icon: ShoppingBagIcon, label: "Order today", value: dates?.today, strong: false },
    { icon: PackageIcon, label: "Ships", value: dates?.ships ?? "1–2 business days", strong: false },
    { icon: TruckIcon, label: "Arrives", value: dates?.arrives ?? "3–7 business days", strong: true },
  ]

  return (
    <section aria-labelledby="delivery-h" className="overflow-hidden rounded-2xl border-2 border-dashed border-teal bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-dashed border-teal-line bg-teal-soft px-[18px] py-3.5">
        <h2 id="delivery-h" className="inline-flex items-center gap-2.5 font-sans text-base font-bold">
          <TruckIcon aria-hidden="true" className="size-5 text-teal" />
          Delivery
        </h2>
        <span className="text-[0.8125rem] text-slate">Ships to all 50 US states</span>
      </div>

      <div className="flex flex-col gap-4 p-[18px]">
        {saved ? (
          <div className="flex items-center gap-2.5 rounded-xl bg-success-soft px-3 py-2.5">
            <span aria-hidden="true" className="grid size-6 flex-none place-items-center rounded-full bg-success text-white">
              <CheckIcon className="size-3.5" strokeWidth={3} />
            </span>
            <span className="flex-1 text-sm">
              Delivering to <span className="font-bold">ZIP {saved}</span>
            </span>
            <button type="button" onClick={() => setSaved(null)} className="text-sm font-semibold text-teal underline underline-offset-2">
              Change
            </button>
          </div>
        ) : (
          <form onSubmit={check} noValidate className="flex flex-col gap-1.5">
            <label htmlFor="pdp-zip" className="text-[0.8125rem] text-slate">
              Enter your ZIP code to see the delivery date
            </label>
            <div
              className={cn(
                "flex h-12 items-center rounded-xl border-[1.5px] bg-white pr-[5px] pl-3.5 focus-within:ring-3 focus-within:ring-ring/40",
                error ? "border-[#a33a1f]" : "border-line-strong focus-within:border-teal"
              )}
            >
              <MapPinIcon aria-hidden="true" className="size-[18px] text-slate" />
              <input
                id="pdp-zip"
                inputMode="numeric"
                maxLength={5}
                autoComplete="postal-code"
                placeholder="e.g. 10001"
                value={zip}
                aria-invalid={error || undefined}
                aria-describedby={error ? "pdp-zip-error" : undefined}
                onChange={(e) => {
                  setZip(e.target.value.replace(/\D/g, ""))
                  setError(false)
                }}
                className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[0.9375rem] text-ink outline-none"
              />
              <button type="submit" className="h-[2.375rem] rounded-[9px] bg-teal px-[18px] text-sm font-semibold text-cream hover:bg-teal/90">
                Check
              </button>
            </div>
            {error && (
              <span id="pdp-zip-error" role="alert" className="text-[0.8125rem] text-terra-text">
                Enter a 5-digit US ZIP code.
              </span>
            )}
          </form>
        )}

        <ol className="relative flex pt-1">
          <span aria-hidden="true" className="absolute top-6 right-[16.6%] left-[16.6%] h-0.5 bg-[repeating-linear-gradient(90deg,#c9bba6_0_6px,transparent_6px_12px)]" />
          {steps.map(({ icon: Icon, label, value, strong }) => (
            <li key={label} className="relative flex flex-1 flex-col items-center gap-1.5 text-center">
              <span
                aria-hidden="true"
                className={cn("relative z-10 grid size-10 place-items-center rounded-full", strong ? "bg-teal text-cream" : "bg-teal-soft text-teal")}
              >
                <Icon className="size-[18px]" />
              </span>
              <span className="text-xs leading-tight text-slate">{label}</span>
              <span className="min-h-[1.25em] text-sm leading-tight font-bold">{value ?? "Today"}</span>
            </li>
          ))}
        </ol>

        <ul className="flex flex-wrap gap-2 border-t border-line-soft pt-3.5">
          {["Free shipping over $50", "US warehouse", "Tracked delivery"].map((chip) => (
            <li key={chip} className="inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-[5px] text-xs font-semibold">
              <CheckIcon aria-hidden="true" className="size-3.5 text-success" strokeWidth={2.5} />
              {chip}
            </li>
          ))}
        </ul>
        <p className="-mt-1 text-xs text-slate">Estimated dates. Exact shipping options and costs are shown at checkout.</p>
      </div>
    </section>
  )
}
