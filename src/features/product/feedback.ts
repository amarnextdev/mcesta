import { z } from "zod"

/** Shared by the forms (instant feedback) and the server actions (the real check). */

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1, { error: "Pick a star rating." }).max(5),
  headline: z.string().trim().min(2, { error: "Add a short headline." }).max(80),
  body: z.string().trim().min(10, { error: "Tell us a bit more (at least 10 characters)." }).max(2000),
  name: z.string().trim().min(1, { error: "Add your name." }).max(60),
  email: z.string().trim().pipe(z.email({ error: "Enter a valid email address." })),
})

export const questionSchema = z.object({
  productId: z.string().min(1),
  question: z.string().trim().min(5, { error: "Type your question (at least 5 characters)." }).max(500),
  email: z.string().trim().pipe(z.email({ error: "Enter a valid email so we can reply." })),
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
