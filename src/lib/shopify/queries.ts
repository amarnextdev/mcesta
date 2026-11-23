import { COLLECTION_FRAGMENT, PRODUCT_CARD_FRAGMENT } from "./fragments"

export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse, query: $query) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`

/** One page of a collection's products. */
export const COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  query CollectionProducts(
    $handle: String!
    $first: Int
    $after: String
    $last: Int
    $before: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      ...CollectionInfo
      products(
        first: $first
        after: $after
        last: $last
        before: $before
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
      ) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        nodes {
          ...ProductCard
        }
      }
    }
  }
  ${COLLECTION_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
`

/** `/collections/all`: every product in the store (Shopify has no real "all" collection in the API). */
export const ALL_PRODUCTS_PAGE_QUERY = /* GraphQL */ `
  query AllProductsPage(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
  ) {
    products(
      first: $first
      after: $after
      last: $last
      before: $before
      sortKey: $sortKey
      reverse: $reverse
      query: $query
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`

/** Collections for the /collections index. */
export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections($first: Int!) {
    collections(first: $first, sortKey: TITLE) {
      nodes {
        ...CollectionInfo
      }
    }
  }
  ${COLLECTION_FRAGMENT}
`

/**
 * Cursor index: only the cursor of every product (no product data), 250 per request.
 * Gives the total count and the starting cursor of every page, so the pager can show
 * numbered pages and "of 186" even though Shopify itself pages with cursors.
 */
export const COLLECTION_CURSORS_QUERY = /* GraphQL */ `
  query CollectionCursors(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          cursor
        }
      }
    }
  }
`

export const ALL_PRODUCT_CURSORS_QUERY = /* GraphQL */ `
  query AllProductCursors($first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, query: $query) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
      }
    }
  }
`

/** Product page. Up to 20 photos and 100 variants (Shopify's default variant limit). */
export const PRODUCT_QUERY = /* GraphQL */ `
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      vendor
      productType
      description
      descriptionHtml
      tags
      availableForSale
      seo {
        title
        description
      }
      images(first: 20) {
        nodes {
          url
          altText
          width
          height
        }
      }
      options {
        name
        values
      }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
      collections(first: 3) {
        nodes {
          handle
          title
        }
      }
      # Product FAQ: JSON list [{"q": "...", "a": "..."}] in a "custom.faq" metafield.
      faq: metafield(namespace: "custom", key: "faq") {
        value
      }
      # Standard review metafields, filled by review apps (Judge.me, Shopify Product Reviews…).
      rating: metafield(namespace: "reviews", key: "rating") {
        value
      }
      ratingCount: metafield(namespace: "reviews", key: "rating_count") {
        value
      }
    }
  }
`

/** "Similar products" (Shopify's built-in recommendations). */
export const PRODUCT_RECOMMENDATIONS_QUERY = /* GraphQL */ `
  query ProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...ProductCard
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`

/** "Frequently bought together": complementary products set in the Search & Discovery app. */
export const COMPLEMENTARY_PRODUCTS_QUERY = /* GraphQL */ `
  query ComplementaryProducts($productId: ID!) {
    productRecommendations(productId: $productId, intent: COMPLEMENTARY) {
      ...ProductCard
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`

/** Fresh price and stock for saved products (wishlist). Deleted products come back as null. */
export const PRODUCTS_BY_ID_QUERY = /* GraphQL */ `
  query ProductsById($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`
