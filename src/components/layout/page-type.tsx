/**
 * Invisible marker telling the header which kind of page this is (see the custom variants
 * in globals.css). Rendered by route layouts / pages, outside Suspense, so it's in the
 * prerendered shell. "browse" (For You and department pages) keeps the big icon bar.
 */
export function PageType({ type }: { type: "browse" | "listing" | "product" | "cart" }) {
  return <span hidden data-page-type={type} />
}
