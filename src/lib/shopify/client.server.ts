import "server-only"

import { isMockShop } from "@/lib/config/env"
import { serverEnv } from "@/lib/config/env.server"

import { storefrontFetch, type StorefrontRequest } from "./client"

type ServerRequest<TVariables> = StorefrontRequest<TVariables> & {
  /** Customer IP for buyer-facing requests (cart, checkout). Leave empty for cached catalog reads. */
  buyerIp?: string
}

/**
 * Server-side Storefront request. Uses the private token when a real store is configured.
 * Shopify asks for `Shopify-Storefront-Buyer-IP` on private-token requests made for a buyer.
 */
export function storefrontServerFetch<TData, TVariables = Record<string, unknown>>({
  buyerIp,
  ...req
}: ServerRequest<TVariables>): Promise<TData> {
  const token = serverEnv.SHOPIFY_STOREFRONT_PRIVATE_TOKEN
  if (isMockShop || !token) return storefrontFetch<TData, TVariables>(req)

  return storefrontFetch<TData, TVariables>({
    ...req,
    headers: {
      "Shopify-Storefront-Private-Token": token,
      ...(buyerIp ? { "Shopify-Storefront-Buyer-IP": buyerIp } : {}),
    },
  })
}
