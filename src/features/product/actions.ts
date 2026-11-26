"use server"

import { createQuestion, createReview } from "@/features/reviews/reviews.server"
import { getCountry } from "@/lib/market/market.server"
import { supabaseConfigured } from "@/lib/supabase/admin"
import type { ProductDetail } from "@/lib/shopify/types"

import type { DeliveryCheck } from "./delivery-check"
import { checkDelivery } from "./delivery-check.server"
import { getProduct } from "./detail.server"
import { fieldErrors, questionSchema, reviewSchema, type FormState } from "./feedback"

/*
 * Review and question forms. Both are saved to Supabase as "pending": nothing appears on the site
 * until the team approves it (and, for questions, writes an answer) in the Supabase dashboard.
 */

const unavailable: FormState = {
  status: "error",
  message: "Sorry, we couldn't save that right now. Please try again in a few minutes.",
}

const honeypot = (formData: FormData) => String(formData.get("company") ?? "") !== ""

export async function submitReview(_prev: FormState, formData: FormData): Promise<FormState> {
  if (honeypot(formData)) return { status: "success" }
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }

  if (!supabaseConfigured) return unavailable

  try {
    const { headline, ...rest } = parsed.data
    const result = await createReview({ ...rest, title: headline })
    if (result === "duplicate") {
      return { status: "error", message: "You've already reviewed this product with this email. Thank you!" }
    }
    return { status: "success" }
  } catch (error) {
    console.error("[review]", error)
    return unavailable
  }
}

export async function askQuestion(_prev: FormState, formData: FormData): Promise<FormState> {
  if (honeypot(formData)) return { status: "success" }
  const parsed = questionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }

  if (!supabaseConfigured) return unavailable

  try {
    await createQuestion(parsed.data)
    return { status: "success" }
  } catch (error) {
    console.error("[question]", error)
    return unavailable
  }
}

/** Product data for the quick-add dialog on product cards (cached, same as the product page). */
export async function quickAddProductAction(handle: string): Promise<ProductDetail | null> {
  if (!/^[a-z0-9-]{1,255}$/i.test(handle)) return null
  try {
    return await getProduct(handle, await getCountry())
  } catch (error) {
    console.error("[quick add]", error)
    return null
  }
}

/** "Check delivery" on the product page: real Shopify shipping rates to a postal code. */
export async function checkDeliveryAction(variantId: string, postalCode: string): Promise<DeliveryCheck> {
  if (!/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variantId) || typeof postalCode !== "string" || postalCode.length > 12) {
    return { status: "invalid", message: "Enter a valid postal code." }
  }
  try {
    return await checkDelivery(variantId, postalCode)
  } catch (error) {
    console.error("[delivery check]", error)
    return { status: "error", message: "We couldn't check delivery right now. Please try again." }
  }
}
