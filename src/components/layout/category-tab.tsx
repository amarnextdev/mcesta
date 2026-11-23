import { Suspense } from "react"

import { ActiveTabs } from "./active-tabs"
import { TabLinks, type CategoryTabProps } from "./tab-link"

/**
 * Category bar item. The active underline needs the current URL (a client hook), so that part
 * streams in a Suspense boundary; the prerendered shell shows the same item without it.
 */
export function CategoryTab(props: CategoryTabProps) {
  return (
    <Suspense fallback={<TabLinks {...props} active={false} />}>
      <ActiveTabs {...props} />
    </Suspense>
  )
}
