/**
 * Shared list layouts so cards and their skeletons always line up.
 * - grid:  2 / 3 / 4 columns, every item shown (collection, search).
 * - shelf: one row. Phones scroll sideways; tablets show 3, laptops 4, wide screens 5.
 */
export const listLayouts = {
  grid: "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4",
  /** Next to the 240px filter sidebar: 3 columns on laptops, 4 on wide screens. */
  collection: "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4",
  shelf: [
    "-mx-4 grid snap-x auto-cols-[72%] grid-flow-col gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:auto-cols-[44%]",
    "md:mx-0 md:auto-cols-auto md:grid-flow-row md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 xl:grid-cols-5",
    "md:[&>li:nth-child(n+4)]:hidden lg:[&>li:nth-child(4)]:flex xl:[&>li:nth-child(5)]:flex",
  ].join(" "),
} as const

export type ListLayout = keyof typeof listLayouts
