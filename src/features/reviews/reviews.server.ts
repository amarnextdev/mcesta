import "server-only"

import { cacheLife, cacheTag } from "next/cache"

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

const toReview = (r: ReviewRow): Review => ({
  id: r.id,
  rating: r.rating,
  title: r.title,
  body: r.body,
  authorName: r.author_name,
  verifiedBuyer: r.verified_buyer,
  photos: r.photos,
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
  name: string
  email: string
}

/** Saves a review as pending. Returns false if this email already reviewed the product. */
export async function createReview(input: NewReview): Promise<"created" | "duplicate"> {
  const db = supabaseAdmin()
  const email = input.email.toLowerCase()

  // One review per email per product.
  const { count, error: countError } = await db
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("product_id", input.productId)
    .eq("author_email", email)
  if (countError) throw new Error(countError.message)
  if ((count ?? 0) > 0) return "duplicate"

  const { error } = await db.from("reviews").insert({
    product_id: input.productId,
    product_handle: input.productHandle,
    rating: input.rating,
    title: input.title,
    body: input.body,
    author_name: input.name,
    author_email: email,
  })
  if (error) throw new Error(error.message)
  return "created"
}

type NewQuestion = { productId: string; productHandle: string; question: string; email: string }

/** Saves a question as pending; the team answers it in the dashboard. */
export async function createQuestion(input: NewQuestion): Promise<void> {
  const { error } = await supabaseAdmin().from("questions").insert({
    product_id: input.productId,
    product_handle: input.productHandle,
    question: input.question,
    author_name: "Shopper",
    author_email: input.email.toLowerCase(),
  })
  if (error) throw new Error(error.message)
}
