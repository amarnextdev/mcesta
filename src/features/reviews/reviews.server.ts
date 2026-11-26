import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { serverEnv } from "@/lib/config/env.server"
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase/admin"
import type { Tables } from "@/lib/supabase/database.types"

import type { AnsweredQuestion, ProductReviews, Review } from "./types"

/** Reviews shown on a product page. Older ones can come later with "load more". */
const PAGE_SIZE = 20

export const reviewsTag = (productId: string) => `reviews:${productId}`

type ReviewRow = Pick<
  Tables<"reviews">,
  "id" | "rating" | "title" | "body" | "author_name" | "verified_buyer" | "photos" | "created_at"
>

export const REVIEW_MEDIA_BUCKET = "review-media"

/**
 * URL of a stored review photo (bucket is public-read; files have random names). Served through our
 * own /supabase proxy (next.config.ts rewrites), since some Indian ISPs block *.supabase.co.
 */
function mediaUrl(path: string) {
  return `/supabase/storage/v1/object/public/${REVIEW_MEDIA_BUCKET}/${path}`
}

/** Same proxy for upload URLs the browser uses. */
function viaProxy(url: string) {
  const base = serverEnv.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "")
  return base && url.startsWith(base) ? `/supabase${url.slice(base.length)}` : url
}

const toReview = (r: ReviewRow): Review => ({
  id: r.id,
  rating: r.rating,
  title: r.title,
  body: r.body,
  authorName: r.author_name,
  verifiedBuyer: r.verified_buyer,
  photos: r.photos.map(mediaUrl),
  createdAt: r.created_at,
})

/**
 * Approved reviews and the rating summary of one product. Cached; a new approval shows within
 * a few minutes (instant once moderation revalidates the `reviews:{id}` tag).
 */
export async function getProductReviews(productId: string): Promise<ProductReviews> {
  "use cache"
  cacheLife("minutes")
  cacheTag("reviews", reviewsTag(productId))

  if (!supabaseConfigured) return { stats: null, reviews: [] }
  const db = supabaseAdmin()

  const [list, summary] = await Promise.all([
    db
      .from("reviews")
      .select("id, rating, title, body, author_name, verified_buyer, photos, created_at")
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE),
    db.from("product_review_stats").select("*").eq("product_id", productId).maybeSingle(),
  ])

  if (list.error) console.error("[reviews] list", list.error.message)
  if (summary.error) console.error("[reviews] stats", summary.error.message)

  const s = summary.data
  return {
    reviews: (list.data ?? []).map(toReview),
    stats:
      s && s.review_count
        ? {
            count: s.review_count,
            average: Number(s.average_rating ?? 0),
            distribution: [s.stars_1 ?? 0, s.stars_2 ?? 0, s.stars_3 ?? 0, s.stars_4 ?? 0, s.stars_5 ?? 0],
          }
        : null,
  }
}

/** Approved questions that have an answer, newest first. */
export async function getAnsweredQuestions(productId: string): Promise<AnsweredQuestion[]> {
  "use cache"
  cacheLife("minutes")
  cacheTag("questions", `questions:${productId}`)

  if (!supabaseConfigured) return []
  const { data, error } = await supabaseAdmin()
    .from("questions")
    .select("id, question, answer")
    .eq("product_id", productId)
    .eq("status", "approved")
    .not("answer", "is", null)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) console.error("[questions]", error.message)
  // `answer` is non-null here (filtered above); the generated type can't know that.
  return (data ?? []).flatMap((q) => (q.answer ? [{ id: q.id, question: q.question, answer: q.answer }] : []))
}

type NewReview = {
  productId: string
  productHandle: string
  rating: number
  title: string
  body: string
  customerId: string
  authorName: string
  email: string
  verifiedBuyer: boolean
  /** Storage paths from createPhotoUploads, already checked to belong to this shopper. */
  photos: string[]
}

/** Saves a review as pending. One review per shopper per product. */
export async function createReview(input: NewReview): Promise<"created" | "duplicate"> {
  const db = supabaseAdmin()

  const { count, error: countError } = await db
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("product_id", input.productId)
    .eq("customer_id", input.customerId)
  if (countError) throw new Error(countError.message)
  if ((count ?? 0) > 0) return "duplicate"

  const { error } = await db.from("reviews").insert({
    product_id: input.productId,
    product_handle: input.productHandle,
    rating: input.rating,
    title: input.title,
    body: input.body,
    author_name: input.authorName,
    author_email: input.email.toLowerCase(),
    customer_id: input.customerId,
    verified_buyer: input.verifiedBuyer,
    photos: input.photos,
  })
  // Unique index: two submits racing each other.
  if (error?.code === "23505") return "duplicate"
  if (error) throw new Error(error.message)
  return "created"
}

type NewQuestion = { productId: string; productHandle: string; question: string; customerId: string; authorName: string; email: string }

/** Saves a question as pending; the team answers it in the dashboard. */
export async function createQuestion(input: NewQuestion): Promise<void> {
  const { error } = await supabaseAdmin().from("questions").insert({
    product_id: input.productId,
    product_handle: input.productHandle,
    question: input.question,
    customer_id: input.customerId,
    author_name: input.authorName,
    author_email: input.email.toLowerCase(),
  })
  if (error) throw new Error(error.message)
}

// ---- Review photos ----

/** Folder of one shopper's uploads: reviews/<numeric customer id>/… */
export function photoFolder(customerId: string) {
  return `reviews/${customerId.split("/").pop()}`
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
}

/**
 * One signed upload URL per photo: the browser sends the file straight to Supabase Storage
 * (not through our server, which keeps big uploads off Vercel's request limit).
 */
export async function createPhotoUploads(customerId: string, types: string[]) {
  const bucket = supabaseAdmin().storage.from(REVIEW_MEDIA_BUCKET)
  return Promise.all(
    types.map(async (type) => {
      const path = `${photoFolder(customerId)}/${crypto.randomUUID()}.${EXTENSIONS[type]}`
      const { data, error } = await bucket.createSignedUploadUrl(path)
      if (error) throw new Error(error.message)
      return { path, url: viaProxy(data.signedUrl) }
    })
  )
}

/** Keeps only paths in this shopper's folder that were really uploaded. */
export async function ownedPhotos(customerId: string, paths: string[]): Promise<string[]> {
  const folder = photoFolder(customerId)
  const mine = paths.filter((p) => p.startsWith(`${folder}/`) && /^[\w/-]+\.(jpg|png|webp|heic|heif)$/.test(p))
  if (mine.length === 0) return []
  const { data, error } = await supabaseAdmin().storage.from(REVIEW_MEDIA_BUCKET).list(folder, { limit: 100 })
  if (error) throw new Error(error.message)
  const existing = new Set((data ?? []).map((f) => `${folder}/${f.name}`))
  return mine.filter((p) => existing.has(p))
}
