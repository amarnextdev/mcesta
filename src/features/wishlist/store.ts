"use client"

import { createLocalList } from "@/lib/local-list"
import type { Money, ProductCard } from "@/lib/shopify/types"

/**
 * Wishlist. Kept in this browser for now (works for guests too); moves to the shopper's
 * account once customer login is connected. Stores the card plus the price when it was saved,
 * so the page can show "Price dropped" later.
 */
export type WishItem = ProductCard & { savedAt: string; savedPrice: Money }

export const useWishlist = createLocalList<WishItem>("mcesta:wishlist", { max: 100, id: (p) => p.handle })
