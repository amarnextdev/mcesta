"use client"

import { createLocalList } from "@/lib/local-list"
import type { Money } from "@/lib/shopify/types"

/** "Saved for later": just enough to show the item and add it back. */
export type SavedItem = {
  variantId: string
  handle: string
  title: string
  variantTitle: string
  imageUrl: string | null
  price: Money
}

const useSavedList = createLocalList<SavedItem>("mcesta:saved-for-later", { max: 50, id: (i) => i.variantId })

export function useSavedForLater() {
  const { items, add, remove } = useSavedList()
  return { items, save: add, remove }
}
