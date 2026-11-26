import { SectionHeader } from "@/components/shared/section-header"
import { ProductGrid } from "@/features/product/components/product-grid"
import type { ProductDetail } from "@/lib/shopify/types"

import { getBoughtTogether, getRecommendations } from "../../detail.server"
import { productToCard } from "../../variants"
import { BoughtTogether } from "./bought-together"

/**
 * Below the buy box: "Frequently bought together" then "Similar products".
 * Loaded together so the same product never shows up in both.
 */
export async function ProductRecommendations({
  product,
  country,
  seeAll,
}: {
  product: ProductDetail
  country: string
  seeAll?: { label: string; href: string }
}) {
  const [together, related] = await Promise.all([
    getBoughtTogether(product.id, country),
    getRecommendations(product.id, country),
  ])
  const self = productToCard(product)
  const togetherIds = new Set(together.map((p) => p.id))
  const similar = related.filter((p) => !togetherIds.has(p.id)).slice(0, 5)

  return (
    <>
      {self && self.available && together.length > 0 && <BoughtTogether items={[self, ...together]} />}
      {similar.length > 0 && (
        <section aria-labelledby="related-h" className="container-shop pb-16">
          <SectionHeader id="related-h" title="Similar products" action={seeAll} />
          <ProductGrid products={similar} layout="shelf" />
        </section>
      )}
    </>
  )
}
