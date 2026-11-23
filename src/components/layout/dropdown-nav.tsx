"use client"

import { useRef, useState, type ReactNode } from "react"

/**
 * Category bar wrapper that closes the hover dropdowns after a link is clicked.
 * Dropdowns open on :hover / :focus-within, which stay true after a client-side navigation,
 * so we blur the link and mark the nav `data-closed` until the pointer moves to another
 * item or leaves the bar.
 */
export function DropdownNav({ children, className }: { children: ReactNode; className?: string }) {
  const [closed, setClosed] = useState(false)
  const closedItem = useRef<Element | null>(null)

  return (
    <nav
      aria-label="Categories"
      data-closed={closed ? "" : undefined}
      className={className}
      onClick={(event) => {
        const target = event.target as Element
        if (!target.closest("a[href]")) return
        closedItem.current = target.closest("[data-menu-item]")
        setClosed(true)
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
      }}
      onPointerOver={(event) => {
        if (!closed) return
        const item = (event.target as Element).closest("[data-menu-item]")
        if (item && item !== closedItem.current) setClosed(false)
      }}
      onPointerLeave={() => closed && setClosed(false)}
      onFocus={() => closed && setClosed(false)}
    >
      {children}
    </nav>
  )
}
