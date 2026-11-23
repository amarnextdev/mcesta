import { z } from "zod"

/** Shared by the form (instant feedback) and the server action (the real check). */
export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Enter a valid email address, like you@example.com." })),
})

export type NewsletterState =
  | { status: "idle" }
  | { status: "success"; email: string }
  | { status: "error"; message: string; email: string }

export const initialNewsletterState: NewsletterState = { status: "idle" }
