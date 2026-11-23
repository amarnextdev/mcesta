import { isMockShop, publicEnv } from "@/lib/config/env"

/** Thrown for HTTP failures and GraphQL `errors`. */
export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly details?: unknown
  ) {
    super(message)
    this.name = "ShopifyError"
  }
}

export type StorefrontRequest<TVariables> = {
  query: string
  variables?: TVariables
  signal?: AbortSignal
  /** Extra headers, e.g. the private token on the server. */
  headers?: Record<string, string>
}

/** GraphQL endpoint: the real store when configured, otherwise mock.shop. */
export function storefrontEndpoint(): string {
  if (isMockShop) return publicEnv.NEXT_PUBLIC_MOCK_SHOP_URL
  const domain = publicEnv.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  return `https://${domain}/api/${publicEnv.NEXT_PUBLIC_SHOPIFY_API_VERSION}/graphql.json`
}

function publicHeaders(): Record<string, string> {
  // mock.shop accepts the literal token "public" (needed for metafields).
  const token = isMockShop ? "public" : publicEnv.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
  return token ? { "X-Shopify-Storefront-Access-Token": token } : {}
}

/**
 * Low-level Storefront API request. Works in the browser and on the server.
 * Uses the public token; server code that needs the private token goes through `client.server.ts`.
 */
export async function storefrontFetch<TData, TVariables = Record<string, unknown>>({
  query,
  variables,
  signal,
  headers,
}: StorefrontRequest<TVariables>): Promise<TData> {
  const res = await fetch(storefrontEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(headers ?? publicHeaders()),
    },
    body: JSON.stringify({ query, variables }),
    signal,
  })

  if (!res.ok) {
    throw new ShopifyError(`Storefront API responded ${res.status}`, res.status)
  }

  const json = (await res.json()) as { data?: TData; errors?: { message: string }[] }
  if (json.errors?.length) {
    throw new ShopifyError(json.errors.map((e) => e.message).join("; "), res.status, json.errors)
  }
  if (!json.data) throw new ShopifyError("Storefront API returned no data", res.status)
  return json.data
}
