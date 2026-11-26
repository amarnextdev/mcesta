import { DEFAULT_SORT, DEFAULT_TAB, isCollectionTab } from "./config"
import { parseFilters, writeFilters } from "./filters"
import { isCollectionSort } from "./sort"
import type { CollectionParams } from "./types"

type RawSearchParams = Record<string, string | string[] | undefined>

function toURLSearchParams(raw: RawSearchParams): URLSearchParams {
  const url = new URLSearchParams()
  for (const [key, value] of Object.entries(raw)) {
    for (const v of Array.isArray(value) ? value : value === undefined ? [] : [value]) url.append(key, v)
  }
  return url
}

/** URL → typed params. Unknown values fall back to defaults, so bad links never crash the page. */
export function parseCollectionParams(
  handle: string,
  search: RawSearchParams | URLSearchParams,
  country: string
): CollectionParams {
  const url = search instanceof URLSearchParams ? search : toURLSearchParams(search)
  const get = (key: string) => url.get(key) ?? undefined
  const sort = get("sort")
  const tab = get("tab")
  const pageNumber = Number.parseInt(get("page") ?? "1", 10)
  const page = Number.isFinite(pageNumber) && pageNumber > 1 ? Math.min(pageNumber, 999) : 1
  return {
    handle,
    sort: isCollectionSort(sort) ? sort : DEFAULT_SORT,
    tab: isCollectionTab(tab) ? tab : DEFAULT_TAB,
    filters: parseFilters(url),
    page,
    country,
  }
}

/** Typed params → query string. Defaults are left out so URLs stay short. */
export function collectionSearch(params: Omit<CollectionParams, "handle" | "country">): string {
  const search = new URLSearchParams()
  if (params.tab !== DEFAULT_TAB) search.set("tab", params.tab)
  if (params.sort !== DEFAULT_SORT) search.set("sort", params.sort)
  writeFilters(search, params.filters)
  if (params.page > 1) search.set("page", String(params.page))
  const qs = search.toString()
  return qs ? `?${qs}` : ""
}
