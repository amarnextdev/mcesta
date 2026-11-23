"use client"

import { usePathname } from "next/navigation"

import { getDepartment, menuHrefForCollection } from "@/lib/config/navigation"

import { TabLinks, type CategoryTabProps } from "./tab-link"

/**
 * Which bar item a URL belongs to: "/" → For You, /{department}/… → that department,
 * /collections/{handle} → its department if the collection is in the menu, else the page itself.
 */
function activeHrefFor(pathname: string) {
  if (pathname === "/") return "/"
  const [first, second] = pathname.split("/").filter(Boolean)
  if (first && getDepartment(first)) return `/${first}`
  if (first === "collections" && second) {
    const href = menuHrefForCollection(decodeURIComponent(second))
    if (href) return `/${href.split("/")[1]}`
  }
  return pathname
}

/** Category bar item with its active state (reads the URL). */
export function ActiveTabs(props: CategoryTabProps) {
  return <TabLinks {...props} active={activeHrefFor(usePathname()) === props.href} />
}
