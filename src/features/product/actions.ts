"use server"

import { getCustomerIdentity, hasOrderedAny, publicName } from "@/features/account/session.server"
import { createPhotoUploads, createQuestion, createReview, ownedPhotos } from "@/features/reviews/reviews.server"
import { getCountry } from "@/lib/market/market.server"
import { supabaseConfigured } from "@/lib/supabase/admin"
import type { ProductDetail } from "@/lib/shopify/types"

import type { DeliveryCheck } from "./delivery-check"
import { checkDelivery } from "./delivery-check.server"
import { getProduct } from "./detail.server"
import { fieldErrors, questionSchema, REVIEW_PHOTOS, reviewSchema, type FormState } from "./feedback"

/*
 * Review and question forms, for logged-in shoppers. Both are saved to Supabase as "pending":
 * nothing appears on the site until the team approves it (and, for questions, writes an answer).
 */

const unavailable: FormState = {
  status: "error",
  message: "Sorry, we couldn't save that right now. Please try again in a few minutes.",
}

const honeypot = (formData: FormData) => String(formData.get("company") ?? "") !== ""

const loginRequired: FormState = { status: "error", message: "Please log in to continue." }

/** Logged-in shoppers only: the review shows their name and can carry "Verified buyer". */
export async function submitReview(_prev: FormState, formData: FormData): Promise<FormState> {
  if (honeypot(formData)) return { status: "success" }
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }

  if (!supabaseConfigured) return unavailable
  const shopper = await getCustomerIdentity()
  if (!shopper) return loginRequired

  try {
    const requested = formData.getAll("photos").filter((p): p is string => typeof p === "string").slice(0, REVIEW_PHOTOS.max)
    const product = await getProduct(parsed.data.productHandle, await getCountry())
    const [photos, verifiedBuyer] = await Promise.all([
      ownedPhotos(shopper.id, requested),
      product && product.id === parsed.data.productId ? hasOrderedAny(product.variants.map((v) => v.id)) : false,
    ])
    const { headline, ...rest } = parsed.data
    const result = await createReview({
      ...rest,
      title: headline,
      customerId: shopper.id,
      authorName: publicName(shopper),
      email: shopper.email,
      verifiedBuyer,
      photos,
    })
    if (result === "duplicate") return { status: "error", message: "You've already reviewed this product. Thank you!" }
    return { status: "success" }
  } catch (error) {
    console.error("[review]", error)
    return unavailable
  }
}

/** Signed upload URLs for review photos (logged-in shoppers, up to 5 images of 5 MB). */
export async function reviewPhotoUploadsAction(
  files: { type: string; size: number }[]
): Promise<{ ok: true; uploads: { path: string; url: string }[] } | { ok: false; error: string }> {
  if (!supabaseConfigured) return { ok: false, error: "Photo uploads aren't available right now." }
  const shopper = await getCustomerIdentity()
  if (!shopper) return { ok: false, error: "Please log in to add photos." }
  if (!Array.isArray(files) || files.length === 0 || files.length > REVIEW_PHOTOS.max) {
    return { ok: false, error: `Add up to ${REVIEW_PHOTOS.max} photos.` }
  }
  const allowed: readonly string[] = REVIEW_PHOTOS.types
  if (files.some((f) => !allowed.includes(f.type) || !(f.size > 0 && f.size <= REVIEW_PHOTOS.maxBytes))) {
    return { ok: false, error: "Photos must be JPG, PNG, WebP or HEIC, up to 5 MB each." }
  }
  try {
    return { ok: true, uploads: await createPhotoUploads(shopper.id, files.map((f) => f.type)) }
  } catch (error) {
    console.error("[review photos]", error)
    return { ok: false, error: "We couldn't prepare the upload. Please try again." }
  }
}

/** Logged-in shoppers only; the answer is emailed to their account email. */
export async function askQuestion(_prev: FormState, formData: FormData): Promise<FormState> {
  if (honeypot(formData)) return { status: "success" }
  const parsed = questionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }

  if (!supabaseConfigured) return unavailable
  const shopper = await getCustomerIdentity()
  if (!shopper) return loginRequired

  try {
    await createQuestion({ ...parsed.data, customerId: shopper.id, authorName: publicName(shopper), email: shopper.email })
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
