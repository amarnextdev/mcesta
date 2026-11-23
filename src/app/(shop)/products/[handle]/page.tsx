import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { Breadcrumb, type Crumb } from "@/components/shared/breadcrumb"
import { ProductGridSkeleton } from "@/components/skeletons/product-card-skeleton"
import { getProduct } from "@/features/product/detail.server"
import { ProductSkeleton } from "@/features/product/components/detail/product-skeleton"
import { ProductView } from "@/features/product/components/detail/product-view"
import { ProductFaq } from "@/features/product/components/detail/product-faq"
import { ReviewsSection } from "@/features/product/components/detail/reviews-section"
import { ProductRecommendations } from "@/features/product/components/detail/product-recommendations"
import { RecordView } from "@/features/product/components/record-view"
import { RecentlyViewedSection } from "@/features/product/components/recently-viewed-section"
import { defaultVariant, productToCard } from "@/features/product/variants"
import { storeFaq } from "@/lib/config/faq"
import { siteConfig } from "@/lib/config/site"
import { categoryHref, departmentAllHref, menuPlaceOfCollection } from "@/lib/config/navigation"
import type { ProductDetail } from "@/lib/shopify/types"

type Props = PageProps<"/products/[handle]">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).handle)
  if (!product) return { title: "Product not found", robots: { index: false } }
  const image = product.images[0]
  return {
    title: product.seoTitle,
    description: product.seoDescription,
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: {
      title: product.seoTitle,
      description: product.seoDescription,
      url: `/products/${product.handle}`,
      images: image ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt }] : undefined,
    },
  }
}

/** Breadcrumb from the first of the product's collections that sits in the menu. */
function placeOf(product: ProductDetail) {
  for (const c of product.collections) {
    const place = menuPlaceOfCollection(c.handle)
    if (place) return place
  }
  return null
}

/** Product structured data so search engines can show price and stock. */
function ProductJsonLd({ product }: { product: ProductDetail }) {
  const variant = defaultVariant(product)
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((i) => i.url),
    brand: product.vendor ? { "@type": "Brand", name: product.vendor } : undefined,
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      price: v.price.amount.toFixed(2),
      priceCurrency: v.price.currencyCode,
      availability: v.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/products/${product.handle}`,
      ...(v.id === variant?.id ? {} : { name: v.title }),
    })),
  }
  return (
    <script
      type="application/ld+json"
      // JSON from our own data; "<" escaped so text can't close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}

async function ProductContent({ params }: Pick<Props, "params">) {
  const product = await getProduct((await params).handle)
  if (!product) notFound()

  const place = placeOf(product)
  const crumbs: Crumb[] = [{ label: "Home", href: "/" }]
  let category: { label: string; href: string } | null = null
  if (place) {
    crumbs.push({ label: place.department.label, href: departmentAllHref(place.department) })
    if (place.category) {
      category = { label: place.category.label, href: categoryHref(place.department, place.category) }
      crumbs.push(category)
    } else {
      category = { label: place.department.label, href: departmentAllHref(place.department) }
    }
  }
  crumbs.push({ label: product.title })
  const card = productToCard(product)

  return (
    <>
      <ProductJsonLd product={product} />
      {card && <RecordView product={card} />}
      <div className="container-shop flex flex-col gap-4 pt-4 pb-14">
        <Breadcrumb items={crumbs} />
        <ProductView product={product} category={category} />
      </div>
      <Suspense
        fallback={
          <div className="container-shop pb-16">
            <ProductGridSkeleton layout="shelf" count={5} />
          </div>
        }
      >
        <ProductRecommendations
          product={product}
          seeAll={category ? { label: `See all ${category.label}`, href: category.href } : undefined}
        />
      </Suspense>
      <ReviewsSection productId={product.id} productTitle={product.title} rating={product.rating} />
      <ProductFaq productId={product.id} items={[...product.faq, ...storeFaq]} />
      <RecentlyViewedSection exclude={[product.handle]} className="pb-16" />
    </>
  )
}

/** /products/{handle}: one URL per product, whatever category it's in. */
export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  )
}
