import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { CollectionScreen } from "@/features/collection/components/collection-screen"
import { CollectionSkeleton } from "@/features/collection/components/collection-skeleton"
import { collectionMetadata } from "@/features/collection/metadata"
import {
  collectionHandle,
  departmentAllHref,
  departments,
  getDepartment,
} from "@/lib/config/navigation"

type Props = PageProps<"/[department]/all">

export function generateStaticParams() {
  return departments.map((d) => ({ department: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const department = getDepartment((await params).department)
  if (!department) return { title: "Page not found", robots: { index: false } }
  return collectionMetadata(collectionHandle(department), {
    canonical: departmentAllHref(department),
    fallbackTitle: `All ${department.label}`,
  })
}

async function DepartmentProducts({ params, searchParams }: Props) {
  const department = getDepartment((await params).department)
  if (!department) notFound()

  return (
    <CollectionScreen
      handle={collectionHandle(department)}
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
