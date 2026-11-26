import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { CollectionScreen } from "@/features/collection/components/collection-screen"
import { CollectionSkeleton } from "@/features/collection/components/collection-skeleton"
import { collectionMetadata } from "@/features/collection/metadata"
import {
  categoryHref,
  departmentAllHref,
  getCategory,
  getDepartment,
  getSubcategory,
  subcategoryHref,
} from "@/lib/navigation"
import { getDepartments } from "@/lib/navigation/navigation.server"

type Props = PageProps<"/[department]/[category]/[subcategory]">

/** Prerender every sub-category in the menu. Unknown ones are a 404. */
export async function generateStaticParams() {
  return (await getDepartments()).flatMap((d) =>
    d.categories.flatMap((c) =>
      c.subcategories.map((s) => ({ department: d.slug, category: c.slug, subcategory: s.slug }))
    )
  )
}

async function resolve(params: Props["params"]) {
  const { department: deptSlug, category: catSlug, subcategory: subSlug } = await params
  const department = getDepartment(await getDepartments(), deptSlug)
  const category = department ? getCategory(department, catSlug) : null
  const subcategory = category ? getSubcategory(category, subSlug) : null
  return department && category && subcategory ? { department, category, subcategory } : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await resolve(params)
  if (!found) return { title: "Page not found", robots: { index: false } }
  const { department, category, subcategory } = found
  return collectionMetadata(subcategory.slug, {
    canonical: subcategoryHref(department, category, subcategory),
    fallbackTitle: `${subcategory.label} · ${category.label}`,
  })
}

async function SubcategoryContent({ params, searchParams }: Props) {
  const found = await resolve(params)
  if (!found) notFound()
  const { department, category, subcategory } = found

  return (
    <CollectionScreen
      handle={subcategory.slug}
      searchParams={await searchParams}
      parents={[
        { label: "Home", href: "/" },
        { label: department.label, href: departmentAllHref(department) },
        { label: category.label, href: categoryHref(department, category) },
      ]}
      title={subcategory.label}
      allowMissing
    />
  )
}

/** /{department}/{category}/{subcategory}, e.g. /home-decor/lighting/night-lights. */
export default function SubcategoryPage(props: Props) {
  return (
    <Suspense fallback={<CollectionSkeleton />}>
      <SubcategoryContent {...props} />
    </Suspense>
  )
}
