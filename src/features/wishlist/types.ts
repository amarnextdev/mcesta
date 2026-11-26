import type { Money, ProductCard } from "@/lib/shopify/types"

/** A saved product: the live card plus when it was saved and its price then ("Price dropped"). */
export type WishItem = ProductCard & { savedAt: string; savedPrice: Money }
