import { describe, expect, it } from 'vitest'

import {
  buildSearchRoute,
  searchLegacyRouteName,
  searchLegacyRoutePath,
  searchRouteName,
  searchRoutePath,
} from './searchRoute'

describe('router', () => {
  it('builds search result urls with request ids in the path', () => {
    expect(searchRoutePath).toBe('/search/:requestId')
    expect(buildSearchRoute('req-123', 'apartment in berlin')).toEqual({
      name: searchRouteName,
      params: { requestId: 'req-123' },
      query: { q: 'apartment in berlin' },
    })
  })

  it('keeps legacy /search without a request id separate from result urls', () => {
    expect(searchLegacyRoutePath).toBe('/search')
    expect(searchLegacyRouteName).not.toBe(searchRouteName)
  })
})
