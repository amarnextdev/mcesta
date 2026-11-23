import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query"

/** Shared defaults for every QueryClient (server render and browser). */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data hydrated from the server stays fresh for a minute, so the browser doesn't refetch at once.
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      dehydrate: {
        // Stream queries that are still loading from Server Components to the client.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  })
}
