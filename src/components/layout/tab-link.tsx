import Link from "next/link"
import { ChevronDownIcon } from "lucide-react"

import type { CategoryIcon } from "@/lib/navigation"
import { cn } from "@/lib/utils"

import { categoryIcons } from "./category-icons"

export type TabLinkProps = {
  label: string
  href: string
  icon: CategoryIcon
  /** Seasonal focus (e.g. Gifts): terracotta icon. */
  highlight?: boolean
  /** Utility link (Track order, Help): grey label so departments stand out. */
  muted?: boolean
  /** Shows the ▾ for the category dropdown (desktop, product-list pages). */
  hasMenu?: boolean
  active?: boolean
  /** Display class: "flex", or "hidden listing-page:flex" etc. */
  display?: string
}

/** One icon + label item of the category bar (presentational, no hooks). */
export function TabLink({ label, href, icon, highlight, muted, hasMenu, active, display = "flex" }: TabLinkProps) {
  const Icon = categoryIcons[icon]
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-haspopup={hasMenu ? "true" : undefined}
      className={cn(
        display,
        "group/tab relative h-[4.75rem] min-w-[68px] flex-col items-center justify-center gap-1 px-2 text-[0.8125rem] whitespace-nowrap transition-[height,color] duration-200 header-compact:h-11 header-compact:gap-0 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset lg:min-w-0 lg:px-3",
        // Underline on the bottom edge of the bar.
        "after:absolute after:inset-x-2 after:bottom-0 after:h-[0.1875rem] after:origin-center after:scale-x-0 after:rounded-t-full after:bg-teal after:transition-transform after:duration-200",
        active
          ? "font-bold text-ink after:scale-x-100"
          : cn(
              "hover:text-teal group-hover/mi:text-teal lg:hover:after:scale-x-100 lg:group-hover/mi:after:scale-x-100",
              muted ? "font-medium text-slate" : "font-bold text-ink"
            )
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid h-10 w-10 place-items-center overflow-hidden rounded-xl transition-[height,opacity,background-color] duration-200 header-compact:h-0 header-compact:opacity-0",
          active ? "bg-teal-soft text-teal" : highlight ? "bg-terra-soft text-terra-text" : "text-ink group-hover/tab:bg-sand"
        )}
      >
        <Icon className="size-[22px]" strokeWidth={1.8} />
      </span>
      <span className="flex max-w-[96px] items-center gap-0.5">
        <span className="truncate">{label}</span>
        {hasMenu && (
          <ChevronDownIcon
            aria-hidden="true"
            className="hidden size-3.5 opacity-60 transition-transform group-hover/mi:rotate-180 lg:block"
          />
        )}
      </span>
    </Link>
  )
}

export type CategoryTabProps = Omit<TabLinkProps, "active" | "display" | "hasMenu"> & {
  /** Where the item goes on product-list pages (e.g. /beauty/all), with a ▾ dropdown. */
  listingHref?: string
  /** Department tabs: collection handles that count as "inside" it (for /collections/{handle}). */
  handles?: string[]
}

/** Two links when needed: landing page normally, product list on list pages (switched by CSS). */
export function TabLinks({ listingHref, active, handles, ...tab }: CategoryTabProps & { active: boolean }) {
  void handles // only ActiveTabs needs it, to work out `active`
  if (!listingHref) return <TabLink {...tab} active={active} />
  return (
    <>
      <TabLink {...tab} active={active} display="flex listing-page:hidden" />
      <TabLink {...tab} href={listingHref} active={active} hasMenu display="hidden listing-page:flex" />
    </>
  )
}
