import "server-only"

/**
 * Where sign-ups go.
 * Now: nothing is saved yet, the call just succeeds (wired up with the Admin API later).
 * Real store: create/update the Shopify customer with email marketing consent
 * (Admin API `customerCreate` / `customerEmailMarketingConsentUpdate`), so Shopify Email
 * or Klaviyo sends the WELCOME10 code. Keep Admin credentials server-side only.
 */
export async function subscribeEmail(email: string): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[newsletter] (dev) would subscribe ${email}`)
  }
}
