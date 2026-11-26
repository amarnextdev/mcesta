/** An approved review, as shown on the product page (no email). */
export type Review = {
  id: string
  rating: number
  title: string | null
  body: string
  authorName: string
  verifiedBuyer: boolean
  photos: string[]
  createdAt: string
}

export type ReviewStats = {
  count: number
  average: number
  /** Number of reviews per star, index 0 = 1 star … index 4 = 5 stars. */
  distribution: [number, number, number, number, number]
}

export type ProductReviews = { stats: ReviewStats | null; reviews: Review[] }

/** An approved, answered question. */
export type AnsweredQuestion = { id: string; question: string; answer: string }
