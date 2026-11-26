import { z } from "zod"

/** Shared by the forms (instant feedback) and the server actions (the real check). */

/** The product a form is about. Checked so nobody can post against made-up ids. */
const productFields = {
  productId: z.string().regex(/^gid:\/\/shopify\/Product\/\d+$/),
  productHandle: z.string().regex(/^[a-z0-9-]{1,255}$/),
}

export const reviewSchema = z.object({
  ...productFields,
  rating: z.coerce.number().int().min(1, { error: "Pick a star rating." }).max(5),
  headline: z.string().trim().min(2, { error: "Add a short headline." }).max(80),
  body: z.string().trim().min(10, { error: "Tell us a bit more (at least 10 characters)." }).max(2000),
})

/** Review photos: at most 5, each up to 5 MB, common image types. Checked in the browser and on the server. */
export const REVIEW_PHOTOS = {
  max: 5,
  maxBytes: 5 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
} as const

export const questionSchema = z.object({
  ...productFields,
  question: z.string().trim().min(5, { error: "Type your question (at least 5 characters)." }).max(500),
})

export type FormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fields?: Record<string, string> }

export const idleState: FormState = { status: "idle" }

/** First error message per field, for showing under each input. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form")
    out[key] ??= issue.message
  }
  return out
}
