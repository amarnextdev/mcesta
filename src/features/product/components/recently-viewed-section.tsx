"use client"

import { SectionHeader } from "@/components/shared/section-header"

import { useRecentlyViewed } from "../recently-viewed"
import { ProductGrid } from "./product-grid"

/** "Recently viewed" shelf with "Clear history". Hidden until the shopper has viewed something. */
export function RecentlyViewedSection({ exclude = [], className }: { exclude?: string[]; className?: string }) {
  const { items, clear } = useRecentlyViewed()
  const products = items.filter((p) => !exclude.includes(p.handle))
  if (products.length === 0) return null

  return (
    <section aria-labelledby="recent-h" className={className}>
      <div className="container-shop">
        <SectionHeader id="recent-h" title="Recently viewed">
          <button
            type="button"
            onClick={clear}
            className="h-9 px-1 text-sm font-semibold text-slate underline-offset-2 hover:text-ink hover:underline"
          >
            Clear history
          </button>
        </SectionHeader>
        <ProductGrid products={products.slice(0, 10)} layout="shelf" />
      </div>
    </section>
  )
}
