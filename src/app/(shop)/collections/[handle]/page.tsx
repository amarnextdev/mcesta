import type { Metadata } from "next"
import { permanentRedirect } from "next/navigation"
import { Suspense } from "react"

import { CollectionScreen } from "@/features/collection/components/collection-screen"
import { CollectionSkeleton } from "@/features/collection/components/collection-skeleton"
import { ALL_PRODUCTS_HANDLE } from "@/features/collection/config"
import { collectionMetadata } from "@/features/collection/metadata"
import { collectionHref, menuHrefForCollection } from "@/lib/navigation"
import { getDepartments } from "@/lib/navigation/navigation.server"

type Props = PageProps<"/collections/[handle]">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  return collectionMetadata(handle, { canonical: collectionHref(handle) })
}

async function CollectionContent({ params, searchParams }: Props) {
  const { handle } = await params
  const query = await searchParams

  // Menu collections live at their clean URL: /collections/smart-home → /electronics/smart-home.
  const menuHref = menuHrefForCollection(await getDepartments(), handle)
  if (menuHref) {
    const qs = new URLSearchParams(
      Object.entries(query).flatMap(([k, v]) => (Array.isArray(v) ? v.map((x) => [k, x]) : v ? [[k, v]] : []))
    ).toString()
    permanentRedirect(qs ? `${menuHref}?${qs}` : menuHref)
  }

  return (
    <CollectionScreen
      handle={handle}
      searchParams={query}
      parents={[
        { label: "Home", href: "/" },
        ...(handle === ALL_PRODUCTS_HANDLE ? [] : [{ label: "Collections", href: "/collections" }]),
      ]}
    />
  )
}

/**
 * /collections/{handle}: promo and seasonal collections that aren't in the menu
 * (e.g. /collections/under-50), plus /collections/all.
 * Menu collections redirect to /{department}/{category} (the menu comes from Shopify).
 */
export default function CollectionPage(props: Props) {
  return (
    <Suspense fallback={<CollectionSkeleton />}>
      <CollectionContent {...props} />
    </Suspense>
  )
}
