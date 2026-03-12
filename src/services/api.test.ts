import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'

import {
  bootBackend,
  mapMatchingApartmentsToProperties,
  resolveAgentBaseUrl,
  startSearch,
} from './api'

class FakeEventSource {
  listeners = new Map<string, Array<(event: MessageEvent<string>) => void>>()
  onerror: ((event: Event) => void) | null = null
  closed = false

  addEventListener(type: string, listener: (event: MessageEvent<string>) => void) {
    const existing = this.listeners.get(type) ?? []
    existing.push(listener)
    this.listeners.set(type, existing)
  }

  emit(type: string, data: unknown) {
    const event = { data: JSON.stringify(data) } as MessageEvent<string>
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event)
    }
  }

  close() {
    this.closed = true
  }
}

describe('api service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('resolves to same-origin api paths by default', () => {
    expect(resolveAgentBaseUrl({})).toBe('/api')
  })

  it('uses the configured agent base url when provided', () => {
    expect(resolveAgentBaseUrl({ VITE_AGENT_BASE_URL: 'https://agent.example/api/' })).toBe(
      'https://agent.example/api',
    )
  })

  it('pins the production frontend to the deployed agent base url', () => {
    const envFile = readFileSync(new URL('../../.env.production', import.meta.url), 'utf8')

    expect(envFile).toContain('VITE_AGENT_BASE_URL=https://api.42eyes.com/api')
  })

  it('pins Netlify builds to Node 22 for the current Vite toolchain', () => {
    const nodeVersionFile = readFileSync(new URL('../../.node-version', import.meta.url), 'utf8')
    const netlifyConfig = readFileSync(new URL('../../netlify.toml', import.meta.url), 'utf8')

    expect(nodeVersionFile.trim()).toBe('22')
    expect(netlifyConfig).toContain('NODE_VERSION = "22"')
  })

  it('posts to the boot endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    await bootBackend({ VITE_AGENT_BASE_URL: 'https://agent.example/api' })

    expect(fetchMock).toHaveBeenCalledWith('https://agent.example/api/boot', { method: 'POST' })
  })

  it('maps agent apartments to the simplified property model', () => {
    const properties = mapMatchingApartmentsToProperties(
      [
        {
          apartmentId: 'apt-1',
          apartment: {
            id: 'apt-1',
            provider: 'airbnb',
            sourceUrl: 'https://example.com/apartments/1',
            ogTitle: 'Bright studio',
            description: 'Original description',
            attributes: [
              { key: 'number_rooms', value: 2 },
              { key: 'pets_allowed', value: true },
            ],
          },
          nonFilterableQuestionResults: [
            { nonFilterableQuestionId: 'q-2', score: 0.4 },
            { nonFilterableQuestionId: 'q-1', score: 0.9 },
          ],
        },
      ],
      new Map([
        ['q-1', 'Is there a nice view?'],
        ['q-2', 'Is the kitchen newly renovated?'],
      ]),
    )

    expect(properties).toEqual([
      {
        id: 'apt-1',
        provider: 'airbnb',
        sourceUrl: 'https://example.com/apartments/1',
        title: 'Bright studio',
        description: 'Original description',
        attributes: [
          { key: 'number_rooms', label: 'Number Rooms', value: '2' },
          { key: 'pets_allowed', label: 'Pets Allowed', value: 'Yes' },
        ],
        questionScores: [
          {
            questionId: 'q-1',
            question: 'Is there a nice view?',
            score: 0.9,
          },
          {
            questionId: 'q-2',
            question: 'Is the kitchen newly renovated?',
            score: 0.4,
          },
        ],
      },
    ])
  })

  it('posts a search request, opens the sse stream, and closes it on cleanup', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ requestId: 'req-123' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const source = new FakeEventSource()
    const eventSourceFactory = vi.fn().mockReturnValue(source)
    const accepted = vi.fn()
    const request = vi.fn()
    const update = vi.fn()

    const cleanup = await startSearch(
      'apartment in berlin',
      {
        onAccepted: accepted,
        onRequest: request,
        onUpdate: update,
      },
      {
        env: { VITE_AGENT_BASE_URL: 'https://agent.example/api' },
        eventSourceFactory,
      },
    )

    source.emit('accepted', {
      requestId: 'req-123',
      request: {
        id: 'req-123',
        status: 'running',
        nonFilterableQuestions: [{ id: 'q-1', question: 'Is there a nice view?' }],
      },
    })
    source.emit('request', {
      requestId: 'req-123',
      request: {
        id: 'req-123',
        status: 'completed',
        nonFilterableQuestions: [{ id: 'q-1', question: 'Is there a nice view?' }],
      },
    })
    source.emit('update', [
      {
        apartmentId: 'apt-1',
        apartment: {
          id: 'apt-1',
          provider: 'airbnb',
          sourceUrl: 'https://example.com/apartments/1',
          ogDescription: 'Sunny place',
          attributes: [{ key: 'beds', value: 1 }],
        },
        nonFilterableQuestionResults: [{ nonFilterableQuestionId: 'q-1', score: 1 }],
      },
    ])

    cleanup()

    expect(fetchMock).toHaveBeenCalledWith(
      'https://agent.example/api/requests',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ searchQuery: 'apartment in berlin' }),
      }),
    )
    expect(eventSourceFactory).toHaveBeenCalledWith('https://agent.example/api/requests/req-123')
    expect(accepted).toHaveBeenCalledWith(expect.objectContaining({ requestId: 'req-123' }))
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({ status: 'completed' }),
      }),
    )
    expect(update).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'apt-1',
        questionScores: [
          expect.objectContaining({
            question: 'Is there a nice view?',
            score: 1,
          }),
        ],
      }),
    ])
    expect(source.closed).toBe(true)
  })
})
