import type { ShelfConfig } from "@/features/product/types"

/**
 * Homepage content. Hardcoded for now so the layout can be built and tested.
 * Later: Shopify metaobjects (`hero_slide`, `home_section`) edited from the admin.
 */

export type HeroSlide = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  cta: { label: string; href: string }
  /** Featured product shown on the card at the right. */
  product: { name: string; price: string; imageUrl?: string; imageLabel: string }
  sticker: { top: string; big: string }
  theme: {
    bg: string
    fg: string
    circle: string
    chipBg: string
    chipFg: string
    ctaBg: string
    ctaFg: string
    photoBg: string
  }
}

export const heroSlides: HeroSlide[] = [
  {
    id: "holiday",
    eyebrow: "Holiday sale · until Nov 30",
    title: "Gifts they will actually keep",
    subtitle: "20% off gifts for the home, the host and the pets. Shipped from the USA in 3–7 days.",
    cta: { label: "Shop holiday gifts", href: "/gifts" },
    product: { name: "Barrel Decanter Set", price: "$59", imageLabel: "Photo: wrapped gifts and decanter set" },
    sticker: { top: "Save", big: "20%" },
    theme: { bg: "#1F5C5A", fg: "#FAF7F2", circle: "#2C6E6B", chipBg: "#FAF7F2", chipFg: "#1F5C5A", ctaBg: "#FAF7F2", ctaFg: "#1F5C5A", photoBg: "#E3EFEC" },
  },
  {
    id: "host-set",
    eyebrow: "Bundle and save",
    title: "The Host Gift Set",
    subtitle: "Decanter set, whiskey stones and a charcuterie board in one gift box. $119, save $18.",
    cta: { label: "Shop the set", href: "/gifts/gift-sets-and-bundles" },
    product: { name: "The Host Gift Set", price: "$119", imageLabel: "Photo: host gift set" },
    sticker: { top: "Save", big: "$18" },
    theme: { bg: "#E8DCCB", fg: "#1F2A2E", circle: "#DCCDB8", chipBg: "#FAF7F2", chipFg: "#A84B26", ctaBg: "#1F5C5A", ctaFg: "#FAF7F2", photoBg: "#F3EEE6" },
  },
  {
    id: "desk",
    eyebrow: "Home office",
    title: "The desk glow-up kit",
    subtitle: "Desk mat, walnut monitor riser and a cable kit. Three pieces, $89.",
    cta: { label: "Upgrade your desk", href: "/furniture/home-office" },
    product: { name: "Desk Glow-Up Kit", price: "$89", imageLabel: "Photo: clean desk setup" },
    sticker: { top: "3 for", big: "$89" },
    theme: { bg: "#1F2A2E", fg: "#F3EEE6", circle: "#2A373B", chipBg: "#6CC0B4", chipFg: "#0F201E", ctaBg: "#FAF7F2", ctaFg: "#1F2A2E", photoBg: "#33403F" },
  },
  {
    id: "pets",
    eyebrow: "Pets at home",
    title: "Comfort for your best friend",
    subtitle: "Orthopedic beds, leather collars and elevated bowls they will love.",
    cta: { label: "Shop pets", href: "/pets" },
    product: { name: "Orthopedic Dog Bed", price: "$89", imageLabel: "Photo: dog on an orthopedic bed" },
    sticker: { top: "From", big: "$39" },
    theme: { bg: "#E3EFEC", fg: "#1F2A2E", circle: "#CFE3DE", chipBg: "#FFFFFF", chipFg: "#1F5C5A", ctaBg: "#1F5C5A", ctaFg: "#FAF7F2", photoBg: "#FAF7F2" },
  },
]

/** Promise shown under the hero CTA. Keep in line with the trust strip and policies. */
export const heroPromise = "Ships from the USA · Damage covered"


/*
 * Product rows. Filters use Shopify search syntax, so tag your products in the admin
 * (gift, desk, decor, office, pets, furniture) for the chips to fill up.
 */
const under50 = "variants.price:<50"
const newest = { sortKey: "CREATED_AT", reverse: true, first: 5 } as const

export const homeShelves: Record<"topPicks" | "deals" | "newIn", ShelfConfig> = {
  topPicks: {
    id: "bestsellers",
    title: "Top picks for you",
    action: { label: "See all deals", href: "/gifts/under-50" },
    filters: [{ key: "all", label: "All", params: { first: 5, sortKey: "BEST_SELLING" } }],
  },
  deals: {
    id: "under-50",
    title: "Deals under $50",
    subtitle: "Thoughtful gifts and everyday upgrades, all under $50.",
    action: { label: "Shop all under $50", href: "/gifts/under-50" },
    filters: [
      { key: "all", label: "All deals", params: { first: 5, sortKey: "BEST_SELLING", query: under50 } },
      { key: "gifts", label: "Gifts", params: { first: 5, sortKey: "BEST_SELLING", query: `${under50} AND tag:gift` } },
      { key: "desk", label: "Desk", params: { first: 5, sortKey: "BEST_SELLING", query: `${under50} AND tag:desk` } },
      { key: "decor", label: "Decor", params: { first: 5, sortKey: "BEST_SELLING", query: `${under50} AND tag:decor` } },
    ],
  },
  newIn: {
    id: "new",
    title: "New in",
    subtitle: "Fresh finds added this month.",
    action: { label: "View all new arrivals", href: "/collections/all?sort=newest" },
    filters: [{ key: "all", label: "All", params: { ...newest } }],
  },
}

export type FeaturedTile = {
  eyebrow: string
  eyebrowTone: "teal" | "terra"
  title: string
  href: string
  bg: string
  photoBg: string
  imageUrl?: string
  imageLabel: string
}

/** Three collection tiles between the first and second product rows. */
export const featuredTiles: FeaturedTile[] = [
  { eyebrow: "New arrivals", eyebrowTone: "teal", title: "Fresh finds, just in", href: "/collections/all?sort=newest", bg: "#E3EFEC", photoBg: "#F4F9F7", imageLabel: "Photo: new vase set" },
  { eyebrow: "Home refresh", eyebrowTone: "terra", title: "Make your space feel new", href: "/home-decor", bg: "#EFE6D8", photoBg: "#F8F3EC", imageLabel: "Photo: accent chair" },
  { eyebrow: "Desk essentials", eyebrowTone: "teal", title: "Upgrade your workspace", href: "/furniture/home-office", bg: "#E4E9EC", photoBg: "#F1F4F6", imageLabel: "Photo: desk setup" },
]

export type BundleSpotlight = {
  eyebrow: string
  title: string
  description: string
  href: string
  items: { name: string; worth: string; photoBg: string; imageUrl?: string }[]
  price: string
  compareAtPrice: string
  saving: string
  note: string
}

/**
 * Gift set feature. Example content: replace with a real bundle product
 * (or a Shopify bundle) before launch.
 */
export const bundleSpotlight: BundleSpotlight = {
  eyebrow: "3 pieces · 1 gift box",
  title: "The Host Gift Set",
  description: "Everything for a cozy night in, packed together and ready to give.",
  href: "/products/the-host-gift-set",
  items: [
    { name: "Barrel Decanter Set", worth: "$59", photoBg: "#E3EFEC" },
    { name: "Whiskey Stones Gift Box", worth: "$29", photoBg: "#EFE6D8" },
    { name: "Acacia Charcuterie Set", worth: "$49", photoBg: "#F7E3D8" },
  ],
  price: "$119",
  compareAtPrice: "$137",
  saving: "$18",
  note: "Gift box included · Free gift note · Ships from USA in 3–7 days",
}

export type Reel = {
  id: string
  title: string
  duration: string
  /** Vertical (9:16) MP4. Leave empty to show the placeholder. */
  videoUrl?: string
  posterUrl?: string
  bg: string
  product: { name: string; price: string; href: string; imageUrl?: string }
}

/** "Finds by Finn" short videos. Later: Shopify metaobject `reel` with a product reference. */
export const finn = {
  name: "Finn",
  intro: "Hi, I'm Finn. I find the good stuff so you don't have to. Shop straight from the video.",
  reels: [
    { id: "desk", title: "Desk glow-up under $100", duration: "0:24", bg: "#D9E2E0", product: { name: "Walnut Monitor Riser", price: "$49", href: "/furniture/home-office" } },
    { id: "host", title: "Gifts for the host who has everything", duration: "0:31", bg: "#E3EFEC", product: { name: "Barrel Decanter Set", price: "$59", href: "/gifts" } },
    { id: "cozy", title: "5 finds that make a home feel cozy", duration: "0:28", bg: "#EFE6D8", product: { name: "Chunky Knit Throw", price: "$59", href: "/home-decor" } },
    { id: "dog", title: "What my dog thinks of his new bed", duration: "0:19", bg: "#F7E3D8", product: { name: "Orthopedic Dog Bed", price: "$89", href: "/pets" } },
    { id: "cables", title: "Hide every cable in 60 seconds", duration: "0:42", bg: "#E4E9EC", product: { name: "Cable Management Kit", price: "$24", href: "/furniture/home-office" } },
  ] satisfies Reel[],
}

export type StorePromise = {
  eyebrow: string
  eyebrowTone: "teal" | "terra"
  icon: "quality" | "damage" | "support"
  title: string
  text: string
  bg: string
}

/** "Why shop with Mcesta". Keep every line true to how the store really works. */
export const promises: StorePromise[] = [
  {
    eyebrow: "Picked with care",
    eyebrowTone: "teal",
    icon: "quality",
    title: "Only finds we'd keep",
    text: "Every product comes from a trusted US supplier, and we check quality and reviews before it goes on the shelf.",
    bg: "#E3EFEC",
  },
  {
    eyebrow: "Damage covered",
    eyebrowTone: "terra",
    icon: "damage",
    title: "Arrived damaged? We fix it",
    text: "Send us a photo within 48 hours of delivery and we'll ship a replacement or refund you. No back and forth.",
    bg: "#EFE6D8",
  },
  {
    eyebrow: "Real support",
    eyebrowTone: "teal",
    icon: "support",
    title: "A real person replies",
    text: "Questions about an order? Email us and a real person gets back to you within 24 hours.",
    bg: "#E4E9EC",
  },
]

/** Newsletter block. Create the WELCOME10 discount in Shopify before turning this on for real. */
export const newsletter = {
  eyebrow: "Join the Mcesta list",
  title: "Get 10% off your first order",
  perks: ["10% off your first order", "Early access to sales", "Gift guides before every holiday"],
  cta: "Get my 10% off",
  note: "We send 2–3 emails a month. Unsubscribe anytime.",
  code: "WELCOME10",
  discount: "10%",
}
