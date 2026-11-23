"use client"

import { useSyncExternalStore } from "react"

/** Open/closed state of the cart drawer, shared by the header icon, add-to-cart and the drawer. */
let open = false
const listeners = new Set<() => void>()

function set(next: boolean) {
  if (open === next) return
  open = next
  listeners.forEach((l) => l())
}

export const cartDrawer = {
  open: () => set(true),
  close: () => set(false),
  setOpen: set,
}

export function useCartDrawerOpen() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => open,
    () => false
  )
}
