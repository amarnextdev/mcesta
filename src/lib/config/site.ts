/** Store-wide settings used in metadata, header, footer and policies. */
export const siteConfig = {
  name: "Mcesta",
  tagline: "Little luxuries for every room",
  description:
    "Thoughtful finds for home, kitchen and gifting. Ships from the USA in 3–7 days.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en-US",
  currency: "USD",
  supportEmail: "support@[yourdomain].com",
  supportReply: "We reply within 24 hours",
  shipsTo: "Ships to United States · USD",
  alsoShipsTo: "Also shipping to Canada",
  /** Only list methods your payment gateway really accepts. */
  paymentMethods: ["Visa", "Mastercard", "Amex", "PayPal"],
  /** Replace with real profile URLs before launch. */
  social: {
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
    tiktok: "https://www.tiktok.com/",
  },
} as const

/** Top bar. Set `enabled: false` when no offer is running (never show an expired offer). */
export const announcement = {
  enabled: true,
  lead: "Holiday sale:",
  text: "20% off gifts until Nov 30",
  extra: "Free US shipping over $50",
  cta: { label: "Shop now", href: "/gifts" },
} as const

/** Trust strip shown above the footer on every page. */
export const trustItems = [
  { icon: "truck", title: "Ships from the USA", text: "Delivered in 3–7 days" },
  { icon: "shield", title: "Damage covered", text: "Report within 48 hours of delivery" },
  { icon: "lock", title: "Secure checkout", text: "Paid through Shopify checkout" },
  { icon: "gift", title: "Gift-ready", text: "Free gift note at checkout" },
] as const

