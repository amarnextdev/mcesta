"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowRightIcon, ShoppingBagIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useAddToCart } from "@/features/cart/hooks"
import { formatMoney } from "@/lib/format"
import type { ProductDetail } from "@/lib/shopify/types"
import { cn } from "@/lib/utils"

import { quickAddProductAction } from "../actions"
import { defaultVariant, findVariant, type Selection } from "../variants"
import { OptionPicker } from "./detail/option-picker"
import { QuantityStepper } from "./detail/quantity-stepper"

/**
 * Quick add: pick options and add to cart without leaving the list.
 * Loads the full product only when opened (cached, same data as the product page).
 */
export function QuickAddDialog({ handle, title, open, onOpenChange }: { handle: string; title: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: product, isPending, isError } = useQuery({
    queryKey: ["quick-add", handle],
    queryFn: () => quickAddProductAction(handle),
    enabled: open,
    staleTime: 5 * 60_000,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="sr-only">Choose options: {title}</DialogTitle>
        <DialogDescription className="sr-only">Pick a variant and quantity, then add it to your cart.</DialogDescription>
        {isPending ? (
          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex gap-4">
              <Skeleton className="size-24 rounded-xl" />
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-[3.25rem] rounded-[10px]" />
          </div>
        ) : isError || !product ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="font-semibold">We couldn&apos;t load this product.</p>
            <Button asChild variant="outline">
              <Link href={`/products/${handle}`}>Open the product page</Link>
            </Button>
          </div>
        ) : (
          <QuickAddBody key={product.id} product={product} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function QuickAddBody({ product, onDone }: { product: ProductDetail; onDone: () => void }) {
  const add = useAddToCart()
  const [selection, setSelection] = useState<Selection>(() => defaultVariant(product)?.options ?? {})
  const [quantity, setQuantity] = useState(1)
  const variant = findVariant(product, selection) ?? defaultVariant(product)
  const image = variant?.image ?? product.images[0] ?? null
  const available = Boolean(variant?.available)

  return (
    <>
      <div className="flex-1 overflow-y-auto p-5 sm:p-6">
        <div className="flex gap-4 pr-10">
          <span className="relative size-24 flex-none overflow-hidden rounded-xl bg-sand">
            {image && <Image src={image.url} alt="" fill sizes="96px" className="object-cover" />}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="line-clamp-2 text-base leading-snug font-semibold">{product.title}</span>
            {variant && (
              <span className="flex flex-wrap items-baseline gap-2">
                <span className={cn("text-xl font-bold tabular-nums", variant.compareAtPrice ? "text-terra-text" : "text-ink")}>
                  {formatMoney(variant.price)}
                </span>
                {variant.compareAtPrice && <span className="text-sm text-slate tabular-nums line-through">{formatMoney(variant.compareAtPrice)}</span>}
              </span>
            )}
            <Link href={`/products/${product.handle}`} onClick={onDone} className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-teal hover:underline">
              View full details
              <ArrowRightIcon aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-5 border-t border-line pt-5">
          {product.options.map((option) => (
            <OptionPicker key={option.name} product={product} option={option} selection={selection} onSelect={setSelection} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2.5 border-t border-line bg-white p-4 sm:px-6">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <Button
          size="lg"
          disabled={!available || !variant || add.isPending}
          onClick={() =>
            variant &&
            add.mutate([{ merchandiseId: variant.id, quantity, title: product.title }], { onSuccess: onDone })
          }
          className="h-[3.25rem] flex-1 text-[0.9375rem] font-bold"
        >
          <ShoppingBagIcon data-icon="inline-start" className="size-[18px]" />
          {!available ? "Sold out" : add.isPending ? "Adding…" : `Add to cart · ${variant ? formatMoney({ amount: variant.price.amount * quantity, currencyCode: variant.price.currencyCode }) : ""}`}
        </Button>
      </div>
    </>
  )
}
