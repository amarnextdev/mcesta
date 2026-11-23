"use client"

import { useCallback, useSyncExternalStore } from "react"

/**
 * A small list kept in this browser's localStorage, shared live between components and tabs.
 * Used for "Saved for later" and "Recently viewed" until shopper accounts exist.
 */
export function createLocalList<T>(key: string, { max, id }: { max: number; id: (item: T) => string }) {
  const event = `local-list:${key}`
  const empty: T[] = []
  let cache: { raw: string | null; items: T[] } = { raw: null, items: empty }

  function read(): T[] {
    let raw: string | null
    try {
      raw = window.localStorage.getItem(key)
    } catch {
      return empty
    }
    if (raw === cache.raw) return cache.items
    let items = empty
    try {
      const parsed = raw ? (JSON.parse(raw) as unknown) : []
      items = Array.isArray(parsed) ? (parsed as T[]) : empty
    } catch {
      items = empty
    }
    cache = { raw, items }
    return items
  }

  function write(items: T[]) {
    try {
      window.localStorage.setItem(key, JSON.stringify(items.slice(0, max)))
    } catch {
      // Storage full or blocked (private mode): these lists are a nice-to-have.
    }
    window.dispatchEvent(new Event(event))
  }

  function subscribe(onChange: () => void) {
    const onStorage = (e: StorageEvent) => e.key === key && onChange()
    window.addEventListener(event, onChange)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener(event, onChange)
      window.removeEventListener("storage", onStorage)
    }
  }

  /** Newest first; adding an item that's already there moves it to the front. */
  const add = (item: T) => write([item, ...read().filter((i) => id(i) !== id(item))])
  const remove = (itemId: string) => write(read().filter((i) => id(i) !== itemId))
  const clear = () => write([])

  return function useLocalList() {
    const items = useSyncExternalStore(subscribe, read, () => empty)
    return {
      items,
      add: useCallback(add, []),
      remove: useCallback(remove, []),
      clear: useCallback(clear, []),
    }
  }
}
