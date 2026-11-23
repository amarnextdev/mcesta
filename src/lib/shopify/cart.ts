import { toImage, toMoney } from "./mappers"
import type { Image, Money, ShopifyImage, ShopifyMoney } from "./types"

/**
 * Storefront Cart API: fragment, operations, raw + app types, mapper.
 * The cart lives in Shopify; we only keep its id (httpOnly cookie, see features/cart).
 */

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartInfo on Cart {
    id
    checkoutUrl
    totalQuantity
    note
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    discountCodes {
      code
      applicable
    }
    discountAllocations {
      discountedAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
          amountPerQuantity {
            amount
            currencyCode
          }
          compareAtAmountPerQuantity {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
              width
              height
            }
            product {
              id
              handle
              title
              featuredImage {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`

const USER_ERRORS = /* GraphQL */ `
  userErrors {
    field
    message
  }
`

export const CART_QUERY = /* GraphQL */ `
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartInfo
    }
  }
  ${CART_FRAGMENT}
`

export const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartInfo
      }
      ${USER_ERRORS}
    }
  }
  ${CART_FRAGMENT}
`

export const CART_LINES_ADD = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartInfo
      }
      ${USER_ERRORS}
    }
  }
  ${CART_FRAGMENT}
`

export const CART_LINES_UPDATE = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartInfo
      }
      ${USER_ERRORS}
    }
  }
  ${CART_FRAGMENT}
`

export const CART_LINES_REMOVE = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartInfo
      }
      ${USER_ERRORS}
    }
  }
  ${CART_FRAGMENT}
`

export const CART_DISCOUNT_CODES_UPDATE = /* GraphQL */ `
  mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        ...CartInfo
      }
      ${USER_ERRORS}
    }
  }
  ${CART_FRAGMENT}
`

export const CART_NOTE_UPDATE = /* GraphQL */ `
  mutation CartNoteUpdate($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) {
      cart {
        ...CartInfo
      }
      ${USER_ERRORS}
    }
  }
  ${CART_FRAGMENT}
`

// ---- Raw shapes ----

export type ShopifyCart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  note: string | null
  cost: { subtotalAmount: ShopifyMoney; totalAmount: ShopifyMoney }
  discountCodes: { code: string; applicable: boolean }[]
  discountAllocations: { discountedAmount: ShopifyMoney }[]
  lines: {
    nodes: {
      id: string
      quantity: number
      cost: {
        totalAmount: ShopifyMoney
        amountPerQuantity: ShopifyMoney
        compareAtAmountPerQuantity: ShopifyMoney | null
      }
      merchandise: {
        id: string
        title: string
        availableForSale: boolean
        selectedOptions: { name: string; value: string }[]
        image: ShopifyImage | null
        product: { id: string; handle: string; title: string; featuredImage: ShopifyImage | null }
      }
    }[]
  }
}

export type CartUserError = { field: string[] | null; message: string }

// ---- App shapes ----

export type CartLine = {
  id: string
  quantity: number
  variantId: string
  productId: string
  handle: string
  title: string
  /** "Oak / Large"; empty for products without options. */
  variantTitle: string
  options: { name: string; value: string }[]
  image: Image | null
  available: boolean
  price: Money
  /** Original price per item, only when higher than `price`. */
  compareAtPrice: Money | null
  total: Money
}

export type Cart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  note: string
  lines: CartLine[]
  subtotal: Money
  /** After order-level discount codes; shipping and tax are added at checkout. */
  total: Money
  discountCodes: { code: string; applicable: boolean }[]
  /** Money saved by discount codes on this cart. */
  codeSavings: Money
}

export function toCart(c: ShopifyCart): Cart {
  const currency = c.cost.totalAmount.currencyCode
  const codeSavings = c.discountAllocations.reduce((sum, d) => sum + Number.parseFloat(d.discountedAmount.amount), 0)

  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    totalQuantity: c.totalQuantity,
    note: c.note ?? "",
    subtotal: toMoney(c.cost.subtotalAmount),
    total: toMoney(c.cost.totalAmount),
    discountCodes: c.discountCodes,
    codeSavings: { amount: codeSavings, currencyCode: currency },
    lines: c.lines.nodes.map((line) => {
      const price = toMoney(line.cost.amountPerQuantity)
      const compare = line.cost.compareAtAmountPerQuantity ? toMoney(line.cost.compareAtAmountPerQuantity) : null
      const m = line.merchandise
      const options = m.selectedOptions.filter((o) => o.value !== "Default Title")
      return {
        id: line.id,
        quantity: line.quantity,
        variantId: m.id,
        productId: m.product.id,
        handle: m.product.handle,
        title: m.product.title,
        variantTitle: options.map((o) => o.value).join(" / "),
        options,
        image: toImage(m.image ?? m.product.featuredImage, m.product.title),
        available: m.availableForSale,
        price,
        compareAtPrice: compare && compare.amount > price.amount ? compare : null,
        total: toMoney(line.cost.totalAmount),
      }
    }),
  }
}
