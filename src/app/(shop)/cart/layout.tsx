import type { ReactNode } from "react"

import { PageType } from "@/components/layout/page-type"

/** Marks /cart so the header hides the category bar (CSS only). */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageType type="cart" />
      {children}
    </>
  )
}
