"use client"

import { useMemo, useState } from "react"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import type { Order, OrderKind } from "../types"
import { OrderCard } from "./order-card"

const filters: { value: "all" | "transit" | "delivered" | "cancelled"; label: string; kinds: OrderKind[] }[] = [
  { value: "all", label: "All orders", kinds: ["processing", "transit", "delivered", "cancelled"] },
  { value: "transit", label: "On the way", kinds: ["processing", "transit"] },
  { value: "delivered", label: "Delivered", kinds: ["delivered"] },
  { value: "cancelled", label: "Cancelled", kinds: ["cancelled"] },
]

/** Heading, search box, filter chips and the order cards. */
export function OrdersList({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all")
  const [q, setQ] = useState("")

  const shown = useMemo(() => {
    const kinds = filters.find((f) => f.value === filter)!.kinds
    const query = q.trim().toLowerCase()
    return orders.filter(
      (o) =>
        kinds.includes(o.kind) &&
        (!query || o.name.toLowerCase().includes(query) || o.lines.some((l) => l.title.toLowerCase().includes(query)))
    )
  }, [orders, filter, q])

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 id="orders-h" className="text-[1.5rem] leading-tight md:text-[1.75rem]">
          My orders
        </h1>
        <label className="flex h-11 w-80 max-w-full items-center gap-2.5 rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 focus-within:border-teal focus-within:ring-3 focus-within:ring-ring/40">
          <span className="sr-only">Search your orders</span>
          <SearchIcon aria-hidden="true" className="size-[18px] text-slate" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by product or order number"
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
      </div>

      <div role="group" aria-label="Filter orders" className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const on = f.value === filter
          const count = orders.filter((o) => f.kinds.includes(o.kind)).length
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(f.value)}
              className={cn(
                "h-9 rounded-full border-[1.5px] px-3.5 text-sm font-semibold transition-colors",
                on ? "border-ink bg-ink text-cream" : "border-line bg-white text-ink hover:border-ink"
              )}
            >
              {f.label}
              <span className={cn("ml-1 font-medium", on ? "text-cream/70" : "text-slate")}>{count}</span>
            </button>
          )
        })}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-white p-10 text-center text-[0.9375rem] text-slate">
          {orders.length === 0 ? "You haven't placed any orders yet." : "No orders match. Try another filter or search."}
        </div>
      ) : (
        shown.map((order) => <OrderCard key={order.id} order={order} />)
      )}
    </div>
  )
}
