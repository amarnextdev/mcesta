"use client"

import { useActionState, useId, useState } from "react"
import { CheckIcon, LoaderCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { subscribeToNewsletter } from "../actions"
import { initialNewsletterState, newsletterSchema } from "../schema"

/** Email sign-up with instant check in the browser and the real check in a server action. */
export function NewsletterForm({ cta, className }: { cta: string; className?: string }) {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialNewsletterState)
  const [clientError, setClientError] = useState<string | null>(null)
  const inputId = useId()
  const errorId = `${inputId}-error`

  if (state.status === "success") {
    return (
      <div role="status" className={cn("flex items-center gap-3 rounded-xl bg-white px-[18px] py-4", className)}>
        <span aria-hidden="true" className="grid size-9 flex-none place-items-center rounded-full bg-success-soft text-success">
          <CheckIcon className="size-5" />
        </span>
        <span className="flex flex-col">
          <span className="font-semibold">You&apos;re in!</span>
          <span className="text-sm text-slate">Check your inbox for your 10% code.</span>
        </span>
      </div>
    )
  }

  const error = clientError ?? (state.status === "error" ? state.message : null)

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(event) => {
        const email = new FormData(event.currentTarget).get("email")
        const result = newsletterSchema.safeParse({ email: String(email ?? "") })
        if (!result.success) {
          event.preventDefault()
          setClientError(result.error.issues[0]?.message ?? "Enter a valid email address.")
        } else {
          setClientError(null)
        }
      }}
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex flex-wrap items-end gap-2.5">
        <div className="flex flex-[1_1_260px] flex-col gap-1">
          <label htmlFor={inputId} className="text-sm font-semibold">
            Email address
          </label>
          <input
            id={inputId}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={state.status === "error" ? state.email : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={() => clientError && setClientError(null)}
            className={cn(
              "h-[3.25rem] w-full rounded-[10px] border-[1.5px] bg-white px-4 text-base text-ink transition-colors outline-none placeholder:text-slate/70 focus-visible:ring-3 focus-visible:ring-ring/40",
              error ? "border-[#a33a1f]" : "border-line-strong focus-visible:border-teal"
            )}
          />
        </div>
        {/* Honeypot for bots. Hidden from people and screen readers. */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <Button type="submit" size="lg" disabled={pending} className="h-[3.25rem] flex-[1_1_auto] px-[26px] text-base sm:flex-none">
          {pending && <LoaderCircleIcon data-icon="inline-start" className="size-5 animate-spin" />}
          {pending ? "Joining…" : cta}
        </Button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm font-semibold text-[#a33a1f]">
          {error}
        </p>
      )}
    </form>
  )
}
