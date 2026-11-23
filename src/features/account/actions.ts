"use server"

import { z } from "zod"

import { fieldErrors, type FormState } from "@/features/product/feedback"

/*
 * "Problem with this item?" report. Validates and logs for now; later it emails support with
 * the order number and uploaded photos (Supabase storage), and shows in the admin.
 */
const reportSchema = z.object({
  orderId: z.string().min(1),
  reason: z.enum(["damaged", "wrong-item", "missing", "other"], { error: "Pick what happened." }),
  details: z.string().trim().min(10, { error: "Tell us a bit more (at least 10 characters)." }).max(2000),
})

export async function reportProblemAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = reportSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }
  if (process.env.NODE_ENV !== "production") console.info("[order problem] (dev) received", parsed.data)
  return { status: "success" }
}
