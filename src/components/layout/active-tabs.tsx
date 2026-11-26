"use client"

import { usePathname } from "next/navigation"

import { TabLinks, type CategoryTabProps } from "./tab-link"

/**
 * Whether a bar item matches the URL: "/" → For You; /{department}/… or /collections/{handle}
 * of one of its collections → that department; other items → their own page.
 */
function isActive(pathname: string, { href, handles }: CategoryTabProps) {
  if (href === "/") return pathname === "/"
  const [first, second] = pathname.split("/").filter(Boolean)
  if (handles) {
    if (`/${first}` === href) return true
    return first === "collections" && !!second && handles.includes(decodeURIComponent(second))
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Category bar item with its active state (reads the URL). */
export function ActiveTabs(props: CategoryTabProps) {
  return <TabLinks {...props} active={isActive(usePathname(), props)} />
}
