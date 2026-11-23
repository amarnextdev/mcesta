import type { Metadata } from "next"
import { Suspense } from "react"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { Skeleton } from "@/components/ui/skeleton"
import { getCart } from "@/features/cart/cart.server"
import { CartView } from "@/features/cart/components/cart-view"
import { cartKey } from "@/features/cart/keys"
import { homeShelves } from "@/features/home/data"
import { ProductShelf } from "@/features/product/components/product-shelf"
import { makeQueryClient } from "@/lib/query/query-client"

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false },
}

/** Reads the cart cookie, so it renders per request. */
async function CartContent() {
  const queryClient = makeQueryClient()
  queryClient.setQueryData(cartKey, await getCart().catch(() => null))
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CartView />
    </HydrationBoundary>
  )
}

function CartSkeleton() {
  return (
    <div aria-hidden="true" className="container-shop pt-7 pb-14">
      <Skeleton className="mb-6 h-9 w-48" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-3.5">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-48 rounded-[18px]" />
          <Skeleton className="h-48 rounded-[18px]" />
        </div>
        <Skeleton className="h-[26.25rem] rounded-2xl" />
      </div>
    </div>
  )
}

/** /cart: full cart page. Checkout itself happens on Shopify's secure checkout. */
export default function CartPage() {
  return (
    <>
      <Suspense fallback={<CartSkeleton />}>
        <CartContent />
      </Suspense>
      <ProductShelf
        config={{ ...homeShelves.topPicks, id: "missed", title: "Items you may have missed" }}
        className="pb-16"
      />
    </>
  )
}
