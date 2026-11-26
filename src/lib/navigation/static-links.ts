import type { CategoryIcon, NavLink } from "./types"

/** First item of the category bar: the homepage. */
export const forYouLink: NavLink & { icon: CategoryIcon } = { label: "For You", href: "/", icon: "for-you" }

/** Last items of the category bar (pages of this site, not Shopify collections). */
export const utilityLinks: (NavLink & { icon: CategoryIcon })[] = [
  { label: "Track order", href: "/track", icon: "track" },
  { label: "Help", href: "/help", icon: "help" },
]
