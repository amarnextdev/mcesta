"use client"

import Image from "next/image"
import Link from "next/link"
import { BookmarkIcon, MinusIcon, PlusIcon, ShieldCheckIcon, TrashIcon, TruckIcon, ZapIcon } from "lucide-react"

import { useDeliveryWindow } from "@/lib/delivery"
import { formatMoney } from "@/lib/format"
import type { CartLine } from "@/lib/shopify/cart"
import { cn } from "@/lib/utils"

import { MAX_QUANTITY } from "../config"
import { useBuyNow, useRemoveLine, useUpdateLine } from "../hooks"
import { useSavedForLater } from "../saved"

const action =
  "flex h-11 flex-1 items-center justify-center gap-2 text-[0.8125rem] font-semibold text-slate transition-colors hover:bg-sand hover:text-ink focus-visible:bg-sand focus-visible:outline-none disabled:opacity-50"

/** One cart item (design: photo + qty on the left, details in the middle, item total on the right). */
export function CartLineItem({ line }: { line: CartLine }) {
  const update = useUpdateLine()
  const remove = useRemoveLine()
  const buyNow = useBuyNow()
  const { save } = useSavedForLater()
  const delivery = useDeliveryWindow()
  const busy = remove.isPending || buyNow.isPending
  const href = `/products/${line.handle}`
  const discount = line.compareAtPrice ? Math.round((1 - line.price.amount / line.compareAtPrice.amount) * 100) : null

  const setQty = (quantity: number) => update.mutate({ lineId: line.id, quantity })
  const saveForLater = () => {
    save({
      variantId: line.variantId,
      handle: line.handle,
      title: line.title,
      variantTitle: line.variantTitle,
      imageUrl: line.image?.url ?? null,
      price: line.price,
    })
    remove.mutate(line.id)
  }

  return (
    <article
      aria-label={line.title}
      className={cn(
        "overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_1px_2px_rgba(31,42,46,0.04)] transition-[opacity,box-shadow] hover:shadow-[0_8px_24px_-14px_rgba(31,42,46,0.22)]",
        busy && "opacity-60"
      )}
    >
      <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[128px_minmax(0,1fr)_auto] sm:gap-[22px] sm:p-[22px]">
        <div className="row-span-2 flex flex-col items-center gap-3 sm:row-span-1">
          <Link
            href={href}
            tabIndex={-1}
            aria-hidden="true"
            className="group relative block aspect-square w-full overflow-hidden rounded-[14px] border border-line-soft bg-white"
          >
            {line.image && (
              <Image src={line.image.url} alt="" fill sizes="128px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
            )}
            {discount && (
              <span className="absolute top-2 left-2 rounded-full bg-terra px-[7px] py-[3px] text-[0.6875rem] font-bold text-white">-{discount}%</span>
            )}
          </Link>
          <div role="group" aria-label={`Quantity for ${line.title}`} className="flex h-9 items-center rounded-full border border-line-strong bg-white shadow-[0_1px_2px_rgba(31,42,46,0.05)]">
            <button
              type="button"
              aria-label={line.quantity === 1 ? `Remove ${line.title}` : "Decrease quantity"}
              onClick={() => setQty(line.quantity - 1)}
              className="grid h-full w-9 place-items-center rounded-l-full transition-colors hover:bg-sand"
            >
              {line.quantity === 1 ? <TrashIcon className="size-3.5" /> : <MinusIcon className="size-3.5" />}
            </button>
            <span aria-live="polite" className="grid h-full min-w-[30px] place-items-center border-x border-line-soft text-sm font-bold tabular-nums">
              {line.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={line.quantity >= MAX_QUANTITY || !line.available}
              onClick={() => setQty(line.quantity + 1)}
              className="grid h-full w-9 place-items-center rounded-r-full transition-colors hover:bg-sand disabled:opacity-30"
            >
              <PlusIcon className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <Link href={href} className="line-clamp-2 text-[0.9375rem] leading-[1.45] font-semibold text-ink transition-colors hover:text-teal sm:text-base">
            {line.title}
          </Link>
          {line.options.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {line.options.map((o) => (
                <span key={o.name} className="rounded-md border border-line-soft bg-cream px-2 py-0.5 text-xs text-slate">
                  {o.name}: <span className="font-semibold text-ink">{o.value}</span>
                </span>
              ))}
            </div>
          )}
          {(line.compareAtPrice || line.quantity > 1) && (
            <span className="flex flex-wrap items-baseline gap-2">
              <span className={cn("text-[0.9375rem] font-bold tabular-nums", line.compareAtPrice ? "text-terra-text" : "text-ink")}>
                {formatMoney(line.price)}
                {line.quantity > 1 && <span className="font-normal text-slate"> each</span>}
              </span>
              {line.compareAtPrice && (
                <>
                  <span className="text-sm text-slate tabular-nums line-through">{formatMoney(line.compareAtPrice)}</span>
                  <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success">
                    You save {formatMoney({ amount: line.compareAtPrice.amount - line.price.amount, currencyCode: line.price.currencyCode })}
                  </span>
                </>
              )}
            </span>
          )}
          {line.available ? (
            <div className="mt-1 hidden flex-col gap-2 rounded-xl border border-line-soft bg-cream/70 px-3.5 py-3 sm:flex">
              <span className="flex items-center gap-2 text-[0.8125rem]">
                <TruckIcon aria-hidden="true" className="size-4 text-teal" />
                <span>
                  <span className="font-semibold text-ink">{delivery ? `Arrives ${delivery.arrives}` : "Arrives in 4–9 business days"}</span>
                  <span className="text-slate"> · In stock, ships in 1–2 business days</span>
                </span>
              </span>
              <span className="flex items-center gap-2 text-[0.8125rem] text-slate">
                <ShieldCheckIcon aria-hidden="true" className="size-4 text-teal" />
                Damage covered: report within 48 hours of delivery
              </span>
            </div>
          ) : (
            <span className="mt-1 rounded-[10px] bg-terra-soft px-3 py-2 text-[0.8125rem] font-semibold text-terra-text">
              Sold out. Remove it to check out.
            </span>
          )}
        </div>

        <div className="col-start-2 flex items-baseline gap-2 sm:col-start-auto sm:flex-col sm:items-end sm:gap-0.5 sm:text-right">
          <span className="text-xs font-medium tracking-wide text-slate uppercase">Total</span>
          <span className="text-lg font-bold tabular-nums sm:text-[1.375rem]">{formatMoney(line.total)}</span>
          {line.compareAtPrice && (
            <span className="text-xs text-slate tabular-nums line-through">
              {formatMoney({ amount: line.compareAtPrice.amount * line.quantity, currencyCode: line.price.currencyCode })}
            </span>
          )}
        </div>
      </div>

      <div className="flex divide-x divide-line-soft border-t border-line-soft bg-cream/60">
        <button type="button" onClick={saveForLater} disabled={busy} className={action}>
          <BookmarkIcon aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">Save for later</span>
          <span className="sm:hidden">Save</span>
        </button>
        <button type="button" onClick={() => remove.mutate(line.id)} disabled={busy} className={action}>
          <TrashIcon aria-hidden="true" className="size-4" />
          Remove
        </button>
        <button
          type="button"
          onClick={() => buyNow.mutate([{ merchandiseId: line.variantId, quantity: line.quantity }])}
          disabled={busy || !line.available}
          className={cn(action, "text-teal hover:bg-teal-soft hover:text-teal")}
        >
          <ZapIcon aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">{buyNow.isPending ? "Opening checkout…" : "Buy this now"}</span>
          <span className="sm:hidden">Buy now</span>
        </button>
      </div>
    </article>
  )
}
