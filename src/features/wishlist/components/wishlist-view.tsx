"use client"

import Link from "next/link"
import { useMemo, useState, useSyncExternalStore } from "react"
import { useQuery } from "@tanstack/react-query"
import { HeartIcon, ShoppingBagIcon, TrendingDownIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAddToCart } from "@/features/cart/hooks"
import { ProductCard } from "@/features/product/components/product-card"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

import { refreshWishlistAction } from "../actions"
import { useWishlist, type WishItem } from "../store"

type Filter = "all" | "drops" | "sale" | "soldout"
type Sort = "recent" | "price-asc" | "price-desc"

const sorts: { value: Sort; label: string }[] = [
  { value: "recent", label: "Recently saved" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
]

/** Fixed time zone so server and browser agree (the list itself only renders in the browser). */
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" })

/** Wishlist page body (design: Wishlist.dc.html). Live prices are refreshed from Shopify. */
export function WishlistView() {
  const { items: saved, add, remove } = useWishlist()
  const addToCart = useAddToCart()
  const [filter, setFilter] = useState<Filter>("all")
  const [sort, setSort] = useState<Sort>("recent")

  // Current price and stock for everything saved (cached a few minutes on the server).
  const ids = saved.map((i) => i.id)
  const { data: fresh } = useQuery({
    queryKey: ["wishlist-fresh", [...ids].sort()],
    queryFn: () => refreshWishlistAction(ids),
    enabled: ids.length > 0,
    staleTime: 5 * 60_000,
  })

  const items = useMemo(
    () =>
      saved.map((item) => {
        const live = fresh?.[item.id]
        const current: WishItem = live ? { ...item, ...live, savedAt: item.savedAt, savedPrice: item.savedPrice } : item
        const drop = item.savedPrice.amount - current.price.amount
        return { item: current, drop: drop > 0.005 ? drop : 0, gone: Boolean(fresh) && !live }
      }),
    [saved, fresh]
  )

  const counts = {
    all: items.length,
    drops: items.filter((i) => i.drop > 0).length,
    sale: items.filter((i) => i.item.compareAtPrice).length,
    soldout: items.filter((i) => !i.item.available || i.gone).length,
  }
  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "drops", label: "Price drops" },
    { value: "sale", label: "On sale" },
    { value: "soldout", label: "Sold out" },
  ]

  const shown = items
    .filter(({ item, drop, gone }) =>
      filter === "drops" ? drop > 0 : filter === "sale" ? item.compareAtPrice : filter === "soldout" ? !item.available || gone : true
    )
    .sort((a, b) =>
      sort === "price-asc"
        ? a.item.price.amount - b.item.price.amount
        : sort === "price-desc"
          ? b.item.price.amount - a.item.price.amount
          : b.item.savedAt.localeCompare(a.item.savedAt)
    )

  const ready = items.filter(({ item, gone }) => item.available && !gone && !item.hasOptions && item.variantId)
  const needsOptions = items.filter(({ item, gone }) => item.available && !gone && item.hasOptions).length

  function removeWithUndo(item: WishItem) {
    remove(item.handle)
    toast("Removed from wishlist", { description: item.title, action: { label: "Undo", onClick: () => add(item) } })
  }

  // The wishlist lives in this browser: show a placeholder until it has been read.
  const inBrowser = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  if (!inBrowser) {
    return (
      <div aria-hidden="true" className="flex flex-col gap-4">
        <Skeleton className="h-9 w-40" />
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (saved.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[18px] border-2 border-dashed border-teal-line bg-teal-tint px-6 py-14 text-center">
        <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-white text-terra">
          <HeartIcon className="size-7" />
        </span>
        <p className="font-heading text-[1.375rem]">Your wishlist is empty</p>
        <p className="max-w-[420px] text-[0.9375rem] leading-relaxed text-slate">
          Tap the heart on any product to save it here. We&apos;ll show you when a saved item drops in price.
        </p>
        <Button asChild size="lg" className="mt-1.5 h-[2.875rem] px-[22px]">
          <Link href="/">Start shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-[18px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 id="wish-h" className="text-[1.5rem] leading-tight md:text-[1.75rem]">
            Wishlist
          </h1>
          <span className="text-[0.9375rem] text-slate">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </span>
        </div>
        {ready.length > 0 && (
          <Button
            size="lg"
            disabled={addToCart.isPending}
            onClick={() =>
              addToCart.mutate(ready.map(({ item }) => ({ merchandiseId: item.variantId!, quantity: 1, title: item.title })))
            }
            className="h-11"
          >
            <ShoppingBagIcon data-icon="inline-start" className="size-[18px]" />
            {addToCart.isPending ? "Adding…" : `Add ${ready.length === 1 ? "it" : `all ${ready.length}`} to cart`}
          </Button>
        )}
      </div>
      {needsOptions > 0 && ready.length > 0 && (
        <p className="-mt-2 text-[0.8125rem] text-slate">
          {needsOptions} {needsOptions === 1 ? "item needs" : "items need"} a size or colour first: use its Add to cart button.
        </p>
      )}

      {counts.drops > 0 && (
        <div className="flex flex-wrap items-center gap-3.5 rounded-2xl bg-teal-soft px-[18px] py-3.5">
          <span aria-hidden="true" className="grid size-10 flex-none place-items-center rounded-xl bg-teal text-cream">
            <TrendingDownIcon className="size-5" />
          </span>
          <span className="flex-1 text-sm leading-snug">
            <span className="font-bold">
              {counts.drops} {counts.drops === 1 ? "price drop" : "price drops"}!
            </span>{" "}
            {counts.drops === 1 ? "This item is" : "These items are"} cheaper than when you saved {counts.drops === 1 ? "it" : "them"}.
          </span>
          {filter !== "drops" && (
            <button type="button" onClick={() => setFilter("drops")} className="text-sm font-bold text-teal hover:underline">
              View price drops →
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filter wishlist" className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const on = f.value === filter
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
                <span className={cn("ml-1 font-medium", on ? "text-cream/70" : "text-slate")}>{counts[f.value]}</span>
              </button>
            )
          })}
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-[10px] px-2.5 text-sm text-slate hover:bg-sand data-[state=open]:bg-sand">
            Sort by: <span className="font-bold text-ink">{sorts.find((s) => s.value === sort)?.label}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto min-w-[210px] rounded-xl border border-line bg-white p-1.5 ring-0">
            <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as Sort)}>
              {sorts.map((s) => (
                <DropdownMenuRadioItem key={s.value} value={s.value} className="h-10 rounded-lg px-3 text-sm">
                  {s.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-line-strong p-9 text-center text-[0.9375rem] text-slate">
          Nothing here for this filter.{" "}
          <button type="button" onClick={() => setFilter("all")} className="font-bold text-teal hover:underline">
            Show all saved items
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-3">
          {shown.map(({ item, drop, gone }) => (
            <li key={item.handle} className="flex">
              <ProductCard
                product={gone ? { ...item, available: false } : item}
                sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
                className="w-full"
                extra={
                  <div className="flex flex-col gap-1">
                    {drop > 0 && (
                      <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success">
                        <TrendingDownIcon aria-hidden="true" className="size-3.5" />
                        {formatMoney({ amount: drop, currencyCode: item.price.currencyCode })} less than when saved
                      </span>
                    )}
                    {gone && <span className="text-xs font-semibold text-terra-text">No longer available</span>}
                    <span className="flex items-center justify-between gap-2 text-xs text-slate">
                      Saved {fmtDate(item.savedAt)}
                      <button type="button" onClick={() => removeWithUndo(item)} className="font-semibold underline-offset-2 hover:text-ink hover:underline">
                        Remove
                      </button>
                    </span>
                  </div>
                }
              />
            </li>
          ))}
        </ul>
      )}

      <p className="text-[0.8125rem] text-slate">Prices and stock can change. Saved items aren&apos;t reserved until you check out.</p>
    </div>
  )
}
