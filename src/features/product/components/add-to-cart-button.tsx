"use client"

import { useState } from "react"
import { LoaderCircleIcon, ShoppingBagIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAddToCart } from "@/features/cart/hooks"
import type { ProductCard } from "@/lib/shopify/types"

import { QuickAddDialog } from "./quick-add-dialog"

/**
 * Card button. One variant → adds it straight to the Shopify cart. Several variants (sizes,
 * colours) → a quick-add dialog to pick options, so the shopper never leaves the list.
 */
export function AddToCartButton({ product }: { product: ProductCard }) {
  const add = useAddToCart()
  const [quickAdd, setQuickAdd] = useState(false)

  if (!product.available || !product.variantId) {
    return (
      <Button variant="outline" className="h-[2.625rem] w-full text-[0.9375rem]" disabled>
        Sold out
      </Button>
    )
  }

  if (product.hasOptions) {
    return (
      <>
        <Button className="h-[2.625rem] w-full text-[0.9375rem]" aria-haspopup="dialog" onClick={() => setQuickAdd(true)}>
          <ShoppingBagIcon data-icon="inline-start" className="size-[18px]" />
          Add to cart
        </Button>
        <QuickAddDialog handle={product.handle} title={product.title} open={quickAdd} onOpenChange={setQuickAdd} />
      </>
    )
  }

  return (
    <Button
      className="h-[2.625rem] w-full text-[0.9375rem]"
      disabled={add.isPending}
      onClick={() => add.mutate([{ merchandiseId: product.variantId!, quantity: 1, title: product.title }])}
    >
      {add.isPending ? (
        <LoaderCircleIcon data-icon="inline-start" className="size-[18px] animate-spin" />
      ) : (
        <ShoppingBagIcon data-icon="inline-start" className="size-[18px]" />
      )}
      {add.isPending ? "Adding…" : "Add to cart"}
    </Button>
  )
}
