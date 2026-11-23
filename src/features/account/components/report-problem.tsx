"use client"

import { useActionState, useState } from "react"
import { CheckIcon, MessageSquareWarningIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { idleState } from "@/features/product/feedback"
import { FormField, inputClass } from "@/features/product/components/detail/form-field"
import { cn } from "@/lib/utils"

import { reportProblemAction } from "../actions"

const reasons = [
  { value: "damaged", label: "Arrived damaged" },
  { value: "wrong-item", label: "Wrong item" },
  { value: "missing", label: "Missing item" },
  { value: "other", label: "Something else" },
]

/** Damage / wrong item report, open for 48 hours after delivery (design: dashed terracotta card). */
export function ReportProblem({ orderId, hoursLeft }: { orderId: string; hoursLeft: number }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [state, action, pending] = useActionState(reportProblemAction, idleState)
  const errors = state.status === "error" ? (state.fields ?? {}) : {}

  return (
    <section aria-labelledby="report-h" className="flex flex-col gap-3 rounded-2xl border border-terra/30 bg-terra-soft/40 px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="report-h" className="flex items-center gap-2.5 font-sans text-base font-bold">
          <MessageSquareWarningIcon aria-hidden="true" className="size-5 text-terra" />
          Problem with this order?
        </h2>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-terra-text">{hoursLeft} hours left to report</span>
      </div>

      {state.status === "success" ? (
        <div role="status" className="flex items-center gap-3 rounded-xl bg-success-soft px-4 py-3 text-sm">
          <CheckIcon aria-hidden="true" className="size-5 text-success" strokeWidth={2.5} />
          <span>
            <span className="font-semibold">Report sent.</span> We&apos;ll email you within 24 hours with a replacement or refund.
          </span>
        </div>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-slate">
            If it arrived damaged or wrong, report it within 48 hours of delivery. Photos of the box and the damage get the fastest
            approval.
          </p>
          {!open ? (
            <Button onClick={() => setOpen(true)} variant="outline" className="h-10 self-start border-[1.5px] border-terra bg-white px-4 text-terra-text hover:bg-terra-soft">
              Report a problem
            </Button>
          ) : (
            <form action={action} className="flex flex-col gap-3 pt-1">
              <input type="hidden" name="orderId" value={orderId} />
              <input type="hidden" name="reason" value={reason} />
              <div className="flex flex-col gap-1.5">
                <span id="reason-label" className="text-[0.8125rem] font-semibold">
                  What happened?
                </span>
                <div role="radiogroup" aria-labelledby="reason-label" className="flex flex-wrap gap-2">
                  {reasons.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      role="radio"
                      aria-checked={reason === r.value}
                      onClick={() => setReason(r.value)}
                      className={cn(
                        "h-[2.375rem] rounded-full border-[1.5px] px-3.5 text-sm font-semibold transition-colors",
                        reason === r.value ? "border-ink bg-ink text-cream" : "border-line-strong bg-white hover:border-ink"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                {errors.reason && <span className="text-[0.8125rem] font-semibold text-[#a33a1f]">{errors.reason}</span>}
              </div>
              <FormField label="Tell us more" error={errors.details}>
                {(p) => <textarea {...p} name="details" rows={3} placeholder="What's wrong with the item?" className={cn(inputClass, "resize-y")} />}
              </FormField>
              <p className="text-xs text-slate">Photo and video upload comes soon. For now, reply to our email with photos.</p>
              <div className="flex justify-end gap-2.5">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-11 text-slate">
                  Cancel
                </Button>
                <Button type="submit" disabled={pending} className="h-11 px-5 font-bold">
                  {pending ? "Sending…" : "Submit report"}
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  )
}
