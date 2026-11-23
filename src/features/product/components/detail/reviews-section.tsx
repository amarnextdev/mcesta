"use client"

import { useActionState, useState } from "react"
import { CheckIcon, MessageSquareTextIcon, StarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { submitReview } from "../../actions"
import { idleState } from "../../feedback"
import { FormField, Honeypot, inputClass } from "./form-field"

type ReviewsSectionProps = {
  productId: string
  productTitle: string
  rating: { value: number; count: number } | null
}

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("flex", className)} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} className={cn("size-4", value >= i + 0.5 ? "fill-star text-star" : "fill-line-strong text-line-strong")} />
      ))}
    </span>
  )
}

/**
 * "Ratings and reviews" (design). Shows real numbers from a review app's rating metafields,
 * or an honest "No reviews yet". The form validates on the server; reviews are checked before
 * they appear. Individual reviews will come from the review app once it's connected.
 */
export function ReviewsSection({ productId, productTitle, rating }: ReviewsSectionProps) {
  const [writing, setWriting] = useState(false)
  const [stars, setStars] = useState(0)
  const [state, action, pending] = useActionState(submitReview, idleState)
  const errors = state.status === "error" ? (state.fields ?? {}) : {}
  const done = state.status === "success"

  return (
    <section id="reviews" aria-labelledby="reviews-h" className="container-shop scroll-mt-28 pb-16">
      <h2 id="reviews-h" className="mb-6 text-[1.375rem] leading-[1.15] md:text-[1.625rem]">
        Ratings and reviews
      </h2>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
        {/* Summary */}
        <div className="flex flex-col gap-3.5 lg:sticky lg:top-24">
          <div className="flex items-center gap-3.5">
            <span className="text-[3.25rem] leading-none font-bold tabular-nums">{rating ? rating.value.toFixed(1) : "–"}</span>
            <span className="flex flex-col gap-1">
              <Stars value={rating?.value ?? 0} />
              <span className="text-[0.8125rem] text-slate">
                {rating ? `${rating.count} ${rating.count === 1 ? "rating" : "ratings"}` : "No reviews yet"}
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-1.5" aria-hidden={!rating}>
            {[5, 4, 3, 2, 1].map((n) => (
              <div key={n} className="flex items-center gap-2 text-[0.8125rem] text-slate">
                <span className="w-6">{n}★</span>
                <span className="h-[0.4375rem] flex-1 overflow-hidden rounded-full bg-line" />
                <span className="w-8 text-right">–</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
            <span className="text-base font-bold">Own this product?</span>
            <span className="text-sm text-slate">Share your thoughts to help other shoppers decide.</span>
            {!done && (
              <Button
                variant="outline"
                aria-expanded={writing}
                onClick={() => setWriting(!writing)}
                className="mt-1 h-[2.875rem] border-[1.5px] border-ink bg-white text-[0.9375rem]"
              >
                {writing ? "Close" : "Write a review"}
              </Button>
            )}
          </div>
        </div>

        {/* Form / list */}
        <div className="flex min-w-0 flex-col gap-5">
          {done ? (
            <div role="status" className="flex items-center gap-3 rounded-2xl bg-success-soft px-5 py-4">
              <span aria-hidden="true" className="grid size-9 flex-none place-items-center rounded-full bg-success text-white">
                <CheckIcon className="size-5" strokeWidth={2.5} />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold">Thanks for your review!</span>
                <span className="text-sm text-slate">We check every review before it appears, usually within a day.</span>
              </span>
            </div>
          ) : writing ? (
            <form action={action} className="flex flex-col gap-3.5 rounded-2xl border-[1.5px] border-teal bg-white p-5">
              <span className="text-[1.0625rem] font-bold">Review {productTitle}</span>
              <input type="hidden" name="productId" value={productId} />
              <input type="hidden" name="rating" value={stars} />
              <Honeypot />

              <div className="flex flex-col gap-1.5">
                <span id="rate-label" className="text-[0.8125rem] font-semibold">
                  Your rating
                </span>
                <div role="radiogroup" aria-labelledby="rate-label" className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={stars === n}
                      aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                      onClick={() => setStars(n)}
                      className="grid size-9 place-items-center rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <StarIcon className={cn("size-7 transition-colors", stars >= n ? "fill-star text-star" : "fill-line text-line-strong")} />
                    </button>
                  ))}
                </div>
                {errors.rating && <span className="text-[0.8125rem] font-semibold text-[#a33a1f]">{errors.rating}</span>}
              </div>

              <FormField label="Headline" error={errors.headline}>
                {(p) => <input {...p} name="headline" placeholder="Sum it up in a few words" maxLength={80} className={inputClass} />}
              </FormField>
              <FormField label="Your review" error={errors.body}>
                {(p) => (
                  <textarea
                    {...p}
                    name="body"
                    rows={4}
                    placeholder="How do you like the quality, the packaging and the delivery?"
                    className={cn(inputClass, "resize-y")}
                  />
                )}
              </FormField>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <FormField label="Name (shown with your review)" error={errors.name}>
                  {(p) => <input {...p} name="name" autoComplete="given-name" className={inputClass} />}
                </FormField>
                <FormField label="Email (never shown)" error={errors.email}>
                  {(p) => <input {...p} name="email" type="email" autoComplete="email" className={inputClass} />}
                </FormField>
              </div>

              <div className="flex justify-end gap-2.5">
                <Button type="button" variant="ghost" onClick={() => setWriting(false)} className="h-11 text-slate">
                  Cancel
                </Button>
                <Button type="submit" disabled={pending} className="h-11 px-[22px] font-bold">
                  {pending ? "Sending…" : "Submit review"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-teal-line bg-teal-tint px-6 py-12 text-center">
              <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-white text-teal">
                <MessageSquareTextIcon className="size-6" />
              </span>
              <p className="font-heading text-[1.25rem] leading-tight">No reviews yet</p>
              <p className="max-w-sm text-[0.9375rem] text-slate">Bought this? Be the first to tell other shoppers what you think.</p>
              <Button onClick={() => setWriting(true)} className="mt-1 h-11 px-5">
                Write the first review
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
