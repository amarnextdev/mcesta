import { listLayouts, type ListLayout } from "@/lib/layout"
import type { ProductCard as ProductCardData } from "@/lib/shopify/types"
import { cn } from "@/lib/utils"

import { ProductCard } from "./product-card"

type ProductGridProps = {
  products: ProductCardData[]
  layout?: ListLayout
  /** How many leading cards get their image preloaded (above the fold). */
  preloadCount?: number
  className?: string
}

const sizesByLayout: Record<ListLayout, string | undefined> = {
  grid: undefined,
  collection: "(min-width: 1440px) 300px, (min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw",
  shelf: "(min-width: 1440px) 280px, (min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 72vw",
}

/** Product list in a grid (all items) or a single-row shelf. */
export function ProductGrid({ products, layout = "grid", preloadCount = 0, className }: ProductGridProps) {
  return (
    <ul className={cn(listLayouts[layout], className)}>
      {products.map((product, i) => (
        <li key={product.id} className="flex snap-start">
          <ProductCard
            product={product}
            preload={i < preloadCount}
            sizes={sizesByLayout[layout]}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  )
}
