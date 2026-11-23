import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { CloudIcon } from "lucide-react"

import { Breadcrumb } from "@/components/shared/breadcrumb"
import { AccountSidebar } from "@/features/account/components/account-sidebar"
import { getPreviewOrders, previewCustomer } from "@/features/account/preview"
import { getCustomer, getOrders, isPreviewMode } from "@/features/account/session.server"
import { homeShelves } from "@/features/home/data"
import { ProductShelf } from "@/features/product/components/product-shelf"
import { WishlistView } from "@/features/wishlist/components/wishlist-view"

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } }

type Props = PageProps<"/account/wishlist">

/**
 * Logged in (or the dev preview): account sidebar + wishlist.
 * Guests: the wishlist still works (saved in this browser), with a nudge to log in.
 */
async function WishlistContent({ searchParams }: Props) {
  const real = await getCustomer()
  const preview = !real && isPreviewMode((await searchParams).preview)
  const customer = real ?? (preview ? previewCustomer : null)

  if (!customer) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-sm">
          <CloudIcon aria-hidden="true" className="size-5 text-teal" />
          <span className="flex-1">Your wishlist is saved on this device. Log in to keep it on all your devices.</span>
          <Link href="/account/login" prefetch={false} className="font-bold text-teal hover:underline">
            Log in
          </Link>
        </div>
        <WishlistView />
      </div>
    )
  }

  const orders = preview ? getPreviewOrders() : await getOrders()
  const onTheWay = orders.filter((o) => o.kind === "processing" || o.kind === "transit").length

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <AccountSidebar customer={customer} current="/account/wishlist" stats={{ orders: orders.length, onTheWay }} />
      <WishlistView />
    </div>
  )
}

/** /account/wishlist */
export default function WishlistPage(props: Props) {
  return (
    <>
      <section aria-labelledby="wish-h" className="container-shop pt-6 pb-12 md:pt-7">
        <Breadcrumb
          className="mb-4"
          items={[{ label: "Home", href: "/" }, { label: "My account", href: "/account" }, { label: "Wishlist" }]}
        />
        <Suspense fallback={null}>
          <WishlistContent {...props} />
        </Suspense>
      </section>
      <ProductShelf config={{ ...homeShelves.topPicks, id: "wish-recs", title: "You might also like" }} className="pb-16" />
    </>
  )
}
