"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"

import { createLocalList } from "@/lib/local-list"
import type { Money } from "@/lib/shopify/types"

import { savedForLaterAction } from "./actions"

/** "Saved for later": a copy of the item so it shows instantly; live price and stock load on top. */
export type SavedItem = {
  variantId: string
  handle: string
  title: string
  variantTitle: string
  imageUrl: string | null
  price: Money
}

export type SavedItemLive = SavedItem & { available: boolean }

const useSavedList = createLocalList<SavedItem>("mcesta:saved-for-later", { max: 50, id: (i) => i.variantId })

/** Save / remove only (cart rows). */
export function useSavedForLater() {
  const { items, add, remove } = useSavedList()
  return { items, save: add, remove }
}

/**
 * Saved items with live price (shopper's currency) and stock from Shopify.
 * Items Shopify no longer has (deleted products, old test data) are dropped from the list.
 */
export function useSavedForLaterLive() {
  const { items, remove } = useSavedList()
  const ids = useMemo(() => items.map((i) => i.variantId), [items])

  const live = useQuery({
    queryKey: ["saved-for-later", ids],
    queryFn: () => savedForLaterAction(ids),
    enabled: ids.length > 0,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!live.data) return
    const found = new Set(live.data.items.map((i) => i.variantId))
    for (const id of live.data.requested) if (!found.has(id)) remove(id)
  }, [live.data, remove])

  const merged = useMemo<SavedItemLive[]>(() => {
    const byId = new Map(live.data?.items.map((i) => [i.variantId, i]))
    return items.map((item) => byId.get(item.variantId) ?? { ...item, available: true })
  }, [items, live.data])

  return { items: merged, loading: live.isPending && ids.length > 0, remove }
}
