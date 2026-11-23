"use server"

import { newsletterSchema, type NewsletterState } from "./schema"
import { subscribeEmail } from "./service.server"

/** Form action for the newsletter sign-up. Never trusts the browser: validates again here. */
export async function subscribeToNewsletter(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const raw = String(formData.get("email") ?? "")

  // Honeypot: real people never see or fill this field.
  if (String(formData.get("company") ?? "") !== "") {
    return { status: "success", email: raw }
  }

  const parsed = newsletterSchema.safeParse({ email: raw })
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Enter a valid email address.", email: raw }
  }

  try {
    await subscribeEmail(parsed.data.email)
    return { status: "success", email: parsed.data.email }
  } catch (error) {
    console.error("[newsletter] subscribe failed", error)
    return { status: "error", message: "Something went wrong on our side. Please try again in a minute.", email: raw }
  }
}
