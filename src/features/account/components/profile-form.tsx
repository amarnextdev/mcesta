"use client"

import { useActionState, useEffect } from "react"
import { LockIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FormField, inputClass } from "@/features/product/components/detail/form-field"
import { idleState } from "@/features/product/feedback"

import { updateProfileAction } from "../actions"

/** Settings → Profile: name is editable; email (the login) is managed by Shopify. */
export function ProfileForm({ firstName, lastName, email, phone }: { firstName: string; lastName: string; email: string; phone: string | null }) {
  const [state, action, pending] = useActionState(updateProfileAction, idleState)
  const fields = state.status === "error" ? state.fields : undefined

  useEffect(() => {
    if (state.status === "success") toast.success("Your details are saved")
  }, [state])

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" error={fields?.firstName}>
          {(p) => <input {...p} name="firstName" defaultValue={firstName} autoComplete="given-name" className={inputClass} />}
        </FormField>
        <FormField label="Last name" error={fields?.lastName}>
          {(p) => <input {...p} name="lastName" defaultValue={lastName} autoComplete="family-name" className={inputClass} />}
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-[0.8125rem] font-semibold">Email</span>
          <span className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-line-soft bg-cream px-3 py-2.5 text-[0.9375rem] text-slate">
            <LockIcon aria-hidden="true" className="size-4 flex-none" />
            <span className="truncate">{email}</span>
          </span>
          <span className="text-xs text-slate">You log in with this email, so it can&apos;t be changed here.</span>
        </div>
        {phone && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.8125rem] font-semibold">Phone</span>
            <span className="rounded-[10px] border-[1.5px] border-line-soft bg-cream px-3 py-2.5 text-[0.9375rem] text-slate">{phone}</span>
          </div>
        )}
      </div>
      {state.status === "error" && !fields && (
        <p role="alert" className="text-sm font-semibold text-terra-text">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11 self-start rounded-xl px-6 font-bold">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  )
}
