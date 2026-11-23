"use client"

import Image from "next/image"
import Link from "next/link"
import { BookmarkIcon, MinusIcon, PlusIcon, ShieldCheckIcon, TrashIcon, TruckIcon, ZapIcon } from "lucide-react"

import { formatMoney } from "@/lib/format"
import type { CartLine } from "@/lib/shopify/cart"
import { cn } from "@/lib/utils"

import { MAX_QUANTITY } from "../config"
import { useBuyNow, useRemoveLine, useUpdateLine } from "../hooks"
import { useSavedForLater } from "../saved"

const action =
  "flex h-12 flex-1 items-center justify-center gap-2 text-sm font-semibold text-slate transition-colors hover:bg-sand hover:text-ink focus-visible:bg-sand focus-visible:outline-none disabled:opacity-50"

/** One cart item (design: photo + qty on the left, details in the middle, item total on the right). */
export function CartLineItem({ line }: { line: CartLine }) {
  const update = useUpdateLine()
  const remove = useRemoveLine()
  const buyNow = useBuyNow()
  const { save } = useSavedForLater()
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
      className={cn("overflow-hidden rounded-[18px] border border-line bg-white transition-opacity", busy && "opacity-60")}
    >
      <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[128px_minmax(0,1fr)_auto] sm:gap-[22px] sm:p-[22px]">
        <div className="row-span-2 flex flex-col items-center gap-3 sm:row-span-1">
          <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-square w-full overflow-hidden rounded-[14px] bg-sand">
            {line.image && <Image src={line.image.url} alt="" fill sizes="128px" className="object-cover" />}
            {discount && (
              <span className="absolute top-2 left-2 rounded-full bg-terra px-[7px] py-[3px] text-[0.6875rem] font-bold text-white">-{discount}%</span>
            )}
          </Link>
          <div role="group" aria-label={`Quantity for ${line.title}`} className="flex h-[2.375rem] items-center rounded-full border-[1.5px] border-line-strong bg-white">
            <button
              type="button"
              aria-label={line.quantity === 1 ? `Remove ${line.title}` : "Decrease quantity"}
              onClick={() => setQty(line.quantity - 1)}
              className="grid h-full w-9 place-items-center rounded-l-full hover:bg-sand"
            >
              {line.quantity === 1 ? <TrashIcon className="size-3.5" /> : <MinusIcon className="size-3.5" />}
            </button>
            <span aria-live="polite" className="grid h-full min-w-[30px] place-items-center border-x border-line-soft text-sm font-bold tabular-nums">
              {line.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={line.quantity >= MAX_QUANTITY}
              onClick={() => setQty(line.quantity + 1)}
              className="grid h-full w-9 place-items-center rounded-r-full hover:bg-sand disabled:opacity-30"
            >
              <PlusIcon className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <Link href={href} className="text-base leading-snug font-semibold hover:text-teal sm:text-lg">
            {line.title}
          </Link>
          {line.options.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {line.options.map((o) => (
                <span key={o.name} className="rounded-full bg-sand px-2.5 py-[3px] text-xs font-semibold text-slate">
                  {o.name}: {o.value}
                </span>
              ))}
            </div>
          )}
          <span className="flex flex-wrap items-baseline gap-2">
            <span className={cn("text-lg font-bold tabular-nums sm:text-xl", line.compareAtPrice ? "text-terra-text" : "text-ink")}>
              {formatMoney(line.price)}
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
          {!line.available && <span className="text-[0.8125rem] font-semibold text-terra-text">Sold out. Remove it to check out.</span>}
          <div className="mt-1 hidden flex-col gap-1.5 rounded-[10px] bg-cream px-3 py-2.5 sm:flex">
            <span className="flex items-center gap-2 text-[0.8125rem]">
              <TruckIcon aria-hidden="true" className="size-4 text-teal" />
              <span>
                <span className="font-bold">Arrives in 3–7 business days</span> · Ships from our US warehouse
              </span>
            </span>
            <span className="flex items-center gap-2 text-[0.8125rem] text-slate">
              <ShieldCheckIcon aria-hidden="true" className="size-4" />
              Damage covered: report within 48 hours of delivery
            </span>
          </div>
        </div>

        <div className="col-start-2 flex items-baseline gap-2 sm:col-start-auto sm:flex-col sm:items-end sm:gap-0.5 sm:text-right">
          <span className="text-xs text-slate">Item total</span>
          <span className="text-lg font-bold tabular-nums sm:text-xl">{formatMoney(line.total)}</span>
          {line.quantity > 1 && <span className="text-xs text-slate">{formatMoney(line.price)} each</span>}
        </div>
      </div>

      <div className="flex divide-x divide-line-soft border-t border-line-soft bg-[#fcfaf6]">
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
          className={cn(action, "text-teal hover:text-teal")}
        >
          <ZapIcon aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">{buyNow.isPending ? "Opening checkout…" : "Buy this now"}</span>
          <span className="sm:hidden">Buy now</span>
        </button>
      </div>
    </article>
  )
}
