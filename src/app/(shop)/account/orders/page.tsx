import type { Metadata } from "next"
import { Suspense } from "react"

import { Breadcrumb } from "@/components/shared/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { AccountSidebar } from "@/features/account/components/account-sidebar"
import { OrdersList } from "@/features/account/components/orders-list"
import { OrdersSignedOut } from "@/features/account/components/orders-signed-out"
import { getPreviewOrders, previewCustomer } from "@/features/account/preview"
import { accountLoginAvailable, getCustomer, getOrders, isPreviewMode } from "@/features/account/session.server"

export const metadata: Metadata = {
  title: "My orders",
  robots: { index: false },
}

type Props = PageProps<"/account/orders">

async function OrdersContent({ searchParams }: Props) {
  const real = await getCustomer()
  const preview = !real && isPreviewMode((await searchParams).preview)
  const customer = real ?? (preview ? previewCustomer : null)

  if (!customer) return <OrdersSignedOut loginAvailable={accountLoginAvailable} />

  const orders = preview ? getPreviewOrders() : await getOrders()
  const onTheWay = orders.filter((o) => o.kind === "processing" || o.kind === "transit").length

  return (
    <>
      {preview && (
        <p role="note" className="mb-4 rounded-xl bg-terra-soft px-4 py-2.5 text-[0.8125rem] font-medium text-terra-text">
          Sample orders (development only). Real orders appear once customer login is connected.{" "}
          <a href="?preview=0" className="font-bold underline">
            See the logged-out page
          </a>
        </p>
      )}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <AccountSidebar customer={customer} current="/account/orders" stats={{ orders: orders.length, onTheWay }} />
        <OrdersList orders={orders} />
      </div>
    </>
  )
}

function OrdersSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <Skeleton className="hidden h-80 rounded-[18px] lg:block" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-56 rounded-[18px]" />
        <Skeleton className="h-56 rounded-[18px]" />
      </div>
    </div>
  )
}

/** /account/orders: the shopper's orders, or a log-in prompt with a guest tracking option. */
export default function OrdersPage(props: Props) {
  return (
    <section aria-labelledby="orders-h" className="container-shop pt-6 pb-16 md:pt-7">
      <Breadcrumb
        className="mb-4"
        items={[{ label: "Home", href: "/" }, { label: "My account", href: "/account" }, { label: "My orders" }]}
      />
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent {...props} />
      </Suspense>
    </section>
  )
}
