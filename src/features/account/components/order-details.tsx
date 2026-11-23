"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  CheckIcon,
  ChevronDownIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  FileTextIcon,
  MapPinIcon,
  MessageCircleIcon,
  RotateCcwIcon,
  StarIcon,
} from "lucide-react"

import { CopyButton } from "@/components/shared/copy-button"
import { Button } from "@/components/ui/button"
import { useAddToCart } from "@/features/cart/hooks"
import { formatMoney } from "@/lib/format"
import type { Money } from "@/lib/shopify/types"
import { cn } from "@/lib/utils"

import { orderSteps, type Order } from "../types"
import { ReportProblem } from "./report-problem"

const CLAIM_HOURS = 48
const EVENTS_FOLD = 3

const kindStyle: Record<Order["kind"], { label: string; dot: string; text: string; card: string }> = {
  processing: { label: "Processing", dot: "bg-star", text: "text-[#7a5410]", card: "bg-[#fbf6ea]" },
  transit: { label: "On the way", dot: "bg-teal", text: "text-teal", card: "bg-teal-tint" },
  delivered: { label: "Delivered", dot: "bg-success", text: "text-success", card: "bg-success-soft/50" },
  cancelled: { label: "Cancelled", dot: "bg-slate", text: "text-slate", card: "bg-sand/60" },
}

/** Fixed time zone (US Eastern) so server and browser render the same text. */
const fmt = (iso: string, withTime = true) =>
  new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : { year: "numeric" }),
  })

const card = "rounded-2xl border border-line bg-white"

/** Order details page body: status first, then items, updates, help; summary on the right. */
export function OrderDetails({ order }: { order: Order }) {
  const add = useAddToCart()
  const [allEvents, setAllEvents] = useState(false)
  const [rating, setRating] = useState(0)
  // Damage-claim window uses the shopper's clock, after mount.
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => setNow(Date.now()), [])

  const style = kindStyle[order.kind]
  const count = order.lines.reduce((n, l) => n + l.quantity, 0)
  const hoursLeft = order.deliveredAt && now ? Math.floor(CLAIM_HOURS - (now - new Date(order.deliveredAt).getTime()) / 3_600_000) : null
  const reorder = order.lines.flatMap((l) => (l.variantId ? [{ merchandiseId: l.variantId, quantity: l.quantity }] : []))
  const events = allEvents ? order.events : order.events.slice(0, EVENTS_FOLD)
  const currency = order.total.currencyCode
  const listing = order.lines.reduce((sum, l) => sum + (l.compareAtPrice ?? l.price).amount * l.quantity, 0)
  const savings = listing - order.prices.subtotal.amount + (order.prices.discount?.amount ?? 0)
  const priceRow = (m: Money | null) => (m ? (m.amount === 0 ? "Free" : formatMoney(m)) : "—")

  return (
    <>
      {/* Title */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <h1 id="od-h" className="text-[1.375rem] leading-tight md:text-[1.75rem]">
              Order {order.name}
            </h1>
            <CopyButton value={order.name} label="order number" className="size-9" />
          </div>
          <span className="text-sm text-slate">
            Placed {fmt(order.placedAt, false)} · {count} {count === 1 ? "item" : "items"} · {formatMoney(order.total)}
          </span>
        </div>
        <div className="flex gap-2">
          {order.statusUrl && (
            <Button asChild variant="outline" className="h-10 border-[1.5px] border-line-strong bg-white">
              <a href={order.statusUrl}>
                <FileTextIcon data-icon="inline-start" className="size-4" />
                Invoice
              </a>
            </Button>
          )}
          {reorder.length > 0 && (
            <Button variant="outline" disabled={add.isPending} onClick={() => add.mutate(reorder)} className="h-10 border-[1.5px] border-teal bg-white text-teal hover:bg-teal-soft">
              <RotateCcwIcon data-icon="inline-start" className="size-4" />
              {add.isPending ? "Adding…" : "Buy it again"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          {/* 1. Status */}
          <section aria-label="Order status" className={cn("flex flex-col gap-4 rounded-2xl p-5", style.card)}>
            <div className="flex flex-col gap-0.5">
              <span className={cn("inline-flex items-center gap-2 text-[0.8125rem] font-bold", style.text)}>
                <span aria-hidden="true" className={cn("size-2 rounded-full", style.dot)} />
                {style.label}
              </span>
              <span className="text-xl font-bold">{order.status}</span>
              <span className="text-sm text-slate">{order.detail}</span>
            </div>

            {order.kind !== "cancelled" && (
              <ol aria-label="Order progress" className="grid grid-cols-5 gap-1.5">
                {orderSteps.map((step, i) => {
                  const done = i <= order.stage
                  return (
                    <li key={step} aria-current={i === order.stage ? "step" : undefined} className="flex flex-col gap-1.5">
                      <span className={cn("h-1.5 rounded-full", done ? "bg-teal" : "bg-line")} />
                      <span className={cn("text-[0.6875rem] leading-tight sm:text-xs", i === order.stage ? "font-bold" : done ? "text-ink" : "text-slate")}>
                        {step}
                      </span>
                    </li>
                  )
                })}
              </ol>
            )}

            <div className="flex flex-wrap gap-2">
              {order.trackingUrl && (
                <Button asChild size="sm" className="h-9 px-3.5">
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                    Track on {order.carrier ?? "carrier site"}
                    <ExternalLinkIcon data-icon="inline-end" className="size-3.5" />
                  </a>
                </Button>
              )}
              <Button asChild size="sm" variant="outline" className="h-9 border-[1.5px] border-line-strong bg-white px-3.5">
                <Link href="/help#contact">
                  <MessageCircleIcon data-icon="inline-start" className="size-3.5" />
                  Need help?
                </Link>
              </Button>
            </div>
          </section>

          {order.kind === "delivered" && hoursLeft !== null && hoursLeft > 0 && <ReportProblem orderId={order.id} hoursLeft={hoursLeft} />}

          {/* 2. Items */}
          <section aria-labelledby="items-h" className={card}>
            <h2 id="items-h" className="border-b border-line-soft px-5 py-3.5 font-sans text-[0.9375rem] font-bold">
              Items in this order
            </h2>
            <ul>
              {order.lines.map((line, i) => (
                <li key={`${line.title}-${i}`} className="flex items-center gap-3.5 border-b border-line-soft px-5 py-4 last:border-b-0">
                  <span className="relative grid size-[72px] flex-none place-items-center overflow-hidden rounded-xl bg-sand font-heading text-xl text-ink/30">
                    {line.image ? <Image src={line.image.url} alt="" fill sizes="72px" className="object-cover" /> : line.title[0]}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug">
                    {line.handle ? (
                      <Link href={`/products/${line.handle}`} className="truncate text-[0.9375rem] font-semibold hover:text-teal">
                        {line.title}
                      </Link>
                    ) : (
                      <span className="truncate text-[0.9375rem] font-semibold">{line.title}</span>
                    )}
                    <span className="text-[0.8125rem] text-slate">
                      {line.variantTitle ? `${line.variantTitle} · ` : ""}Qty {line.quantity}
                    </span>
                  </span>
                  <span className="flex flex-col items-end leading-tight">
                    <span className="text-[0.9375rem] font-bold tabular-nums">{formatMoney(line.price)}</span>
                    {line.compareAtPrice && <span className="text-xs text-slate tabular-nums line-through">{formatMoney(line.compareAtPrice)}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* 3. Shipment updates */}
          {order.events.length > 0 && (
            <section aria-labelledby="updates-h" className={cn(card, "px-5 py-4")}>
              <h2 id="updates-h" className="mb-3.5 font-sans text-[0.9375rem] font-bold">
                Updates
              </h2>
              <ol>
                {events.map((e, i) => (
                  <li key={`${e.at}-${i}`} className="grid grid-cols-[16px_minmax(0,1fr)] gap-3">
                    <span className="flex flex-col items-center pt-1">
                      <span aria-hidden="true" className={cn("size-3 rounded-full border-2", i === 0 ? "border-teal bg-teal" : "border-line-strong bg-white")} />
                      {i < events.length - 1 && <span aria-hidden="true" className="mt-1 w-px flex-1 bg-line-strong" />}
                    </span>
                    <span className="flex flex-col pb-4 leading-snug">
                      <span className={cn("text-sm", i === 0 ? "font-bold" : "font-medium")}>{e.title}</span>
                      <span className="text-xs text-slate">
                        {fmt(e.at)}
                        {e.location ? ` · ${e.location}` : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
              {order.events.length > EVENTS_FOLD && (
                <button type="button" onClick={() => setAllEvents(!allEvents)} className="inline-flex items-center gap-1 text-[0.8125rem] font-bold text-teal">
                  {allEvents ? "Show less" : `Show all ${order.events.length} updates`}
                  <ChevronDownIcon aria-hidden="true" className={cn("size-4 transition-transform", allEvents && "rotate-180")} />
                </button>
              )}
            </section>
          )}

          {/* 4. Rate */}
          {order.kind === "delivered" && (
            <section aria-labelledby="rate-h" className={cn(card, "flex flex-wrap items-center justify-between gap-3 px-5 py-4")}>
              <span className="flex flex-col">
                <h2 id="rate-h" className="font-sans text-[0.9375rem] font-bold">
                  How was your order?
                </h2>
                {rating > 0 ? (
                  order.lines[0]?.handle ? (
                    <Link href={`/products/${order.lines[0].handle}#reviews`} className="text-[0.8125rem] font-bold text-teal hover:underline">
                      Thanks! Add a written review →
                    </Link>
                  ) : (
                    <span className="text-[0.8125rem] font-semibold text-success">Thanks for rating!</span>
                  )
                ) : (
                  <span className="text-[0.8125rem] text-slate">Tap a star to rate it.</span>
                )}
              </span>
              <div role="radiogroup" aria-label="Rate this order" className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                    onClick={() => setRating(n)}
                    className="grid size-9 place-items-center rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <StarIcon className={cn("size-6", rating >= n ? "fill-star text-star" : "fill-line text-line-strong")} />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Summary */}
        <aside aria-label="Order summary" className={cn(card, "divide-y divide-line-soft lg:sticky lg:top-24")}>
          <div className="px-5 py-4">
            <h2 className="mb-3 font-sans text-[0.9375rem] font-bold">Payment summary</h2>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate">Items ({count})</dt>
                <dd className="tabular-nums">{formatMoney(order.prices.subtotal)}</dd>
              </div>
              {order.prices.discount && order.prices.discount.amount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-slate">Discount</dt>
                  <dd className="text-success tabular-nums">−{formatMoney(order.prices.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate">Shipping</dt>
                <dd className={cn("tabular-nums", order.prices.shipping?.amount === 0 && "text-success")}>{priceRow(order.prices.shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate">Tax</dt>
                <dd className="tabular-nums">{priceRow(order.prices.tax)}</dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-dashed border-line-strong pt-2.5 text-base font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatMoney(order.total)}</dd>
              </div>
            </dl>
            {savings > 0.005 && (
              <p className="mt-3 flex items-center gap-1.5 text-[0.8125rem] font-semibold text-success">
                <CheckIcon aria-hidden="true" className="size-4" strokeWidth={2.5} />
                You saved {formatMoney({ amount: savings, currencyCode: currency })}
              </p>
            )}
          </div>

          {order.payment && (
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
              <span className="text-slate">Paid with</span>
              <span className="inline-flex items-center gap-2 font-semibold">
                <CreditCardIcon aria-hidden="true" className="size-4" />
                {order.payment}
              </span>
            </div>
          )}

          {order.shippingAddress && (
            <div className="flex gap-3 px-5 py-4 text-sm">
              <MapPinIcon aria-hidden="true" className="mt-0.5 size-4 flex-none text-teal" />
              <span className="flex flex-col leading-relaxed">
                <span className="font-semibold">Delivering to {order.shippingAddress.name}</span>
                {order.shippingAddress.lines.map((l) => (
                  <span key={l} className="text-slate">
                    {l}
                  </span>
                ))}
                {order.shippingAddress.phone && <span className="text-slate">{order.shippingAddress.phone}</span>}
              </span>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
