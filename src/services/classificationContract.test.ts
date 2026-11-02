import { describe, expect, it } from 'vitest'
import fixture from '../../testdata/classification-results.json'
import { subscribeToSearch } from './api'
import { formatQuestionScore } from './questionScores'
import { createHomeSearchController, propertyMatchesEnabledQuestions } from '../views/homeSearchController'

describe('worker → SSE → Vue classification contract', () => {
  it('does not let a disabled Unknown override an enabled scored question', () => {
    const property = { id: 'fixture', provider: 'fixture', sourceUrl: 'https://example.com', title: '', description: '', attributes: [], questionScores: [
      { questionId: 'enabled', question: 'Fixture?', score: 1 },
      { questionId: 'disabled', question: 'Other?', status: 'unknown' as const },
    ] }
    expect(propertyMatchesEnabledQuestions(property, new Set(['enabled']))).toBe(true)
    expect(propertyMatchesEnabledQuestions(property, new Set(['enabled', 'disabled']))).toBe(false)
  })
  it('keeps Unknown terminal and separate from matching and negative results', async () => {
    const listeners = new Map<string, (event: MessageEvent<string>) => void>()
    const controller = createHomeSearchController((id, handlers) => subscribeToSearch(id, handlers, {
      env: { VITE_AGENT_BASE_URL: '/api' },
      eventSourceFactory: () => ({ addEventListener: (event, listener) => listeners.set(event, listener), close: () => {}, onerror: null }),
    }))
    try {
      await controller.connectToSearch('fixture-request')
      listeners.get('request')!({ data: JSON.stringify({ requestId: fixture.request.id, request: fixture.request }) } as MessageEvent<string>)
      const payload = fixture.rawMatchingApartments.map((entry) => ({
        ...entry,
        apartment: fixture.apartments.find((apartment) => apartment.id === entry.apartmentId),
      }))
      listeners.get('update')!({ data: JSON.stringify(payload) } as MessageEvent<string>)
      expect(controller.isLoading.value).toBe(false)
      expect(controller.properties.value.map((property) => property.id)).toEqual(['apt-match'])
      expect(controller.unknownProperties.value.map((property) => property.id)).toEqual(['apt-unknown'])
      const unknown = controller.unknownProperties.value[0]!.questionScores[0]!
      expect(unknown.score).toBeUndefined()
      expect(formatQuestionScore(unknown)).toBe('Unknown — images unavailable')
      controller.toggleQuestionFilter('q-visible')
      expect(controller.properties.value.map((property) => property.id)).toEqual(['apt-unknown', 'apt-match', 'apt-negative'])
      expect(controller.unknownProperties.value).toHaveLength(0)
    } finally { controller.dispose() }
  })
})
