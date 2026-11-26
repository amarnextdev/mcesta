"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useState, type FormEvent } from "react"
import { CheckIcon, Loader2Icon, MapPinIcon, PackageIcon, RouteIcon, TruckIcon, XCircleIcon } from "lucide-react"

import { freeShippingThreshold } from "@/features/cart/config"
import { useDeliveryWindow } from "@/lib/delivery"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

import { checkDeliveryAction } from "../../actions"
import { normalizePostal, postalRule } from "../../delivery-check"

/** Last checked code per country, so every product page checks it straight away. */
const storageKey = (country: string) => `mcesta:postal:${country}`

type Props = {
  /** Variant being viewed: rates and availability can differ per item. */
  variantId?: string
  /** Shopper's market (ISO code): decides ZIP vs PIN vs postcode. */
  country: string
  currencyCode?: string
}

/**
 * Delivery box: check a ZIP / PIN / postcode against Shopify's real shipping rates (can we
 * deliver there, and what it costs), then Order today → Ships → Arrives.
 */
export function DeliveryEstimate({ variantId, country, currencyCode }: Props) {
  const rule = postalRule(country)
  const dates = useDeliveryWindow()
  const threshold = currencyCode ? freeShippingThreshold(currencyCode) : null

  const [input, setInput] = useState("")
  const [code, setCode] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Saved code is read after mount (localStorage), so server and browser HTML match.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey(country))
      if (saved) setCode(saved)
    } catch {
      // Storage blocked: the shopper just types it again.
    }
  }, [country])

  const check = useQuery({
    queryKey: ["delivery-check", country, variantId, code],
    queryFn: () => checkDeliveryAction(variantId!, code!),
    enabled: Boolean(variantId && code),
    staleTime: 10 * 60_000,
  })
  const result = check.data

  // A code Shopify or the lookup rejected goes back into the field with the message.
  useEffect(() => {
    if (result?.status !== "invalid") return
    setFormError(result.message)
    setInput(code ?? "")
    setCode(null)
    try {
      window.localStorage.removeItem(storageKey(country))
    } catch {}
  }, [result, code, country])

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = normalizePostal(input)
    if (!rule.pattern.test(value)) return setFormError(rule.hint)
    setFormError(null)
    setCode(value)
    try {
      window.localStorage.setItem(storageKey(country), value)
    } catch {}
  }

  function change() {
    setInput(code ?? "")
    setCode(null)
  }

  const unavailable = result?.status === "unavailable"
  const cheapest = result?.status === "ok" ? result.options[0] : undefined
  const arrives = dates?.arrives ?? "4–9 business days"
  // Shipping-only perks here; damage/returns promises sit in "Shop with peace of mind" (no repeats).
  const perks = [
    threshold !== null && currencyCode
      ? { icon: PackageIcon, title: "Free shipping", sub: `on orders over ${formatMoney({ amount: threshold, currencyCode })}` }
      : { icon: PackageIcon, title: "Ships fast", sub: "within 1–2 business days" },
    { icon: RouteIcon, title: "Tracked delivery", sub: "tracking link by email" },
  ]

  return (
    <section aria-labelledby="delivery-h" className="flex flex-col gap-3.5 rounded-2xl border-[1.5px] border-dashed border-teal bg-teal-tint p-4 sm:p-[18px]">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-10 flex-none place-items-center rounded-full bg-teal-soft text-teal">
          <TruckIcon className="size-5" strokeWidth={1.9} />
        </span>
        <div className="flex flex-col leading-tight">
          <h2 id="delivery-h" className="font-sans text-base font-bold">
            Get estimated delivery date
          </h2>
          <p className="text-[0.8125rem] text-slate">Enter your {rule.label} to check delivery and shipping cost</p>
        </div>
      </div>

      {code ? (
        <div
          aria-live="polite"
          className={cn(
            "flex items-center gap-3 rounded-xl border bg-white px-3.5 py-3 text-sm",
            unavailable ? "border-terra-light" : "border-teal-line"
          )}
        >
          {check.isFetching ? (
            <Loader2Icon aria-hidden="true" className="size-5 flex-none animate-spin text-teal" />
          ) : unavailable ? (
            <XCircleIcon aria-hidden="true" className="size-5 flex-none text-terra-text" />
          ) : result?.status === "ok" ? (
            <span aria-hidden="true" className="grid size-5 flex-none place-items-center rounded-full bg-success text-white">
              <CheckIcon className="size-3" strokeWidth={3} />
            </span>
          ) : (
            <MapPinIcon aria-hidden="true" className="size-5 flex-none text-slate" />
          )}
          <span className="flex min-w-0 flex-1 flex-col leading-snug">
            {check.isFetching ? (
              <span>Checking delivery to {code}…</span>
            ) : result?.status === "ok" ? (
              <>
                <span>
                  Delivery by <span className="font-bold text-teal">{arrives}</span>
                </span>
                <span className="text-[0.8125rem] text-slate">
                  {result.place ? `${result.place} ${code}` : code}
                  {cheapest && (
                    <>
                      {" · "}
                      {cheapest.cost.amount === 0 ? (
                        <span className="font-semibold text-success">Free shipping</span>
                      ) : (
                        `${cheapest.title} ${formatMoney(cheapest.cost)}`
                      )}
                    </>
                  )}
                </span>
              </>
            ) : unavailable ? (
              <>
                <span className="font-bold text-terra-text">Not deliverable to {code}</span>
                <span className="text-[0.8125rem] text-slate">We can&apos;t ship this item there yet. Try another {rule.label}.</span>
              </>
            ) : result?.status === "error" ? (
              <span className="text-slate">{result.message}</span>
            ) : (
              <span>{code}</span>
            )}
          </span>
          <button type="button" onClick={change} className="flex-none text-[0.8125rem] font-semibold text-teal hover:underline">
            Change
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-1">
          <label htmlFor="pdp-postal" className="sr-only">
            Your {rule.label}
          </label>
          <div
            className={cn(
              "flex h-12 items-center rounded-xl border bg-white pr-1.5 pl-3.5 transition-shadow focus-within:ring-3 focus-within:ring-ring/40",
              formError ? "border-[#a33a1f]" : "border-teal-line focus-within:border-teal"
            )}
          >
            <MapPinIcon aria-hidden="true" className="size-5 flex-none text-teal" />
            <input
              id="pdp-postal"
              inputMode={country === "US" || country === "IN" ? "numeric" : "text"}
              maxLength={10}
              autoComplete="postal-code"
              placeholder={rule.placeholder}
              value={input}
              aria-invalid={formError ? true : undefined}
              aria-describedby={formError ? "pdp-postal-error" : undefined}
              onChange={(e) => {
                setInput(e.target.value)
                setFormError(null)
              }}
              className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-base font-medium tracking-wide text-ink uppercase outline-none placeholder:font-normal placeholder:tracking-normal placeholder:normal-case"
            />
            <button type="submit" className="h-9 rounded-lg bg-teal px-6 text-sm font-bold text-cream transition-colors hover:bg-teal/90">
              Check
            </button>
          </div>
          {formError && (
            <span id="pdp-postal-error" role="alert" className="text-xs text-terra-text">
              {formError}
            </span>
          )}
        </form>
      )}

      {result?.status === "ok" && result.options.length > 1 && (
        <ul className="flex flex-col gap-1 rounded-lg border border-teal-line/60 bg-white px-3 py-2 text-xs">
          {result.options.map((o) => (
            <li key={o.title} className="flex justify-between gap-3">
              <span>{o.title}</span>
              <span className="font-semibold tabular-nums">{o.cost.amount === 0 ? "Free" : formatMoney(o.cost)}</span>
            </li>
          ))}
        </ul>
      )}

      <ul className="grid grid-cols-2 gap-3 border-t border-dashed border-teal-line pt-3">
        {perks.map(({ icon: Icon, title, sub }) => (
          <li key={title} className="flex items-center gap-2.5">
            <Icon aria-hidden="true" className="size-6 flex-none text-teal" strokeWidth={1.6} />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="text-[0.8125rem] font-bold">{title}</span>
              <span className="truncate text-xs text-slate">{sub}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
