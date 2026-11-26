import type { Metadata } from "next"
import Link from "next/link"
import { connection } from "next/server"
import { Suspense } from "react"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { CloudIcon } from "lucide-react"

import { Breadcrumb } from "@/components/shared/breadcrumb"
import { AccountSidebar } from "@/features/account/components/account-sidebar"
import { getCustomer, getOrders } from "@/features/account/session.server"
import { homeShelves } from "@/features/home/data"
import { ProductShelf } from "@/features/product/components/product-shelf"
import { WishlistView } from "@/features/wishlist/components/wishlist-view"
import { listWishlist } from "@/features/wishlist/wishlist.server"
import { makeQueryClient } from "@/lib/query/query-client"

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } }

/**
 * Logged in: account sidebar + wishlist.
 * Guests: the wishlist still works (saved in this browser), with a nudge to log in.
 */
async function WishlistContent() {
  // Load the wishlist on the server too, so the first render already shows it and matches the
  // browser (no skeleton on one side and the list on the other = no hydration mismatch).
  // Per-shopper page: render on request, never at build (TanStack stamps Date.now() in prefetch).
  await connection()
  const queryClient = makeQueryClient()
  const [customer] = await Promise.all([
    getCustomer(),
    queryClient.prefetchQuery({ queryKey: ["wishlist"], queryFn: () => listWishlist().catch(() => []) }),
  ])
  const view = (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WishlistView />
    </HydrationBoundary>
  )

  if (!customer) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-sm">
          <CloudIcon aria-hidden="true" className="size-5 text-teal" />
          <span className="flex-1">Your wishlist is saved in this browser. Log in to keep it on all your devices.</span>
          <Link href="/account/login" prefetch={false} className="font-bold text-teal hover:underline">
            Log in
          </Link>
        </div>
        {view}
      </div>
    )
  }

  const orders = await getOrders()
  const onTheWay = orders.filter((o) => o.kind === "processing" || o.kind === "transit").length

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <AccountSidebar customer={customer} current="/account/wishlist" stats={{ orders: orders.length, onTheWay }} />
      {view}
    </div>
  )
}

/** /account/wishlist */
export default function WishlistPage() {
  return (
    <>
      <section aria-labelledby="wish-h" className="container-shop pt-6 pb-12 md:pt-7">
        <Breadcrumb
          className="mb-4"
          items={[{ label: "Home", href: "/" }, { label: "My account", href: "/account" }, { label: "Wishlist" }]}
        />
        <Suspense fallback={null}>
          <WishlistContent />
        </Suspense>
      </section>
      <ProductShelf config={{ ...homeShelves.topPicks, id: "wish-recs", title: "You might also like" }} className="pb-16" />
    </>
  )
}
