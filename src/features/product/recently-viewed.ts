"use client"

import { createLocalList } from "@/lib/local-list"
import type { ProductCard } from "@/lib/shopify/types"

/** Products this shopper opened, newest first (this browser only). */
export const useRecentlyViewed = createLocalList<ProductCard>("mcesta:recently-viewed", { max: 12, id: (p) => p.handle })
