"use server"

import type { ProductDetail } from "@/lib/shopify/types"

import { getProduct } from "./detail.server"
import { fieldErrors, questionSchema, reviewSchema, type FormState } from "./feedback"

/*
 * Review and question forms.
 * For now they validate and log. Later: reviews go to the review app (e.g. Judge.me API) or
 * Supabase with moderation, questions are emailed to support. Nothing is published unchecked.
 */

const honeypot = (formData: FormData) => String(formData.get("company") ?? "") !== ""

export async function submitReview(_prev: FormState, formData: FormData): Promise<FormState> {
  if (honeypot(formData)) return { status: "success" }
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }

  if (process.env.NODE_ENV !== "production") console.info("[review] (dev) received", parsed.data)
  return { status: "success" }
}

export async function askQuestion(_prev: FormState, formData: FormData): Promise<FormState> {
  if (honeypot(formData)) return { status: "success" }
  const parsed = questionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }

  if (process.env.NODE_ENV !== "production") console.info("[question] (dev) received", parsed.data)
  return { status: "success" }
}

/** Product data for the quick-add dialog on product cards (cached, same as the product page). */
export async function quickAddProductAction(handle: string): Promise<ProductDetail | null> {
  if (!/^[a-z0-9-]{1,255}$/i.test(handle)) return null
  try {
    return await getProduct(handle)
  } catch (error) {
    console.error("[quick add]", error)
    return null
  }
}
