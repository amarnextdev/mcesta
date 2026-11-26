"use client"

import { useActionState, useState } from "react"
import { CheckIcon, ChevronDownIcon, ClockIcon, MailIcon, MessageCircleQuestionIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

import { askQuestion } from "../../actions"
import { idleState } from "../../feedback"
import { FormField, Honeypot, inputClass } from "./form-field"

const FOLD = 4

/** "Questions, answered" (design): contact side panel + numbered accordion of questions. */
export function ProductFaq({
  productId,
  productHandle,
  items,
}: {
  productId: string
  productHandle: string
  items: { q: string; a: string }[]
}) {
  const [open, setOpen] = useState<Set<number>>(new Set([0]))
  const [showAll, setShowAll] = useState(false)
  const [asking, setAsking] = useState(false)
  const [state, action, pending] = useActionState(askQuestion, idleState)
  const errors = state.status === "error" ? (state.fields ?? {}) : {}
  const sent = state.status === "success"

  const shown = showAll ? items : items.slice(0, FOLD)
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <section aria-labelledby="faq-h" className="container-shop pb-16">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-14">
        <div className="flex flex-col gap-3.5 lg:sticky lg:top-24">
          <span className="text-xs font-bold tracking-[0.1em] text-teal uppercase">FAQ</span>
          <h2 id="faq-h" className="text-[1.375rem] leading-[1.15] md:text-[1.625rem]">
            Questions, answered
          </h2>
          <p className="text-[0.9375rem] text-slate">Quick answers about this product. Can&apos;t find yours? Ask us and we&apos;ll reply by email.</p>

          {sent ? (
            <div role="status" className="flex items-center gap-3 rounded-xl bg-success-soft px-4 py-3">
              <CheckIcon aria-hidden="true" className="size-5 text-success" strokeWidth={2.5} />
              <span className="text-sm font-semibold">Question sent. We&apos;ll email you the answer.</span>
            </div>
          ) : (
            <Button aria-expanded={asking} onClick={() => setAsking(!asking)} className="h-12 rounded-xl text-[0.9375rem]">
              <MessageCircleQuestionIcon data-icon="inline-start" className="size-5" />
              {asking ? "Close" : "Ask a question"}
            </Button>
          )}

          {asking && !sent && (
            <form action={action} className="flex flex-col gap-2.5 rounded-[14px] border-[1.5px] border-teal bg-white p-4">
              <input type="hidden" name="productId" value={productId} />
              <input type="hidden" name="productHandle" value={productHandle} />
              <Honeypot />
              <FormField label="Your question" error={errors.question}>
                {(p) => <textarea {...p} name="question" rows={3} placeholder="e.g. What are the dimensions?" className={cn(inputClass, "resize-y")} />}
              </FormField>
              <FormField label="Email for the answer" error={errors.email}>
                {(p) => <input {...p} name="email" type="email" autoComplete="email" placeholder="you@example.com" className={inputClass} />}
              </FormField>
              {state.status === "error" && !state.fields && (
                <p role="alert" className="rounded-lg bg-terra-soft px-3 py-2 text-[0.8125rem] font-semibold text-terra-text">
                  {state.message}
                </p>
              )}
              <Button type="submit" disabled={pending} className="h-[2.625rem] font-bold">
                {pending ? "Sending…" : "Send question"}
              </Button>
            </form>
          )}

          <div className="mt-1 flex flex-col border-t border-line">
            <div className="flex items-center gap-3 border-b border-line py-3 text-sm">
              <span aria-hidden="true" className="grid size-9 flex-none place-items-center rounded-[10px] bg-teal-soft text-teal">
                <ClockIcon className="size-[18px]" />
              </span>
              <span className="flex flex-col leading-snug">
                <span className="font-semibold">{siteConfig.supportReply}</span>
                <span className="text-[0.8125rem] text-slate">Mon to Sat, US hours</span>
              </span>
            </div>
            <div className="flex items-center gap-3 py-3 text-sm">
              <span aria-hidden="true" className="grid size-9 flex-none place-items-center rounded-[10px] bg-teal-soft text-teal">
                <MailIcon className="size-[18px]" />
              </span>
              <span className="flex flex-col leading-snug">
                <a href={`mailto:${siteConfig.supportEmail}`} className="font-semibold hover:text-teal">
                  {siteConfig.supportEmail}
                </a>
                <span className="text-[0.8125rem] text-slate">For orders and delivery</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {shown.map((item, i) => {
            const on = open.has(i)
            const id = `faq-answer-${i}`
            return (
              <div
                key={item.q}
                className={cn(
                  "overflow-hidden rounded-[14px] border-[1.5px] transition-[border-color,box-shadow]",
                  on ? "border-teal bg-white shadow-[0_6px_18px_rgba(31,92,90,0.08)]" : "border-line bg-white"
                )}
              >
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={id}
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between gap-3.5 px-5 py-[18px] text-left text-[0.9375rem] font-semibold"
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid h-[1.625rem] min-w-[34px] flex-none place-items-center rounded-lg px-1.5 text-xs font-bold",
                        on ? "bg-teal text-cream" : "bg-sand text-slate"
                      )}
                    >
                      Q{i + 1}
                    </span>
                    {item.q}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn("grid size-[30px] flex-none place-items-center rounded-full transition-colors", on ? "bg-teal text-cream" : "bg-sand text-ink")}
                  >
                    <ChevronDownIcon className={cn("size-4 transition-transform", on && "rotate-180")} />
                  </span>
                </button>
                {on && (
                  <p id={id} className="mr-5 ml-5 border-t border-dashed border-line-strong pt-3.5 pb-5 text-[0.9375rem] leading-[1.7] sm:ml-[66px]">
                    {item.a}
                  </p>
                )}
              </div>
            )
          })}
          {items.length > FOLD && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="flex h-[3.125rem] items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-teal-line bg-teal-tint text-[0.9375rem] font-semibold text-teal hover:bg-teal-soft"
            >
              {showAll ? "Show fewer questions" : `Show all ${items.length} questions`}
              <ChevronDownIcon aria-hidden="true" className={cn("size-4 transition-transform", showAll && "rotate-180")} />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
