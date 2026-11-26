import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { CollectionScreen } from "@/features/collection/components/collection-screen"
import { CollectionSkeleton } from "@/features/collection/components/collection-skeleton"
import { collectionMetadata } from "@/features/collection/metadata"
import { categoryHref, departmentAllHref, getCategory, getDepartment } from "@/lib/navigation"
import { getDepartments } from "@/lib/navigation/navigation.server"

type Props = PageProps<"/[department]/[category]">

/** Prerender every category in the menu. Unknown ones are a 404. */
export async function generateStaticParams() {
  return (await getDepartments()).flatMap((d) => d.categories.map((c) => ({ department: d.slug, category: c.slug })))
}

async function resolve(params: Props["params"]) {
  const { department: deptSlug, category: catSlug } = await params
  const department = getDepartment(await getDepartments(), deptSlug)
  const category = department ? getCategory(department, catSlug) : null
  return department && category ? { department, category } : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await resolve(params)
  if (!found) return { title: "Page not found", robots: { index: false } }
  const { department, category } = found
  return collectionMetadata(category.slug, {
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
      handle={category.slug}
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
