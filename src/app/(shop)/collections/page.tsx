import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Breadcrumb } from "@/components/shared/breadcrumb"
import { EmptyState } from "@/components/shared/empty-state"
import { getCollections } from "@/features/collection/api.server"
import { ALL_PRODUCTS_HANDLE } from "@/features/collection/config"
import { collectionHref, menuHrefForCollection } from "@/lib/config/navigation"

export const metadata: Metadata = {
  title: "All collections",
  description: "Browse every collection in the shop.",
  alternates: { canonical: "/collections" },
}

const tileColors = ["#E3EFEC", "#EFE6D8", "#F7E3D8", "#E4E9EC"]

/** /collections: every collection as a tile. Data is cached, so this page is prerendered. */
export default async function CollectionsIndexPage() {
  const collections = await getCollections()
  const tiles = [
    { handle: ALL_PRODUCTS_HANDLE, title: "All products", image: null },
    ...collections.filter((c) => c.handle !== ALL_PRODUCTS_HANDLE && c.handle !== "frontpage"),
  ]

  return (
    <div className="container-shop pt-6 pb-16">
      <header className="mb-6 flex flex-col gap-2.5 border-b border-line pb-5">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Collections" }]} />
        <h1 className="text-[1.5rem] leading-[1.15] md:text-[1.625rem]">All collections</h1>
      </header>

      {tiles.length === 1 ? (
        <EmptyState title="No collections yet" action={{ label: "Shop all products", href: `/collections/${ALL_PRODUCTS_HANDLE}` }} />
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {tiles.map((c, i) => (
            <li key={c.handle}>
              <Link
                href={menuHrefForCollection(c.handle) ?? collectionHref(c.handle)}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line-soft bg-white transition-shadow hover:shadow-[0_8px_24px_rgba(31,42,46,0.08)]"
              >
                <span
                  className="relative m-2 mb-0 block aspect-[4/3] overflow-hidden rounded-xl"
                  style={{ background: tileColors[i % tileColors.length] }}
                >
                  {c.image && (
                    <Image
                      src={c.image.url}
                      alt=""
                      fill
                      preload={i < 4}
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </span>
                <span className="flex items-center justify-between gap-2 px-3.5 py-3">
                  <span className="text-[0.9375rem] font-semibold leading-snug">{c.title}</span>
                  <ArrowRightIcon aria-hidden="true" className="size-4 flex-none text-teal transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
