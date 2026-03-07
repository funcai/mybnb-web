import { afterEach, describe, expect, it, vi } from 'vitest'

import { bootBackend, resolveRunpodBaseUrl, searchProperties, useLocalApi } from './api'


describe('api service', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('prefers explicit load balancer base url when provided', () => {
    expect(
      resolveRunpodBaseUrl({
        VITE_RUNPOD_BASE_URL: 'https://worker.example.com/',
        VITE_RUNPOD_ENDPOINT_ID: 'ignored',
      }),
    ).toBe('https://worker.example.com')
  })

  it('builds the load balancer url from endpoint id when base url is absent', () => {
    expect(resolveRunpodBaseUrl({ VITE_RUNPOD_ENDPOINT_ID: 'abc123' })).toBe(
      'https://abc123.api.runpod.ai',
    )
  })

  it('respects local api mode', () => {
    expect(useLocalApi({ VITE_USE_LOCAL_API: 'true' })).toBe(true)
    expect(useLocalApi({ VITE_USE_LOCAL_API: 'false' })).toBe(false)
  })

  it('calls the direct load balancer generate endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ apartments: [{ id: 'apt-1' }] }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const apartments = await searchProperties('bright apartment', {
      VITE_USE_LOCAL_API: 'false',
      VITE_RUNPOD_ENDPOINT_ID: 'abc123',
      VITE_RUNPOD_API_KEY: 'token',
    })

    expect(apartments).toEqual([{ id: 'apt-1' }])
    expect(fetchMock).toHaveBeenCalledWith(
      'https://abc123.api.runpod.ai/generate',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
        }),
      }),
    )
  })

  it('pings the direct load balancer backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    })
    vi.stubGlobal('fetch', fetchMock)

    await bootBackend({
      VITE_USE_LOCAL_API: 'false',
      VITE_RUNPOD_ENDPOINT_ID: 'abc123',
      VITE_RUNPOD_API_KEY: 'token',
    })

    expect(fetchMock).toHaveBeenCalledWith('https://abc123.api.runpod.ai/ping', {
      headers: expect.objectContaining({
        Authorization: 'Bearer token',
        'Content-Type': 'application/json',
      }),
    })
  })
})
