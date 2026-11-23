"use client"

import { useEffect } from "react"

import type { ProductCard } from "@/lib/shopify/types"

import { useRecentlyViewed } from "../recently-viewed"

/** Remembers that this product was viewed (renders nothing). */
export function RecordView({ product }: { product: ProductCard }) {
  const { add } = useRecentlyViewed()
  useEffect(() => {
    add(product)
  }, [add, product])
  return null
}
