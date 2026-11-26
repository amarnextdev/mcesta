"use client"

import Image from "next/image"
import Link from "next/link"
import { LockIcon, ShoppingBagIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RecentlyViewedSection } from "@/features/product/components/recently-viewed-section"
import { formatMoney } from "@/lib/format"
import type { Cart } from "@/lib/shopify/cart"
import { cn } from "@/lib/utils"

import { CHECKOUT_PATH } from "../config"
import { useAddToCart, useCart } from "../hooks"
import { useSavedForLaterLive } from "../saved"
import { CartLineItem } from "./cart-line-item"
import { CartSummary } from "./cart-summary"
import { FreeShippingBar } from "./free-shipping-bar"
import { GiftNote } from "./gift-note"

const steps = ["Cart", "Shipping", "Payment"]

/** Cart page body (design: Cart.dc.html). */
export function CartView() {
  const { data: cart } = useCart()
  const lines = cart?.lines ?? []
  const count = cart?.totalQuantity ?? 0
  const hasItems = Boolean(cart && lines.length > 0)

  return (
    <>
      <section aria-labelledby="cart-h" className={cn("container-shop pt-6 md:pt-7", hasItems ? "pb-28 lg:pb-14" : "pb-14")}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 md:mb-[22px]">
          <div className="flex items-baseline gap-2.5">
            <h1 id="cart-h" className="text-[1.625rem] leading-[1.1] md:text-[2rem]">
              Your cart
            </h1>
            {count > 0 && (
              <span className="rounded-full bg-teal-soft px-2.5 py-[3px] text-[0.9375rem] font-semibold text-teal">
                {count} {count === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <ol aria-label="Checkout steps" className="hidden items-center gap-2.5 sm:flex">
            {steps.map((step, i) => (
              <li key={step} className="flex items-center gap-2.5">
                {i > 0 && <span aria-hidden="true" className="h-0.5 w-12 rounded-full bg-line-strong" />}
                <span
                  aria-current={i === 0 ? "step" : undefined}
                  className={cn(
                    "grid size-[26px] place-items-center rounded-full border-2 text-[0.8125rem] font-bold",
                    i === 0 ? "border-teal bg-teal text-cream shadow-[0_0_0_4px_var(--color-teal-soft)]" : "border-line-strong bg-white text-slate"
                  )}
                >
                  {i + 1}
                </span>
                <span className={cn("text-sm", i === 0 ? "font-bold" : "text-slate")}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {!hasItems ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-6 py-14 text-center">
              <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-teal-soft text-teal">
                <ShoppingBagIcon className="size-7" />
              </span>
              <p className="font-heading text-[1.375rem]">Your cart is empty</p>
              <p className="text-[0.9375rem] text-slate">Find something you love. Anything you save for later stays below.</p>
              <Button asChild size="lg" className="mt-1 h-[2.875rem] px-[22px]">
                <Link href="/">Start shopping</Link>
              </Button>
            </div>
            <SavedForLater />
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-3.5">
              <div className="rounded-2xl border border-line bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(31,42,46,0.04)] sm:px-5">
                <FreeShippingBar subtotal={cart!.subtotal} />
              </div>
              {lines.map((line) => (
                <CartLineItem key={line.id} line={line} />
              ))}
              <GiftNote cart={cart!} />
              <SavedForLater />
            </div>
            <CartSummary cart={cart!} />
          </div>
        )}
      </section>
      {hasItems && <MobileCheckoutBar cart={cart!} />}
      <RecentlyViewedSection exclude={lines.map((l) => l.handle)} className="pb-14" />
    </>
  )
}

/** Mobile: total + checkout stay in reach while scrolling the items. */
function MobileCheckoutBar({ cart }: { cart: Cart }) {
  const blocked = cart.lines.some((l) => !l.available)
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-8px_24px_-12px_rgba(31,42,46,0.2)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-4">
        <div className="flex flex-col leading-tight">
          <span className="text-xs text-slate">Total</span>
          <span className="text-lg font-bold tabular-nums">{formatMoney(cart.total)}</span>
        </div>
        {blocked ? (
          <Button disabled className="h-12 flex-1 rounded-xl font-bold">
            Remove sold-out items
          </Button>
        ) : (
          <Button asChild className="h-12 flex-1 rounded-xl text-[0.9375rem] font-bold">
            <a href={CHECKOUT_PATH}>
              <LockIcon data-icon="inline-start" className="size-4" />
              Checkout
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}

/** Live price and stock from Shopify; items Shopify no longer has drop off the list. */
function SavedForLater() {
  const { items, remove } = useSavedForLaterLive()
  const add = useAddToCart()
  if (items.length === 0) return null

  return (
    <div className="mt-2.5 flex flex-col gap-2.5">
      <h2 className="font-sans text-lg font-bold">Saved for later ({items.length})</h2>
      {items.map((item) => (
        <div key={item.variantId} className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-3 shadow-[0_1px_2px_rgba(31,42,46,0.04)]">
          <Link href={`/products/${item.handle}`} className="relative size-16 flex-none overflow-hidden rounded-[10px] border border-line-soft bg-sand">
            {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
          </Link>
          <span className="flex min-w-0 flex-1 flex-col leading-snug">
            <Link href={`/products/${item.handle}`} className="truncate text-[0.9375rem] font-semibold hover:text-teal">
              {item.title}
            </Link>
            {item.variantTitle && <span className="truncate text-xs text-slate">{item.variantTitle}</span>}
            <span className="text-sm font-bold tabular-nums">{formatMoney(item.price)}</span>
          </span>
          {item.available ? (
            <Button
              variant="outline"
              size="sm"
              disabled={add.isPending}
              onClick={() =>
                add.mutate([{ merchandiseId: item.variantId, quantity: 1, title: item.title }], { onSuccess: () => remove(item.variantId) })
              }
              className="h-[2.375rem] border-[1.5px] border-teal bg-white px-3 text-teal hover:bg-teal hover:text-cream"
            >
              Move to cart
            </Button>
          ) : (
            <span className="text-[0.8125rem] font-semibold text-terra-text">Sold out</span>
          )}
          <button type="button" onClick={() => remove(item.variantId)} className="hidden px-2 text-sm font-semibold text-slate hover:text-ink sm:block">
            Remove
          </button>
        </div>
      ))}
    </div>
  )
}
