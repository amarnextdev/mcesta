import type { Metadata } from "next"

import { getCollectionPage } from "./api.server"
import { DEFAULT_SORT, DEFAULT_TAB } from "./config"

/**
 * Page metadata for a product-list page. Uses the Shopify collection's SEO fields when the
 * collection exists, otherwise the menu label. `canonical` is the page's own clean URL,
 * so sorted / filtered URLs (?sort=…) don't compete with it in search results.
 */
export async function collectionMetadata(
  handle: string,
  { canonical, fallbackTitle }: { canonical: string; fallbackTitle?: string }
): Promise<Metadata> {
  const data = await getCollectionPage({ handle, sort: DEFAULT_SORT, tab: DEFAULT_TAB, filters: [], page: 1 })

  if (!data) {
    if (!fallbackTitle) return { title: "Collection not found", robots: { index: false } }
    return { title: fallbackTitle, alternates: { canonical } }
  }

  const { collection } = data
  const title = fallbackTitle ?? collection.seoTitle
  const description = collection.seoDescription || undefined
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: collection.image ? [{ url: collection.image.url, alt: collection.image.alt }] : undefined,
    },
  }
}
