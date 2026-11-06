import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import type { SearchHandlers } from '../services/api'
import type { Property } from '../types/property'

const fixture = vi.hoisted(() => ({
  controller: null as ReturnType<typeof import('./homeSearchController').createHomeSearchController> | null,
}))
vi.mock('./homeSearchController', () => ({ createHomeSearchController: () => fixture.controller }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: { q: 'Fixture question' }, params: { requestId: 'fixture' } }),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}))
vi.mock('../components/MapView.vue', () => ({ default: { render: () => null } }))
vi.mock('../components/SearchProgressDisplay.vue', () => ({ default: { render: () => null } }))

import ResultsView from './ResultsView.vue'

const property = (id: string, unknown: boolean): Property => ({
  id, provider: 'fixture', sourceUrl: 'https://example.invalid/' + id,
  title: id, description: '', attributes: [],
  questionScores: [{ questionId: 'q', question: 'Fixture question',
    ...(unknown ? { status: 'unknown' as const, errorCode: 'missing_image_evidence' } : { status: 'scored' as const, score: 1 }),
  }],
})

describe('saved result notice', () => {
  it.each([1, 3])('omits the count notice with %i Unknown listings while preserving the result cards', async (count) => {
    const actual = await vi.importActual<typeof import('./homeSearchController')>('./homeSearchController')
    let handlers: SearchHandlers | undefined
    const controller = actual.createHomeSearchController(async (_id, next) => {
      handlers = next
      return () => {}
    })
    fixture.controller = controller
    try {
      await controller.connectToSearch('fixture')
      handlers?.onAccepted?.({ requestId: 'fixture', request: {
        status: 'completed', nonFilterableQuestions: [{ id: 'q', question: 'Fixture question' }],
      } })
      handlers?.onUpdate?.([property('Scored fixture', false), ...Array.from({ length: count }, (_, i) => property('Unknown fixture ' + i, true))])
      const html = await renderToString(createSSRApp(ResultsView))
      expect(html).not.toContain('Could not evaluate')
      expect(html).toContain('Scored fixture')
      expect(html).toContain('100%')
      expect(html).toContain('Listings with unknown image results')
      expect(html).toContain('Their image results are unknown.')
      expect(html.match(/Unknown — images unavailable/g)).toHaveLength(count)
      expect(controller.properties.value.map((row) => row.id)).toEqual(['Scored fixture'])
      expect(controller.unknownProperties.value).toHaveLength(count)
    } finally {
      controller.dispose()
      fixture.controller = null
    }
  })
})
