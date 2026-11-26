"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { LockIcon, PackageXIcon, Share2Icon, ShieldCheckIcon, ShoppingBagIcon } from "lucide-react"
import { toast } from "sonner"

import { Rating } from "@/components/shared/rating"
import { Button } from "@/components/ui/button"
import { useAddToCart, useBuyNow } from "@/features/cart/hooks"
import { formatMoney } from "@/lib/format"
import type { ProductDetail } from "@/lib/shopify/types"
import { cn } from "@/lib/utils"

import { defaultVariant, findVariant, productToCard, searchFromSelection, selectionFromSearch, type Selection } from "../../variants"
import { WishlistButton } from "../wishlist-button"
import { DeliveryEstimate } from "./delivery-estimate"
import { OptionPicker } from "./option-picker"
import { ProductDetails } from "./product-details"
import { ProductGallery } from "./product-gallery"
import { QuantityStepper } from "./quantity-stepper"

/**
 * Backed by CJ's refund/resend policy (damaged, wrong or missing items, parcels lost in transit)
 * and Shopify's checkout. Delivery promises (shipping, tracking) live in the delivery box only.
 * Keep in line with the Refund policy page.
 */
const promises = [
  { icon: ShieldCheckIcon, text: "Damaged or wrong item?", sub: "Replacement or refund" },
  { icon: PackageXIcon, text: "Lost in transit?", sub: "We resend or refund" },
  { icon: LockIcon, text: "Secure checkout", sub: "Encrypted by Shopify" },
]

/**
 * Product page body (design: Product.dc.html): gallery on the left, buy box on the right.
 * The chosen options live in the URL (?Color=Oak) via history.replaceState, so links share
 * the exact variant without a server round trip.
 */
export function ProductView({
  product,
  category,
  country,
}: {
  product: ProductDetail
  category: { label: string; href: string } | null
  /** Shopper's market (ISO code), for the delivery check. */
  country: string
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selection = useMemo(() => selectionFromSearch(product, searchParams), [product, searchParams])
  const variant = findVariant(product, selection) ?? defaultVariant(product)
  const card = useMemo(() => productToCard(product), [product])
  const [quantity, setQuantity] = useState(1)

  const select = (next: Selection) => {
    window.history.replaceState(null, "", `${pathname}${searchFromSelection(product, next)}`)
  }

  const price = variant?.price
  const compare = variant?.compareAtPrice
  const available = Boolean(variant?.available)
  const discount = price && compare ? Math.round((1 - price.amount / compare.amount) * 100) : null
  const total = price ? formatMoney({ amount: price.amount * quantity, currencyCode: price.currencyCode }) : ""

  const add = useAddToCart()
  const buy = useBuyNow()
  const line = variant ? [{ merchandiseId: variant.id, quantity }] : []
  const addToCart = () => add.mutate(line.map((l) => ({ ...l, title: product.title })))
  const buyNow = () => buy.mutate(line)

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: product.title, url })
      else {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied")
      }
    } catch {
      // Share sheet closed: nothing to do.
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-12">
      <div className="lg:sticky lg:top-24">
        <ProductGallery
          title={product.title}
          images={product.images}
          activeImage={variant?.image ?? null}
          discountPercent={discount}
        />
      </div>

      <div className="flex flex-col gap-[22px]">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            {category ? (
              <Link href={category.href} className="text-[0.8125rem] font-semibold text-teal hover:underline">
                {category.label}
              </Link>
            ) : (
              <span className="text-[0.8125rem] font-semibold text-teal">{product.vendor}</span>
            )}
            <span className="flex gap-1.5">
              {card && <WishlistButton product={card} className="size-10 border border-line shadow-none" />}
              <button
                type="button"
                aria-label="Share"
                onClick={share}
                className="grid size-10 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink"
              >
                <Share2Icon className="size-[18px]" />
              </button>
            </span>
          </div>
          <h1 className="text-[1.5rem] leading-[1.1] md:text-[1.875rem] lg:text-[2.125rem]">{product.title}</h1>
          <div className="flex items-center gap-2 text-sm text-slate">
            <Rating value={product.rating?.value} count={product.rating?.count} className="text-sm" />
            <span aria-hidden="true">·</span>
            <a href="#reviews" className="font-semibold text-ink underline-offset-2 hover:underline">
              {product.rating ? "Read reviews" : "Be the first to review"}
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {price && (
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className={cn("text-[2.125rem] leading-none font-bold tabular-nums", compare ? "text-terra-text" : "text-ink")}>
                {formatMoney(price)}
              </span>
              {compare && (
                <>
                  <span className="text-lg text-slate tabular-nums line-through">{formatMoney(compare)}</span>
                  <span className="rounded-full bg-success-soft px-2.5 py-[3px] text-[0.8125rem] font-bold text-success">
                    Save {formatMoney({ amount: compare.amount - price.amount, currencyCode: price.currencyCode })} ({discount}%)
                  </span>
                </>
              )}
            </div>
          )}
          <span className="text-[0.8125rem] text-slate">Taxes and shipping calculated at checkout.</span>
        </div>

        {product.options.length > 0 && (
          <div className="flex flex-col gap-5 border-t border-line pt-[18px]">
            {product.options.map((option) => (
              <OptionPicker key={option.name} product={product} option={option} selection={selection} onSelect={select} />
            ))}
          </div>
        )}

        {/* Buy row. Sticks to the bottom of the screen on phones. */}
        <div className="sticky bottom-0 z-20 -mx-4 flex items-center gap-2.5 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          {available ? (
            <>
              <Button
                variant="outline"
                onClick={addToCart}
                disabled={add.isPending}
                className="h-[3.25rem] flex-1 border-[1.5px] border-teal bg-white text-[0.9375rem] text-teal hover:bg-teal-soft"
              >
                <ShoppingBagIcon data-icon="inline-start" className="size-[18px]" />
                {add.isPending ? "Adding…" : "Add to cart"}
              </Button>
              <Button onClick={buyNow} disabled={buy.isPending} className="h-[3.25rem] flex-[1.2] flex-col gap-0 leading-tight">
                <span className="text-[0.9375rem] font-bold">{buy.isPending ? "Opening checkout…" : "Buy now"}</span>
                <span className="text-xs font-medium opacity-85">{total}</span>
              </Button>
            </>
          ) : (
            <Button disabled className="h-[3.25rem] flex-1 text-[0.9375rem]">
              Sold out
            </Button>
          )}
        </div>

        <DeliveryEstimate
          variantId={variant?.id}
          country={country}
          currencyCode={variant?.price.currencyCode ?? product.variants[0]?.price.currencyCode}
        />

        <div className="flex flex-col gap-3.5">
          <h2 className="font-sans text-lg font-bold">Shop with peace of mind</h2>
          <p className="-mt-2 text-[0.8125rem] text-slate">Report a damaged, wrong or missing item within 48 hours of delivery, with a photo or video.</p>
          <ul className="grid grid-cols-3 gap-2.5">
            {promises.map(({ icon: Icon, text, sub }) => (
              <li key={text} className="flex flex-col items-center gap-2 rounded-xl bg-sand px-2 py-3.5 text-center">
                <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-white text-teal">
                  <Icon className="size-5" />
                </span>
                <span className="flex flex-col text-[0.8125rem] leading-snug">
                  <span className="font-semibold">{text}</span>
                  <span className="text-xs text-slate">{sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <ProductDetails product={product} />
      </div>
    </div>
  )
}
