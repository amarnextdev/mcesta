/** Reusable GraphQL fragments. Every query that shows a product card uses PRODUCT_CARD. */
export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCard on Product {
    id
    handle
    title
    vendor
    availableForSale
    tags
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    # Two are enough to know if the card can add straight to cart or must open the product.
    variants(first: 2) {
      nodes {
        id
        availableForSale
      }
    }
  }
`

export const COLLECTION_FRAGMENT = /* GraphQL */ `
  fragment CollectionInfo on Collection {
    id
    handle
    title
    description
    seo {
      title
      description
    }
    image {
      url
      altText
      width
      height
    }
  }
`
