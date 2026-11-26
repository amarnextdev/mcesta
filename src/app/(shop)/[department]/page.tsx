import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { PageType } from "@/components/layout/page-type"
import { Skeleton } from "@/components/ui/skeleton"
import { DepartmentLanding } from "@/features/department/components/department-landing"
import { departmentHref, getDepartment } from "@/lib/navigation"
import { getDepartments } from "@/lib/navigation/navigation.server"

type Props = PageProps<"/[department]">

/** Prerender every department from the menu. Any other top-level slug is a 404. */
export async function generateStaticParams() {
  return (await getDepartments()).map((d) => ({ department: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const department = getDepartment(await getDepartments(), (await params).department)
  if (!department) return { title: "Page not found", robots: { index: false } }
  return {
    title: department.label,
    description: `Shop ${department.label.toLowerCase()} at Mcesta. Ships from the USA in 3–7 days.`,
    alternates: { canonical: departmentHref(department) },
  }
}

async function DepartmentContent({ params }: Pick<Props, "params">) {
  const department = getDepartment(await getDepartments(), (await params).department)
  if (!department) notFound()
  return <DepartmentLanding department={department} />
}

function LandingSkeleton() {
  return (
    <div aria-hidden="true" className="container-shop flex flex-col gap-8 pt-6 pb-16 md:gap-12">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_0.35fr]">
        <Skeleton className="aspect-[16/8] rounded-[20px] md:aspect-[16/7]" />
        <Skeleton className="hidden aspect-[16/7] rounded-[20px] lg:block" />
        <Skeleton className="hidden rounded-l-[20px] lg:block" />
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-[repeat(auto-fill,minmax(128px,1fr))] md:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

/**
 * /{department}, e.g. /electronics: the department's front page (banners, category tiles).
 * Reached from the homepage. The full product list with filters is /{department}/all.
 */
export default function DepartmentPage({ params }: Props) {
  return (
    <>
      {/* Department pages keep the big icon bar, like For You. */}
      <PageType type="browse" />
      <Suspense fallback={<LandingSkeleton />}>
        <DepartmentContent params={params} />
      </Suspense>
    </>
  )
}
