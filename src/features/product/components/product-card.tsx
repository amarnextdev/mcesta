import Image from "next/image"
import Link from "next/link"
import type * as React from "react"

import { Price } from "@/components/shared/price"
import { Rating } from "@/components/shared/rating"
import type { ProductCard as ProductCardData } from "@/lib/shopify/types"
import { cn } from "@/lib/utils"

import { AddToCartButton } from "./add-to-cart-button"
import { WishlistButton } from "./wishlist-button"

type ProductCardProps = {
  product: ProductCardData
  /** Preload the image (first row above the fold). */
  preload?: boolean
  /** Responsive image sizes; defaults fit a 2/3/4 column grid. */
  sizes?: string
  className?: string
  /** Extra line under the price (e.g. "Price dropped" on the wishlist). */
  extra?: React.ReactNode
}

function Badge({ product }: { product: ProductCardData }) {
  if (!product.available) {
    return <span className="rounded-full bg-ink px-2 py-1 text-[0.6875rem] font-bold tracking-wider text-cream uppercase">Sold out</span>
  }
  if (product.discountPercent) {
    return <span className="rounded-full bg-terra px-2 py-[3px] text-xs font-bold text-white">{product.discountPercent}% off</span>
  }
  const tags = product.tags.map((t) => t.toLowerCase())
  const tag = "rounded-full px-2 py-1 text-[0.6875rem] font-bold tracking-[0.06em] uppercase"
  if (tags.includes("new")) {
    return <span className={cn(tag, "bg-teal-soft text-teal")}>New</span>
  }
  if (tags.includes("bestseller")) {
    return <span className={cn(tag, "bg-[#e8dccb] text-ink")}>Bestseller</span>
  }
  return null
}

/** The one product card used everywhere (home, collection, search, recommendations, wishlist). */
export function ProductCard({
  product,
  preload = false,
  sizes = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw",
  className,
  extra,
}: ProductCardProps) {
  const href = `/products/${product.handle}`

  return (
    <article
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-2xl border border-line-soft bg-white transition-shadow hover:shadow-[0_8px_24px_rgba(31,42,46,0.08)]",
        className
      )}
    >
      <Link href={href} className="flex flex-col text-ink outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <div className="relative mx-2 mt-2 aspect-[5/4] overflow-hidden rounded-xl bg-sand">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.alt}
              fill
              sizes={sizes}
              preload={preload}
              className={cn(
                "object-cover transition-transform duration-500 group-hover/card:scale-[1.03]",
                !product.available && "opacity-60"
              )}
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">No photo yet</span>
          )}
          <span className="absolute top-2.5 left-2.5">
            <Badge product={product} />
          </span>
        </div>
        <div className="flex flex-col gap-1 px-3.5 pt-2.5">
          <Rating />
          <h3 className="line-clamp-2 min-h-[2.6em] font-sans text-[0.9375rem] leading-[1.3] font-semibold tracking-normal">
            {product.title}
          </h3>
        </div>
      </Link>
      <Price price={product.price} compareAtPrice={product.compareAtPrice} className="px-3.5 pt-1.5" />
      {extra && <div className="px-3.5 pt-1.5">{extra}</div>}
      <div className="mt-auto px-3.5 pt-2.5 pb-3.5">
        <AddToCartButton product={product} />
      </div>
      <WishlistButton product={product} className="absolute top-4 right-4" />
    </article>
  )
}
