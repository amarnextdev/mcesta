import Link from "next/link"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type EmptyStateProps = {
  title: string
  text?: string
  action?: { label: string; href: string }
  icon?: ReactNode
  className?: string
}

/** Dashed teal box used when a list has nothing to show. */
export function EmptyState({ title, text, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-teal-line bg-teal-tint px-6 py-10 text-center",
        className
      )}
    >
      {icon}
      <p className="text-base font-semibold">{title}</p>
      {text && <p className="max-w-md text-sm text-slate">{text}</p>}
      {action && (
        <Link href={action.href} className="mt-1 text-sm font-semibold text-teal hover:underline">
          {action.label}
        </Link>
      )}
    </div>
  )
}
