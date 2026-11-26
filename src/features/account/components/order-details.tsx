"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowLeftIcon,
  BoxIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleXIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  FileTextIcon,
  HouseIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  PackageCheckIcon,
  ReceiptTextIcon,
  RotateCcwIcon,
  StarIcon,
  TruckIcon,
  type LucideIcon,
} from "lucide-react"

import { CopyButton } from "@/components/shared/copy-button"
import { Button } from "@/components/ui/button"
import { useAddToCart } from "@/features/cart/hooks"
import { siteConfig } from "@/lib/config/site"
import { addBusinessDays, formatDay, HANDLING_DAYS, TRANSIT_DAYS } from "@/lib/delivery"
import { formatMoney } from "@/lib/format"
import type { Money } from "@/lib/shopify/types"
import { cn } from "@/lib/utils"

import { orderSteps, type Order } from "../types"
import { ReportProblem } from "./report-problem"

const CLAIM_HOURS = 48
const EVENTS_FOLD = 4

const kindStyle: Record<Order["kind"], { label: string; pill: string; card: string; accent: string }> = {
  processing: { label: "Processing", pill: "bg-[#fbefd2] text-[#7a5410]", card: "from-[#fdf8ec] to-white", accent: "bg-star" },
  transit: { label: "On the way", pill: "bg-teal-soft text-teal", card: "from-teal-tint to-white", accent: "bg-teal" },
  delivered: { label: "Delivered", pill: "bg-success-soft text-success", card: "from-success-soft/60 to-white", accent: "bg-success" },
  cancelled: { label: "Cancelled", pill: "bg-sand text-slate", card: "from-sand/70 to-white", accent: "bg-slate" },
}

const stepIcons: LucideIcon[] = [ReceiptTextIcon, BoxIcon, TruckIcon, MapPinIcon, HouseIcon]

const card = "rounded-2xl border border-line bg-white"

/**
 * Dates: UTC on the server and in the first browser render (so they match), then the shopper's
 * own time zone once the page is running.
 */
function useDates() {
  const [local, setLocal] = useState(false)
  useEffect(() => setLocal(true), [])
  const tz = local ? undefined : "UTC"
  return {
    day: (iso: string) => new Date(iso).toLocaleDateString("en-US", { timeZone: tz, month: "short", day: "numeric", year: "numeric" }),
    stamp: (iso: string) =>
      new Date(iso).toLocaleString("en-US", { timeZone: tz, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
    local,
  }
}

/** Order details: status tracker, items, updates and help on the left; payment and address on the right. */
export function OrderDetails({ order }: { order: Order }) {
  const add = useAddToCart()
  const dates = useDates()
  const [allEvents, setAllEvents] = useState(false)
  const [rating, setRating] = useState(0)
  // Damage-claim window uses the shopper's clock, after mount.
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => setNow(Date.now()), [])

  const style = kindStyle[order.kind]
  const count = order.lines.reduce((n, l) => n + l.quantity, 0)
  const hoursLeft = order.deliveredAt && now ? Math.floor(CLAIM_HOURS - (now - new Date(order.deliveredAt).getTime()) / 3_600_000) : null
  const reorder = order.lines.flatMap((l) => (l.variantId ? [{ merchandiseId: l.variantId, quantity: l.quantity }] : []))
  const currency = order.total.currencyCode
  const listing = order.lines.reduce((sum, l) => sum + (l.compareAtPrice ?? l.price).amount * l.quantity, 0)
  const savings = listing - order.prices.subtotal.amount + (order.prices.discount?.amount ?? 0)
  const priceRow = (m: Money | null) => (m ? (m.amount === 0 ? "Free" : formatMoney(m)) : "—")

  // Shopify's own updates, plus "Order placed" so the timeline always starts somewhere.
  const timeline = [...order.events, { title: "Order placed", at: order.placedAt }]
  const events = allEvents ? timeline : timeline.slice(0, EVENTS_FOLD)

  // Estimate until the carrier gives a real date.
  const placed = new Date(order.placedAt)
  const estimate =
    order.kind === "processing" || (order.kind === "transit" && !/^Arriving/.test(order.status))
      ? `${formatDay(addBusinessDays(placed, HANDLING_DAYS[0] + TRANSIT_DAYS[0]))} – ${formatDay(addBusinessDays(placed, HANDLING_DAYS[1] + TRANSIT_DAYS[1]))}`
      : null

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4">
        <Link href="/account/orders" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate hover:text-ink">
          <ArrowLeftIcon aria-hidden="true" className="size-4" />
          All orders
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 id="od-h" className="text-[1.5rem] leading-tight md:text-[1.875rem]">
                Order {order.name}
              </h1>
              <CopyButton value={order.name} label="order number" className="size-8" />
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", style.pill)}>{style.label}</span>
            </div>
            <span className="text-sm text-slate">
              Placed on <span suppressHydrationWarning>{dates.day(order.placedAt)}</span> · {count} {count === 1 ? "item" : "items"} ·{" "}
              <span className="font-semibold text-ink">{formatMoney(order.total)}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {order.statusUrl && (
              <Button asChild variant="outline" className="h-10 rounded-xl border-line-strong bg-white">
                <a href={order.statusUrl} target="_blank" rel="noopener noreferrer">
                  <FileTextIcon data-icon="inline-start" className="size-4" />
                  Invoice &amp; status
                </a>
              </Button>
            )}
            {reorder.length > 0 && (
              <Button disabled={add.isPending} onClick={() => add.mutate(reorder)} className="h-10 rounded-xl px-4 font-bold">
                <RotateCcwIcon data-icon="inline-start" className="size-4" />
                {add.isPending ? "Adding…" : "Buy it again"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-5">
          {/* Status + tracker */}
          <section aria-label="Order status" className={cn(card, "overflow-hidden bg-gradient-to-b", style.card)}>
            <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold sm:text-[1.375rem]">{order.status}</span>
                <span className="text-sm text-slate">{order.detail}</span>
              </div>
              {estimate && (
                <div className="flex items-center gap-2.5 rounded-xl border border-line-soft bg-white px-3.5 py-2.5">
                  <TruckIcon aria-hidden="true" className="size-5 text-teal" />
                  <span className="flex flex-col leading-tight">
                    <span className="text-[0.6875rem] font-semibold tracking-wide text-slate uppercase">Estimated delivery</span>
                    <span className="text-sm font-bold" suppressHydrationWarning>
                      {estimate}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {order.kind === "cancelled" ? (
              <p className="mx-5 my-5 flex items-center gap-2.5 rounded-xl bg-white px-4 py-3 text-sm sm:mx-6">
                <CircleXIcon aria-hidden="true" className="size-5 text-slate" />
                This order was cancelled. If you paid, the refund goes back to your original payment method.
              </p>
            ) : (
              <ol aria-label="Order progress" className="grid grid-cols-5 px-3 pt-6 pb-5 sm:px-4">
                {orderSteps.map((step, i) => {
                  const done = i < order.stage || order.kind === "delivered"
                  const current = i === order.stage && order.kind !== "delivered"
                  const Icon = stepIcons[i] ?? CheckIcon
                  return (
                    <li key={step} aria-current={current ? "step" : undefined} className="relative flex flex-col items-center gap-2 text-center">
                      {i > 0 && (
                        <span
                          aria-hidden="true"
                          className={cn("absolute top-[17px] right-1/2 left-[-50%] h-[3px] rounded-full", i <= order.stage ? "bg-teal" : "bg-line")}
                        />
                      )}
                      <span
                        className={cn(
                          "relative z-10 grid size-9 place-items-center rounded-full border-2 transition-colors",
                          done
                            ? "border-teal bg-teal text-cream"
                            : current
                              ? "border-teal bg-white text-teal shadow-[0_0_0_5px_var(--color-teal-soft)]"
                              : "border-line bg-white text-slate/60"
                        )}
                      >
                        {done ? <CheckIcon className="size-4" strokeWidth={3} /> : <Icon className="size-4" />}
                      </span>
                      <span className={cn("px-0.5 text-[0.6875rem] leading-tight sm:text-xs", current || done ? "font-semibold text-ink" : "text-slate")}>
                        {step}
                      </span>
                    </li>
                  )
                })}
              </ol>
            )}

            {order.trackingUrl && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft bg-white/70 px-5 py-3.5 sm:px-6">
                <span className="text-sm text-slate">
                  Shipped with <span className="font-semibold text-ink">{order.carrier ?? "our courier"}</span>
                </span>
                <Button asChild size="sm" className="h-9 rounded-lg px-3.5">
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                    Track package
                    <ExternalLinkIcon data-icon="inline-end" className="size-3.5" />
                  </a>
                </Button>
              </div>
            )}
          </section>

          {order.kind === "delivered" && hoursLeft !== null && hoursLeft > 0 && <ReportProblem orderId={order.id} hoursLeft={hoursLeft} />}

          {/* Items */}
          <section aria-labelledby="items-h" className={card}>
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4 sm:px-6">
              <h2 id="items-h" className="font-sans text-base font-bold">
                Items ({count})
              </h2>
              {order.kind === "delivered" && <span className="text-xs text-slate">Loved it? Leave a review</span>}
            </div>
            <ul className="divide-y divide-line-soft">
              {order.lines.map((line, i) => (
                <li key={`${line.title}-${i}`} className="flex gap-4 px-5 py-4 sm:px-6">
                  <span className="relative grid size-20 flex-none place-items-center overflow-hidden rounded-xl border border-line-soft bg-white font-heading text-xl text-ink/30">
                    {line.image ? <Image src={line.image.url} alt="" fill sizes="80px" className="object-cover" /> : line.title[0]}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    {line.handle ? (
                      <Link href={`/products/${line.handle}`} className="line-clamp-2 text-[0.9375rem] leading-snug font-semibold hover:text-teal">
                        {line.title}
                      </Link>
                    ) : (
                      <span className="line-clamp-2 text-[0.9375rem] leading-snug font-semibold">{line.title}</span>
                    )}
                    {line.variantTitle && <span className="text-[0.8125rem] text-slate">{line.variantTitle}</span>}
                    <span className="text-[0.8125rem] text-slate tabular-nums">
                      {formatMoney(line.price)} × {line.quantity}
                    </span>
                    {line.handle && (
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] font-semibold">
                        {line.variantId && (
                          <button
                            type="button"
                            disabled={add.isPending}
                            onClick={() => add.mutate([{ merchandiseId: line.variantId!, quantity: 1, title: line.title }])}
                            className="inline-flex items-center gap-1 text-teal hover:underline disabled:opacity-50"
                          >
                            <RotateCcwIcon aria-hidden="true" className="size-3.5" />
                            Buy again
                          </button>
                        )}
                        {order.kind === "delivered" && (
                          <Link href={`/products/${line.handle}#reviews`} className="inline-flex items-center gap-1 text-ink hover:underline">
                            <StarIcon aria-hidden="true" className="size-3.5" />
                            Write a review
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="flex flex-col items-end leading-tight">
                    <span className="text-[0.9375rem] font-bold tabular-nums">
                      {formatMoney({ amount: line.price.amount * line.quantity, currencyCode: line.price.currencyCode })}
                    </span>
                    {line.compareAtPrice && (
                      <span className="text-xs text-slate tabular-nums line-through">
                        {formatMoney({ amount: line.compareAtPrice.amount * line.quantity, currencyCode: line.price.currencyCode })}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Updates timeline */}
          <section aria-labelledby="updates-h" className={cn(card, "px-5 py-5 sm:px-6")}>
            <h2 id="updates-h" className="mb-4 font-sans text-base font-bold">
              Order updates
            </h2>
            <ol>
              {events.map((e, i) => (
                <li key={`${e.at}-${i}`} className="grid grid-cols-[20px_minmax(0,1fr)] gap-3">
                  <span className="flex flex-col items-center pt-0.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-5 place-items-center rounded-full",
                        i === 0 ? "bg-teal text-cream shadow-[0_0_0_4px_var(--color-teal-soft)]" : "border-2 border-line-strong bg-white"
                      )}
                    >
                      {i === 0 && <PackageCheckIcon className="size-3" />}
                    </span>
                    {i < events.length - 1 && <span aria-hidden="true" className="my-1 w-0.5 flex-1 rounded-full bg-line" />}
                  </span>
                  <span className="flex flex-col pb-5 leading-snug">
                    <span className={cn("text-sm", i === 0 ? "font-bold text-ink" : "font-medium text-ink/80")}>{e.title}</span>
                    <span className="text-xs text-slate" suppressHydrationWarning>
                      {dates.stamp(e.at)}
                      {"location" in e && e.location ? ` · ${e.location}` : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            {timeline.length > EVENTS_FOLD && (
              <button type="button" onClick={() => setAllEvents(!allEvents)} className="inline-flex items-center gap-1 text-[0.8125rem] font-bold text-teal">
                {allEvents ? "Show less" : `Show all ${timeline.length} updates`}
                <ChevronDownIcon aria-hidden="true" className={cn("size-4 transition-transform", allEvents && "rotate-180")} />
              </button>
            )}
          </section>

          {/* Rate */}
          {order.kind === "delivered" && (
            <section aria-labelledby="rate-h" className={cn(card, "flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6")}>
              <span className="flex flex-col">
                <h2 id="rate-h" className="font-sans text-base font-bold">
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

        {/* Right column */}
        <aside aria-label="Order summary" className="flex flex-col gap-4 lg:sticky lg:top-24">
          <section className={cn(card, "px-5 py-5")}>
            <h2 className="mb-3.5 font-sans text-base font-bold">Payment summary</h2>
            <dl className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate">Subtotal ({count} {count === 1 ? "item" : "items"})</dt>
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
                <dd className={cn("tabular-nums", order.prices.shipping?.amount === 0 && "font-semibold text-success")}>{priceRow(order.prices.shipping)}</dd>
              </div>
              {order.prices.tax && (
                <div className="flex justify-between">
                  <dt className="text-slate">Tax</dt>
                  <dd className="tabular-nums">{priceRow(order.prices.tax)}</dd>
                </div>
              )}
              <div className="mt-1.5 flex items-baseline justify-between border-t border-line-soft pt-3">
                <dt className="text-base font-bold">Total</dt>
                <dd className="flex items-baseline gap-1.5">
                  <span className="text-xs font-semibold text-slate">{currency}</span>
                  <span className="text-xl font-bold tabular-nums">{formatMoney(order.total)}</span>
                </dd>
              </div>
            </dl>
            {savings > 0.005 && (
              <p className="mt-3.5 flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2 text-[0.8125rem] font-semibold text-success">
                <CheckIcon aria-hidden="true" className="size-4" strokeWidth={2.5} />
                You saved {formatMoney({ amount: savings, currencyCode: currency })}
              </p>
            )}
            {order.payment && (
              <p className="mt-3.5 flex items-center justify-between gap-3 border-t border-line-soft pt-3.5 text-sm">
                <span className="text-slate">Paid with</span>
                <span className="inline-flex items-center gap-2 font-semibold">
                  <CreditCardIcon aria-hidden="true" className="size-4" />
                  {order.payment}
                </span>
              </p>
            )}
          </section>

          {order.shippingAddress && (
            <section className={cn(card, "px-5 py-5")}>
              <h2 className="mb-3 flex items-center gap-2 font-sans text-base font-bold">
                <MapPinIcon aria-hidden="true" className="size-4 text-teal" />
                Shipping address
              </h2>
              <address className="flex flex-col text-sm leading-relaxed not-italic">
                <span className="font-semibold text-ink">{order.shippingAddress.name}</span>
                {order.shippingAddress.lines.map((l) => (
                  <span key={l} className="text-slate">
                    {l}
                  </span>
                ))}
                {order.shippingAddress.phone && <span className="mt-1 text-slate tabular-nums">{order.shippingAddress.phone}</span>}
              </address>
            </section>
          )}

          <section className={cn(card, "flex flex-col gap-3 px-5 py-5")}>
            <h2 className="font-sans text-base font-bold">Need help with this order?</h2>
            <p className="text-sm text-slate">Questions about delivery, a damaged item or a return? We usually reply within a day.</p>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="h-10 justify-start rounded-xl border-line-strong bg-white">
                <Link href="/help#contact">
                  <MessageCircleIcon data-icon="inline-start" className="size-4" />
                  Contact support
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-10 justify-start rounded-xl border-line-strong bg-white">
                <a href={`mailto:${siteConfig.supportEmail}?subject=${encodeURIComponent(`Order ${order.name}`)}`}>
                  <MailIcon data-icon="inline-start" className="size-4" />
                  Email about {order.name}
                </a>
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}
