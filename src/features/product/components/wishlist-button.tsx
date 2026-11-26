"use client"

import { HeartIcon } from "lucide-react"
import { toast } from "sonner"

import { useWishlist } from "@/features/wishlist/store"
import type { ProductCard } from "@/lib/shopify/types"
import { cn } from "@/lib/utils"

/** Heart toggle on product cards and the product page. Saves to the wishlist (Supabase). */
export function WishlistButton({ product, className }: { product: ProductCard; className?: string }) {
  const { items, add, remove } = useWishlist()
  const saved = items.some((i) => i.handle === product.handle)

  function toggle() {
    // The heart flips straight away; the toast waits for the server, so "Saved" is never a lie.
    if (saved) {
      remove(product.handle, () => toast(`Removed from wishlist`, { description: product.title }))
    } else {
      add({ ...product, savedAt: new Date().toISOString(), savedPrice: product.price }, () =>
        toast.success("Saved to wishlist", {
          description: product.title,
          action: { label: "View", onClick: () => window.location.assign("/account/wishlist") },
        })
      )
    }
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
      onClick={toggle}
      className={cn(
        "grid size-9 place-items-center rounded-full bg-white shadow-[0_1px_4px_rgba(31,42,46,0.12)] transition-colors hover:text-terra focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        saved ? "text-terra" : "text-ink",
        className
      )}
    >
      <HeartIcon className={cn("size-[18px] transition-transform", saved && "scale-110 fill-terra")} strokeWidth={1.8} />
    </button>
  )
}
