import type { ReactNode } from "react"

import { PageType } from "@/components/layout/page-type"

/** Marks these pages as "listing" pages so the header adapts (CSS only). */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageType type="listing" />
      {children}
    </>
  )
}
