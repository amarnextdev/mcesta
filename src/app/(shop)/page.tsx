import { PageType } from "@/components/layout/page-type"
import { BundleSpotlight } from "@/features/home/components/bundle-spotlight"
import { FeaturedCollections } from "@/features/home/components/featured-collections"
import { FindsByFinn } from "@/features/home/components/finds-by-finn"
import { HeroCarousel } from "@/features/home/components/hero-carousel"
import { HeroSideCards } from "@/features/home/components/hero-side-cards"
import { NewsletterSection } from "@/features/home/components/newsletter-section"
import { StorePromises } from "@/features/home/components/store-promises"
import {
  bundleSpotlight,
  featuredTiles,
  finn,
  heroSlides,
  homeShelves,
  newsletter,
  promises,
} from "@/features/home/data"
import { ProductShelf } from "@/features/product/components/product-shelf"

/** Homepage. Section order follows the design (Main.dc.html). */
export default function HomePage() {
  return (
    <div className="flex flex-col pb-16">
      <PageType type="browse" />
      <div className="container-shop pt-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2.25fr)_minmax(0,1fr)]">
          <HeroCarousel slides={heroSlides} />
          <HeroSideCards />
        </div>
      </div>
      <ProductShelf config={homeShelves.topPicks} className="pt-12" />
      <FeaturedCollections tiles={featuredTiles} className="pt-8" />
      <ProductShelf config={homeShelves.deals} className="pt-14" />
      <BundleSpotlight bundle={bundleSpotlight} className="pt-14" />
      <ProductShelf config={homeShelves.newIn} className="pt-16" />
      <FindsByFinn name={finn.name} intro={finn.intro} reels={finn.reels} className="pt-16" />
      <StorePromises promises={promises} className="pt-16" />
      <NewsletterSection content={newsletter} className="pt-16" />
    </div>
  )
}
