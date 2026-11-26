"use client"

import Image from "next/image"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { LockIcon, MinusIcon, PlusIcon, ShoppingBagIcon, TrashIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { formatMoney } from "@/lib/format"
import type { Cart, CartLine } from "@/lib/shopify/cart"
import { cn } from "@/lib/utils"

import { cartUpsellAction } from "../actions"
import { CHECKOUT_PATH, hasFreeShipping, MAX_QUANTITY } from "../config"
import { cartDrawer, useCartDrawerOpen } from "../drawer-store"
import { useAddToCart, useCart, useRemoveLine, useUpdateLine } from "../hooks"
import { FreeShippingBar } from "./free-shipping-bar"
import { GiftNote } from "./gift-note"

/** Slide-in cart (design: CartDrawer.dc.html). Opens from the header icon and after "Add to cart". */
export function CartDrawer() {
  const open = useCartDrawerOpen()
  const { data: cart } = useCart()
  const lines = cart?.lines ?? []
  const count = cart?.totalQuantity ?? 0

  return (
    <Sheet open={open} onOpenChange={cartDrawer.setOpen}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex flex-col gap-0 border-l border-line bg-cream p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[440px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <SheetTitle className="font-heading text-[1.25rem] leading-none font-normal">Your cart</SheetTitle>
            {count > 0 && (
              <span className="rounded-full bg-teal-soft px-2 py-0.5 text-xs font-bold text-teal tabular-nums">
                {count} {count === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <SheetDescription className="sr-only">Items in your cart, with checkout.</SheetDescription>
          <SheetClose
            aria-label="Close cart"
            className="grid size-9 place-items-center rounded-full text-ink transition-colors hover:bg-sand focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <XIcon className="size-5" />
          </SheetClose>
        </div>

        {/* Body: everything is a white card on the cream background */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
              <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-white text-teal shadow-[0_1px_2px_rgba(31,42,46,0.06)]">
                <ShoppingBagIcon className="size-7" />
              </span>
              <p className="font-heading text-[1.25rem]">Your cart is empty</p>
              <p className="text-sm text-slate">Find something you&apos;ll love in our gifts.</p>
              <Button asChild size="lg" className="mt-1 h-[2.875rem] px-[22px]" onClick={cartDrawer.close}>
                <Link href="/gifts">Shop gifts</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <div className="rounded-2xl border border-line-soft bg-white px-3.5 py-3">
                <FreeShippingBar subtotal={cart!.subtotal} compact />
              </div>
              <ul className="flex flex-col gap-2.5">
                {lines.map((line) => (
                  <DrawerLine key={line.id} line={line} />
                ))}
              </ul>
              <Upsell cart={cart!} />
              <GiftNote cart={cart!} />
            </div>
          )}
        </div>

        {cart && lines.length > 0 && <DrawerFooter cart={cart} />}
      </SheetContent>
    </Sheet>
  )
}

function DrawerLine({ line }: { line: CartLine }) {
  const update = useUpdateLine()
  const remove = useRemoveLine()
  const href = `/products/${line.handle}`

  return (
    <li
      className={cn(
        "flex gap-3.5 rounded-2xl border border-line-soft bg-white p-3 shadow-[0_1px_2px_rgba(31,42,46,0.04)] transition-opacity",
        (remove.isPending || update.isPending) && "opacity-60"
      )}
    >
      <Link
        href={href}
        onClick={cartDrawer.close}
        tabIndex={-1}
        aria-hidden="true"
        className="relative size-24 flex-none overflow-hidden rounded-xl bg-sand"
      >
        {line.image && <Image src={line.image.url} alt="" fill sizes="96px" className="object-cover" />}
      </Link>

      {/* Same height as the photo: details on top, quantity row pinned to the bottom. */}
      <div className="flex min-h-24 min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} onClick={cartDrawer.close} className="line-clamp-2 text-sm leading-snug font-semibold hover:text-teal">
            {line.title}
          </Link>
          <span className="flex flex-none flex-col items-end leading-tight">
            <span className="text-[0.9375rem] font-bold tabular-nums">{formatMoney(line.total)}</span>
            {line.compareAtPrice && (
              <span className="text-xs text-slate tabular-nums line-through">
                {formatMoney({ amount: line.compareAtPrice.amount * line.quantity, currencyCode: line.price.currencyCode })}
              </span>
            )}
          </span>
        </div>
        <span className="mt-0.5 text-[0.8125rem] text-slate">
          {[line.variantTitle, line.quantity > 1 ? `${formatMoney(line.price)} each` : null].filter(Boolean).join(" · ")}
        </span>
        {!line.available && <span className="mt-0.5 text-[0.8125rem] font-semibold text-terra-text">Sold out</span>}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div role="group" aria-label={`Quantity for ${line.title}`} className="flex h-8 items-center rounded-full border border-line-strong bg-white">
            <button
              type="button"
              aria-label={line.quantity === 1 ? `Remove ${line.title}` : "Decrease quantity"}
              onClick={() => update.mutate({ lineId: line.id, quantity: line.quantity - 1 })}
              className="grid h-full w-8 place-items-center rounded-l-full text-ink hover:bg-sand"
            >
              {line.quantity === 1 ? <TrashIcon className="size-3.5" /> : <MinusIcon className="size-3.5" />}
            </button>
            <span aria-live="polite" className="min-w-6 text-center text-sm font-bold tabular-nums">
              {line.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={line.quantity >= MAX_QUANTITY}
              onClick={() => update.mutate({ lineId: line.id, quantity: line.quantity + 1 })}
              className="grid h-full w-8 place-items-center rounded-r-full text-ink hover:bg-sand disabled:opacity-30"
            >
              <PlusIcon className="size-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove.mutate(line.id)}
            aria-label={`Remove ${line.title}`}
            className="grid size-8 place-items-center rounded-full text-slate transition-colors hover:bg-terra-soft hover:text-terra-text"
          >
            <TrashIcon aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </li>
  )
}

/** "Complete the set": one add-on for the newest cart item (from Shopify's complementary products). */
function Upsell({ cart }: { cart: Cart }) {
  const add = useAddToCart()
  const first = cart.lines[0]
  const inCart = cart.lines.map((l) => l.productId)
  const { data: product } = useQuery({
    queryKey: ["cart-upsell", first?.productId, inCart],
    queryFn: () => cartUpsellAction(first!.productId, inCart),
    enabled: Boolean(first),
    staleTime: 5 * 60_000,
  })
  if (!product || !product.variantId) return null

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-line-soft bg-white p-3">
      <span className="text-xs font-bold tracking-[0.06em] text-slate uppercase">Complete the set</span>
      <div className="flex items-center gap-3">
        <Link
          href={`/products/${product.handle}`}
          onClick={cartDrawer.close}
          className="relative size-14 flex-none overflow-hidden rounded-[10px] bg-sand"
        >
          {product.image && <Image src={product.image.url} alt="" fill sizes="56px" className="object-cover" />}
        </Link>
        <span className="flex min-w-0 flex-1 flex-col leading-snug">
          <span className="truncate text-sm font-semibold">{product.title}</span>
          <span className="text-[0.8125rem] text-slate tabular-nums">{formatMoney(product.price)}</span>
        </span>
        <button
          type="button"
          disabled={add.isPending}
          onClick={() => add.mutate([{ merchandiseId: product.variantId!, quantity: 1, title: product.title }])}
          className="h-9 rounded-full border-[1.5px] border-teal bg-white px-3.5 text-[0.8125rem] font-bold text-teal transition-colors hover:bg-teal hover:text-cream disabled:opacity-50"
        >
          {add.isPending ? "Adding…" : "+ Add"}
        </button>
      </div>
    </div>
  )
}

function DrawerFooter({ cart }: { cart: Cart }) {
  const savings =
    cart.lines.reduce((sum, l) => sum + (l.compareAtPrice ? (l.compareAtPrice.amount - l.price.amount) * l.quantity : 0), 0) +
    cart.codeSavings.amount
  const freeShipping = hasFreeShipping(cart.subtotal)
  const blocked = cart.lines.some((l) => !l.available)
  const button = "inline-flex h-[3.25rem] items-center justify-center gap-2 rounded-xl text-[0.9375rem] font-bold transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"

  return (
    <div className="flex flex-col gap-3.5 border-t border-line-soft bg-cream px-5 pt-4 pb-5 sm:px-6">
      {/* Summary card */}
      <div className="flex flex-col gap-2 rounded-2xl border border-line-soft bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(31,42,46,0.04)]">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[0.9375rem] font-semibold">Subtotal</span>
          <span className="text-[1.375rem] font-bold tabular-nums">{formatMoney(cart.total)}</span>
        </div>
        {savings > 0.005 && (
          <div className="flex items-center justify-between text-[0.8125rem]">
            <span className="text-slate">You save</span>
            <span className="font-bold text-success tabular-nums">−{formatMoney({ amount: savings, currencyCode: cart.total.currencyCode })}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-[0.8125rem]">
          <span className="text-slate">Shipping</span>
          <span className={freeShipping ? "font-bold text-success" : "text-slate"}>{freeShipping ? "Free" : "At checkout"}</span>
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-line pt-2 text-xs text-slate">
          <span>Taxes calculated at checkout</span>
          <span className="inline-flex items-center gap-1">
            <LockIcon aria-hidden="true" className="size-3" />
            Secure
          </span>
        </div>
      </div>

      {/* Actions: full cart page and checkout (main) */}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-2.5">
        <Link href="/cart" onClick={cartDrawer.close} className={cn(button, "border-[1.5px] border-line-strong bg-white text-ink hover:border-ink")}>
          <ShoppingBagIcon aria-hidden="true" className="size-[18px]" />
          View cart
        </Link>
        {blocked ? (
          <span aria-disabled="true" className={cn(button, "cursor-not-allowed bg-line-strong px-3 text-sm text-white")}>
            Remove sold-out items
          </span>
        ) : (
          <a href={CHECKOUT_PATH} className={cn(button, "bg-teal text-cream shadow-[0_6px_16px_-6px_rgba(31,92,90,0.6)] hover:bg-teal/90")}>
            <LockIcon aria-hidden="true" className="size-[18px]" />
            Checkout
          </a>
        )}
      </div>

      <button
        type="button"
        onClick={cartDrawer.close}
        className="self-center text-[0.8125rem] font-semibold text-slate underline-offset-2 hover:text-ink hover:underline"
      >
        Continue shopping
      </button>
    </div>
  )
}
