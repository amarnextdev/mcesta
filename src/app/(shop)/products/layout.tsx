import type { ReactNode } from "react"

import { PageType } from "@/components/layout/page-type"

/** Marks these pages as "product" pages so the header adapts (CSS only). */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageType type="product" />
      {children}
    </>
  )
}
