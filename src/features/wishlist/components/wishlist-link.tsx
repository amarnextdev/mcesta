"use client"

import Link from "next/link"
import { HeartIcon } from "lucide-react"

import { useWishlist } from "../store"

/** Header heart with the number of saved items. */
export function WishlistLink({ className }: { className?: string }) {
  const { items } = useWishlist()
  const count = items.length

  return (
    <Link href="/account/wishlist" aria-label={`Wishlist, ${count} ${count === 1 ? "item" : "items"}`} className={className}>
      <HeartIcon className="size-[22px]" strokeWidth={1.8} />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-0.5 h-[1.125rem] min-w-[18px] rounded-full bg-terra px-1 text-center text-[0.6875rem] leading-[1.125rem] font-bold text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}
