import Link from "next/link"
import { UserIcon } from "lucide-react"

import { CartLink } from "@/features/cart/components/cart-link"
import { WishlistLink } from "@/features/wishlist/components/wishlist-link"

const iconLink =
  "relative grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-sand focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"

/** Account, wishlist and cart icons. */
export function HeaderActions() {
  return (
    <div className="flex items-center gap-1">
      <Link href="/account" aria-label="Account: log in or view your orders" className={iconLink}>
        <UserIcon className="size-[22px]" strokeWidth={1.8} />
      </Link>
      <WishlistLink className={`${iconLink} hidden sm:grid`} />
      <CartLink className={iconLink} />
    </div>
  )
}
