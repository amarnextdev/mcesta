import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { CollectionScreen } from "@/features/collection/components/collection-screen"
import { CollectionSkeleton } from "@/features/collection/components/collection-skeleton"
import { collectionMetadata } from "@/features/collection/metadata"
import {
  allCategories,
  categoryHref,
  collectionHandle,
  departmentAllHref,
  departments,
  getCategory,
  getDepartment,
} from "@/lib/config/navigation"

type Props = PageProps<"/[department]/[category]">

/** Prerender every category in the menu. Unknown ones are a 404. */
export function generateStaticParams() {
  return departments.flatMap((d) => allCategories(d).map((c) => ({ department: d.slug, category: c.slug })))
}

async function resolve(params: Props["params"]) {
  const { department: deptSlug, category: catSlug } = await params
  const department = getDepartment(deptSlug)
  const category = department ? getCategory(department, catSlug) : null
  return department && category ? { department, category } : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await resolve(params)
  if (!found) return { title: "Page not found", robots: { index: false } }
  const { department, category } = found
  return collectionMetadata(collectionHandle(category), {
    canonical: categoryHref(department, category),
    fallbackTitle: `${category.label} · ${department.label}`,
  })
}

async function CategoryContent({ params, searchParams }: Props) {
  const found = await resolve(params)
  if (!found) notFound()
  const { department, category } = found

  return (
    <CollectionScreen
      handle={collectionHandle(category)}
      searchParams={await searchParams}
      parents={[
        { label: "Home", href: "/" },
        { label: department.label, href: departmentAllHref(department) },
      ]}
      title={category.label}
      allowMissing
    />
  )
}

/** /{department}/{category}, e.g. /electronics/smart-home. */
export default function CategoryPage(props: Props) {
  return (
    <Suspense fallback={<CollectionSkeleton />}>
      <CategoryContent {...props} />
    </Suspense>
  )
}
