import type { Metadata } from "next"
import { Suspense } from "react"

import { CollectionScreen } from "@/features/collection/components/collection-screen"
import { CollectionSkeleton } from "@/features/collection/components/collection-skeleton"
import { ALL_PRODUCTS_HANDLE } from "@/features/collection/config"
import { collectionMetadata } from "@/features/collection/metadata"
import { collectionHref } from "@/lib/config/navigation"

type Props = PageProps<"/collections/[handle]">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  return collectionMetadata(handle, { canonical: collectionHref(handle) })
}

async function CollectionContent({ params, searchParams }: Props) {
  const { handle } = await params
  return (
    <CollectionScreen
      handle={handle}
      searchParams={await searchParams}
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
 * Menu collections redirect to /{department}/{category} (next.config.ts).
 */
export default function CollectionPage(props: Props) {
  return (
    <Suspense fallback={<CollectionSkeleton />}>
      <CollectionContent {...props} />
    </Suspense>
  )
}
