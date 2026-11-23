import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { Breadcrumb } from "@/components/shared/breadcrumb"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderDetails } from "@/features/account/components/order-details"
import { getPreviewOrders } from "@/features/account/preview"
import { getCustomer, getOrder, isPreviewMode } from "@/features/account/session.server"

export const metadata: Metadata = { title: "Order details", robots: { index: false } }

type Props = PageProps<"/account/orders/[id]">

async function OrderContent({ params }: Pick<Props, "params">) {
  const { id } = await params
  const customer = await getCustomer()

  if (!customer && !isPreviewMode(undefined)) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-[1.625rem] leading-tight">Log in to see this order</h1>
        <p className="text-[0.9375rem] text-slate">Or track it as a guest with your order number and email.</p>
        <div className="flex gap-2.5">
          <Button asChild size="lg">
            <Link href="/account/login" prefetch={false}>
              Log in
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-[1.5px] border-ink bg-transparent">
            <Link href="/track">Track an order</Link>
          </Button>
        </div>
      </div>
    )
  }

  const order = customer ? await getOrder(id) : (getPreviewOrders().find((o) => o.id === id) ?? null)
  if (!order) notFound()

  return (
    <>
      <Breadcrumb
        className="mb-4"
        items={[
          { label: "Home", href: "/" },
          { label: "My account", href: "/account" },
          { label: "My orders", href: "/account/orders" },
          { label: `Order ${order.name}` },
        ]}
      />
      {!customer && (
        <p role="note" className="mb-4 rounded-xl bg-terra-soft px-4 py-2.5 text-[0.8125rem] font-medium text-terra-text">
          Sample order (development only).
        </p>
      )}
      <OrderDetails order={order} />
    </>
  )
}

/** /account/orders/[id]: one order with items, shipment updates, damage report and prices. */
export default function OrderPage({ params }: Props) {
  return (
    <section aria-labelledby="od-h" className="container-shop pt-6 pb-16">
      <Suspense
        fallback={
          <div aria-hidden="true" className="flex flex-col gap-4">
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-9 w-56" />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <Skeleton className="h-96 rounded-[18px]" />
              <Skeleton className="h-80 rounded-[18px]" />
            </div>
          </div>
        }
      >
        <OrderContent params={params} />
      </Suspense>
    </section>
  )
}
