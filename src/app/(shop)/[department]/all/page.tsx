import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { CollectionScreen } from "@/features/collection/components/collection-screen"
import { CollectionSkeleton } from "@/features/collection/components/collection-skeleton"
import { collectionMetadata } from "@/features/collection/metadata"
import { departmentAllHref, getDepartment } from "@/lib/navigation"
import { getDepartments } from "@/lib/navigation/navigation.server"

type Props = PageProps<"/[department]/all">

export async function generateStaticParams() {
  return (await getDepartments()).map((d) => ({ department: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const department = getDepartment(await getDepartments(), (await params).department)
  if (!department) return { title: "Page not found", robots: { index: false } }
  return collectionMetadata(department.slug, {
    canonical: departmentAllHref(department),
    fallbackTitle: `All ${department.label}`,
  })
}

async function DepartmentProducts({ params, searchParams }: Props) {
  const department = getDepartment(await getDepartments(), (await params).department)
  if (!department) notFound()

  return (
    <CollectionScreen
      handle={department.slug}
      searchParams={await searchParams}
      parents={[{ label: "Home", href: "/" }]}
      title={department.label}
      allowMissing
    />
  )
}

/** /{department}/all, e.g. /electronics/all: every product in the department, with filters. */
export default function DepartmentProductsPage(props: Props) {
  return (
    <Suspense fallback={<CollectionSkeleton />}>
      <DepartmentProducts {...props} />
    </Suspense>
  )
}
