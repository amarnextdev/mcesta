import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type Crumb = { label: string; href?: string }

/** Home › Section › Page. The last item is the current page (no link). */
export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-xs text-slate/75", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {item.href && !last ? (
                <Link href={item.href} className="transition-colors hover:text-teal">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn(last && "text-slate")}>
                  {item.label}
                </span>
              )}
              {!last && <ChevronRightIcon aria-hidden="true" className="size-3 text-line-strong" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
