"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { fieldErrors, type FormState } from "@/features/product/feedback"

import { updateName } from "./session.server"

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

const nameSchema = z.object({
  firstName: z.string().trim().min(1, { error: "Enter your first name." }).max(60),
  lastName: z.string().trim().max(60),
})

/** Settings → Profile: save first and last name to the Shopify customer. */
export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = nameSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }
  try {
    const error = await updateName(parsed.data.firstName, parsed.data.lastName)
    if (error) return { status: "error", message: error }
    revalidatePath("/account", "layout")
    return { status: "success" }
  } catch (error) {
    console.error("[account] update profile", error)
    return { status: "error", message: "We couldn't save your details. Please try again." }
  }
}
