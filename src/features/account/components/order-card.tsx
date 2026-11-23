"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRightIcon, RotateCcwIcon } from "lucide-react"

import { CopyButton } from "@/components/shared/copy-button"
import { useAddToCart } from "@/features/cart/hooks"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

import { orderSteps, type Order } from "../types"

const kindStyle: Record<Order["kind"], { label: string; dot: string; text: string }> = {
  processing: { label: "Processing", dot: "bg-star", text: "text-[#7a5410]" },
  transit: { label: "On the way", dot: "bg-teal", text: "text-teal" },
  delivered: { label: "Delivered", dot: "bg-success", text: "text-success" },
  cancelled: { label: "Cancelled", dot: "bg-slate", text: "text-slate" },
}

/** Fixed time zone (US Eastern) so server and browser render the same text. */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" })

/**
 * One order in the list, kept simple: status, what's in it, total, one action.
 * The whole card opens the order details (tracking, damage report, prices live there).
 */
export function OrderCard({ order }: { order: Order }) {
  const add = useAddToCart()
  const style = kindStyle[order.kind]
  const href = `/account/orders/${order.id}`
  const first = order.lines[0]
  const more = order.lines.length - 1
  const onTheWay = order.kind === "processing" || order.kind === "transit"
  const reorder = order.lines.flatMap((l) => (l.variantId ? [{ merchandiseId: l.variantId, quantity: l.quantity }] : []))

  return (
    <article className="group relative flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 transition-shadow hover:shadow-[0_6px_20px_rgba(31,42,46,0.08)] sm:p-5">
      {/* Status + order number */}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="flex flex-col gap-0.5">
          <span className={cn("inline-flex items-center gap-2 text-[0.8125rem] font-bold", style.text)}>
            <span aria-hidden="true" className={cn("size-2 rounded-full", style.dot)} />
            {style.label}
          </span>
          <span className="text-[1.0625rem] font-bold">{order.status}</span>
        </div>
        <span className="flex items-center gap-0.5 text-[0.8125rem] text-slate">
          Order <span className="font-semibold text-ink">{order.name}</span>
          <CopyButton value={order.name} label="order number" className="size-7" />
          <span aria-hidden="true">·</span>&nbsp;{fmtDate(order.placedAt)}
        </span>
      </div>

      {/* Slim progress for orders on the way */}
      {onTheWay && (
        <div aria-label={`Step ${order.stage + 1} of ${orderSteps.length}: ${orderSteps[order.stage]}`} className="flex flex-col gap-1.5">
          <div className="flex gap-1">
            {orderSteps.map((step, i) => (
              <span key={step} className={cn("h-1.5 flex-1 rounded-full", i <= order.stage ? "bg-teal" : "bg-line")} />
            ))}
          </div>
          <span className="text-xs text-slate">{orderSteps[order.stage]}</span>
        </div>
      )}

      {/* Items + total */}
      <div className="flex items-center gap-3.5">
        <div className="flex -space-x-3">
          {order.lines.slice(0, 3).map((line, i) => (
            <span
              key={`${line.title}-${i}`}
              className="relative grid size-14 place-items-center overflow-hidden rounded-xl border-2 border-white bg-sand font-heading text-lg text-ink/30"
            >
              {line.image ? <Image src={line.image.url} alt="" fill sizes="56px" className="object-cover" /> : line.title[0]}
            </span>
          ))}
        </div>
        <span className="flex min-w-0 flex-1 flex-col leading-snug">
          <span className="truncate text-[0.9375rem] font-semibold">{first?.title}</span>
          <span className="text-[0.8125rem] text-slate">{more > 0 ? `+ ${more} more ${more === 1 ? "item" : "items"}` : first?.variantTitle}</span>
        </span>
        <span className="text-base font-bold tabular-nums">{formatMoney(order.total)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 border-t border-line-soft pt-3.5">
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-bold text-teal after:absolute after:inset-0 after:rounded-2xl">
          {onTheWay ? "Track order" : "View details"}
          <ChevronRightIcon aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        {(order.kind === "delivered" || order.kind === "cancelled") && reorder.length > 0 && (
          <button
            type="button"
            disabled={add.isPending}
            onClick={() => add.mutate(reorder)}
            className="relative z-10 inline-flex h-9 items-center gap-1.5 rounded-full border-[1.5px] border-line-strong px-3.5 text-[0.8125rem] font-semibold transition-colors hover:border-ink disabled:opacity-50"
          >
            <RotateCcwIcon aria-hidden="true" className="size-3.5" />
            {add.isPending ? "Adding…" : "Buy it again"}
          </button>
        )}
      </div>
    </article>
  )
}
