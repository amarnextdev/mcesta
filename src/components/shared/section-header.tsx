import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  id: string
  title: string
  subtitle?: string
  action?: { label: string; href: string }
  /** Extra controls on the right of the title. */
  children?: ReactNode
  /** Filter tabs shown on their own row under the title. */
  tabs?: ReactNode
  className?: string
}

/** Serif section title with optional subtitle, "see all" link and right-side controls. */
export function SectionHeader({ id, title, subtitle, action, children, tabs, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-5 flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex flex-col gap-1">
          <h2 id={id} className="text-[1.375rem] leading-[1.15] md:text-[1.75rem]">
            {title}
          </h2>
          {subtitle && <p className="text-[0.9375rem] text-slate">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {children}
          {action && (
            <Link
              href={action.href}
              className="group inline-flex h-9 items-center gap-1.5 px-1 text-sm font-semibold text-ink hover:text-teal"
            >
              {action.label}
              <ArrowRightIcon aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
      {tabs}
    </div>
  )
}
