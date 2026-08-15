/**
 * QueryProvider.jsx
 * -----------------------------------------
 * Thin wrapper reserved as the single place we'd introduce a caching
 * data-fetching library later without touching every feature file.
 * Currently a pass-through, since the lightweight apiRequest() wrapper
 * (lib/queryClient.js) is used directly by feature hooks per our
 * approved "keep dependencies minimal" approach.
 */

export function QueryProvider({ children }) {
  return children;
}