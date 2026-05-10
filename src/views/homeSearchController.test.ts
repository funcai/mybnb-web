import { describe, expect, it, vi } from 'vitest'

import type { SearchHandlers } from '../services/api'
import { createHomeSearchController } from './homeSearchController'

const property = {
  id: 'apt-1',
  provider: 'airbnb',
  sourceUrl: 'https://example.com/apartments/1',
  title: 'Bright studio',
  description: 'Sunny place',
  attributes: [],
  questionScores: [],
}

describe('home search controller', () => {
  it('keeps loading until the request reaches a terminal state', async () => {
    let handlers: SearchHandlers | undefined
    const cleanup = vi.fn()
    const startSearch = vi.fn(async (_query, nextHandlers) => {
      handlers = nextHandlers
      return cleanup
    })

    const controller = createHomeSearchController(startSearch)

    await controller.handleSearch('apartment in berlin')

    handlers?.onUpdate?.([property])
    expect(controller.isLoading.value).toBe(true)
    expect(controller.properties.value).toEqual([property])

    handlers?.onRequest?.({
      requestId: 'req-1',
      request: { status: 'completed' },
      state: {
        foundApartments: 4,
        returnedApartmentsToFrontend: 1,
        requestedApartmentsForInvestigation: 3,
      },
    })

    expect(controller.isLoading.value).toBe(false)
    expect(controller.searchProgress.value).toEqual({
      foundApartments: 4,
      returnedApartmentsToFrontend: 1,
      requestedApartmentsForInvestigation: 3,
    })
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('closes the previous stream when a new search starts', async () => {
    const cleanups = [vi.fn(), vi.fn()]
    let callCount = 0
    const startSearch = vi.fn(async () => cleanups[callCount++])

    const controller = createHomeSearchController(startSearch)

    await controller.handleSearch('first')
    await controller.handleSearch('second')

    expect(cleanups[0]).toHaveBeenCalledTimes(1)
    expect(cleanups[1]).not.toHaveBeenCalled()
  })

  it('stops loading when the stream errors', async () => {
    let handlers: SearchHandlers | undefined
    const cleanup = vi.fn()
    const startSearch = vi.fn(async (_query, nextHandlers) => {
      handlers = nextHandlers
      return cleanup
    })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const controller = createHomeSearchController(startSearch)

    await controller.handleSearch('broken')
    handlers?.onError?.(new Error('boom'))

    expect(controller.isLoading.value).toBe(false)
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(consoleError).toHaveBeenCalled()
  })
})
