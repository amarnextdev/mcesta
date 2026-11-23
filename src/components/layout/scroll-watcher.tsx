"use client"

import { useEffect } from "react"

/** Scroll past this to shrink the header (icons hide). */
const COMPACT_AT = 120
/** Scroll back above this to show the icons again. The gap stops flicker while the header resizes. */
const EXPAND_AT = 16

/**
 * Sets `data-scrolled` on <html> once the page is scrolled down, so CSS (the `header-compact:`
 * variant) can hide the category icons. Renders nothing.
 */
export function ScrollWatcher() {
  useEffect(() => {
    const root = document.documentElement
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      if (y > COMPACT_AT) root.setAttribute("data-scrolled", "")
      else if (y < EXPAND_AT) root.removeAttribute("data-scrolled")
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) cancelAnimationFrame(frame)
      root.removeAttribute("data-scrolled")
    }
  }, [])

  return null
}
