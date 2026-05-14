import type { RouteLocationRaw } from 'vue-router'

export const searchRoutePath = '/search/:requestId'
export const searchRouteName = 'search'
export const searchLegacyRoutePath = '/search'
export const searchLegacyRouteName = 'searchLegacy'

export const buildSearchRoute = (
  requestId: string,
  searchQuery: string,
  passthrough: Record<string, string> = {},
): RouteLocationRaw => ({
  name: searchRouteName,
  params: { requestId },
  query: { ...passthrough, q: searchQuery },
})
