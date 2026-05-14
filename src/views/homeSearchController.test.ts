import { describe, expect, it, vi } from 'vitest'

import type { SearchHandlers } from '../services/api'
import { createHomeSearchController, propertyMatchesEnabledQuestions } from './homeSearchController'

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
    const subscribeToSearch = vi.fn(async (_requestId, nextHandlers) => {
      handlers = nextHandlers
      return cleanup
    })

    const controller = createHomeSearchController(subscribeToSearch)

    await controller.connectToSearch('req-1')

    handlers?.onUpdate?.([property])
    expect(controller.isLoading.value).toBe(true)
    expect(controller.properties.value).toEqual([property])

    handlers?.onRequest?.({
      requestId: 'req-1',
      request: {
        status: 'completed',
        locationHint: {
          query: 'Berlin, Germany',
          provider: 'photon',
          center: { lat: 52.52, lng: 13.405 },
        },
      },
      state: {
        foundApartments: 4,
        returnedApartmentsToFrontend: 1,
        requestedApartmentsForInvestigation: 3,
      },
    })

    expect(controller.isLoading.value).toBe(false)
    expect(cleanup).not.toHaveBeenCalled()
    expect(controller.searchProgress.value).toEqual({
      foundApartments: 4,
      returnedApartmentsToFrontend: 1,
      requestedApartmentsForInvestigation: 3,
    })
    expect(controller.locationHint.value).toEqual({
      query: 'Berlin, Germany',
      provider: 'photon',
      center: { lat: 52.52, lng: 13.405 },
    })

    handlers?.onUpdate?.([property])

    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('keeps the stream open long enough to receive a completed initial snapshot', async () => {
    let handlers: SearchHandlers | undefined
    const cleanup = vi.fn()
    const subscribeToSearch = vi.fn(async (_requestId, nextHandlers) => {
      handlers = nextHandlers
      return cleanup
    })

    const controller = createHomeSearchController(subscribeToSearch)

    await controller.connectToSearch('req-1')
    handlers?.onAccepted?.({
      requestId: 'req-1',
      request: { status: 'completed' },
    })

    expect(controller.isLoading.value).toBe(false)
    expect(cleanup).not.toHaveBeenCalled()

    handlers?.onUpdate?.([property])

    expect(controller.properties.value).toEqual([property])
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('closes the previous stream when a new search starts', async () => {
    const cleanups = [vi.fn(), vi.fn()]
    let callCount = 0
    const subscribeToSearch = vi.fn(async () => cleanups[callCount++])

    const controller = createHomeSearchController(subscribeToSearch)

    await controller.connectToSearch('req-1')
    await controller.connectToSearch('req-2')

    expect(cleanups[0]).toHaveBeenCalledTimes(1)
    expect(cleanups[1]).not.toHaveBeenCalled()
  })

  it('stops loading when the stream errors', async () => {
    let handlers: SearchHandlers | undefined
    const cleanup = vi.fn()
    const subscribeToSearch = vi.fn(async (_requestId, nextHandlers) => {
      handlers = nextHandlers
      return cleanup
    })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const controller = createHomeSearchController(subscribeToSearch)

    await controller.connectToSearch('req-1')
    handlers?.onError?.(new Error('boom'))

    expect(controller.isLoading.value).toBe(false)
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(consoleError).toHaveBeenCalled()
  })

  it('enables ml question filters by default and hides apartments below threshold', async () => {
    let handlers: SearchHandlers | undefined
    const subscribeToSearch = vi.fn(async (_requestId, nextHandlers) => {
      handlers = nextHandlers
      return vi.fn()
    })
    const controller = createHomeSearchController(subscribeToSearch)

    await controller.connectToSearch('req-1')
    handlers?.onAccepted?.({
      requestId: 'req-1',
      request: {
        status: 'running',
        nonFilterableQuestions: [{ id: 'q-1', question: 'Does it have blue towels?' }],
      },
    })
    handlers?.onUpdate?.([
      {
        ...property,
        id: 'apt-pass',
        questionScores: [{ questionId: 'q-1', question: 'Does it have blue towels?', score: 0.5 }],
      },
      {
        ...property,
        id: 'apt-fail',
        questionScores: [{ questionId: 'q-1', question: 'Does it have blue towels?', score: 0.49 }],
      },
    ])

    expect(controller.mlQuestions.value).toEqual([
      { id: 'q-1', question: 'Does it have blue towels?' },
    ])
    expect(controller.enabledQuestionIds.value.has('q-1')).toBe(true)
    expect(controller.properties.value.map((nextProperty) => nextProperty.id)).toEqual(['apt-pass'])

    controller.toggleQuestionFilter('q-1')

    expect(controller.properties.value.map((nextProperty) => nextProperty.id)).toEqual([
      'apt-pass',
      'apt-fail',
    ])
  })

  it('requires every enabled ml question to have a passing score', () => {
    expect(
      propertyMatchesEnabledQuestions(
        {
          ...property,
          questionScores: [
            { questionId: 'q-1', question: 'Has balcony?', score: 1 },
            { questionId: 'q-2', question: 'Has blue towels?', score: 0 },
          ],
        },
        new Set(['q-1', 'q-2']),
      ),
    ).toBe(false)

    expect(
      propertyMatchesEnabledQuestions(
        {
          ...property,
          questionScores: [{ questionId: 'q-1', question: 'Has balcony?', score: 1 }],
        },
        new Set(['q-1', 'q-2']),
      ),
    ).toBe(false)
  })
})
