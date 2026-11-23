"use client"

import { useEffect, useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

type CopyButtonProps = {
  value: string
  /** What's being copied, for the label and message, e.g. "order number". */
  label: string
  className?: string
}

/** Small icon button that copies a value (order number, code…) and shows a tick for a moment. */
export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy(event: React.MouseEvent) {
    // Works inside clickable cards without opening them.
    event.preventDefault()
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`Copied ${label}`, { description: value })
    } catch {
      toast.error(`Couldn't copy the ${label}`)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label} ${value}`}
      title={`Copy ${label}`}
      className={cn(
        "relative z-10 inline-grid size-8 flex-none place-items-center rounded-lg text-slate transition-colors hover:bg-sand hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        copied && "text-success hover:text-success",
        className
      )}
    >
      {copied ? <CheckIcon className="size-4" strokeWidth={2.5} /> : <CopyIcon className="size-4" />}
    </button>
  )
}
