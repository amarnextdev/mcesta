/** Slug no menu item can have: its page resolves to a 404. */
export const PLACEHOLDER_SLUG = "_none"

/**
 * With Cache Components, generateStaticParams must return at least one entry (Next.js validates
 * the route at build time with it). While a menu level is still empty in Shopify, prerender a
 * placeholder that 404s; real pages are added as soon as the menu has them.
 */
export function atLeastOne<T extends Record<string, string>>(params: T[], placeholder: T): T[] {
  return params.length > 0 ? params : [placeholder]
}
