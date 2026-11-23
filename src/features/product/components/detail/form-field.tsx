import { useId, type ReactNode } from "react"

import { cn } from "@/lib/utils"

export const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-line-strong bg-white px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-slate/70 focus-visible:border-teal focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-[#a33a1f]"

/** Label + control + error line, wired up for screen readers. */
export function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => ReactNode
}) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.8125rem] font-semibold">
        {label}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": error ? errorId : undefined })}
      {error && (
        <span id={errorId} className={cn("text-[0.8125rem] font-semibold text-[#a33a1f]")}>
          {error}
        </span>
      )}
    </div>
  )
}

/** Hidden field that only bots fill in. */
export function Honeypot() {
  return <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
}
