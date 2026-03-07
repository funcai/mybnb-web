import type { Property } from '../types/property'

type EnvLike = Record<string, string | undefined>

type ApartmentResponse = {
  apartments?: unknown
  [key: string]: unknown
}

const LOCAL_API_URL = 'http://localhost:8000/generate'

export const useLocalApi = (env: EnvLike = import.meta.env): boolean => {
  return env.VITE_USE_LOCAL_API === 'true'
}

export const resolveRunpodBaseUrl = (env: EnvLike = import.meta.env): string => {
  const explicitBaseUrl = env.VITE_RUNPOD_BASE_URL?.trim()
  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/+$/, '')
  }

  const endpointId = env.VITE_RUNPOD_ENDPOINT_ID?.trim()
  if (!endpointId) {
    throw new Error('RunPod endpoint configuration missing')
  }

  return `https://${endpointId}.api.runpod.ai`
}

const getAuthHeaders = (env: EnvLike = import.meta.env): HeadersInit => {
  const apiKey = env.VITE_RUNPOD_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('RunPod API key missing')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }
}

const parseApartments = (payload: ApartmentResponse | unknown): Property[] => {
  const apartments =
    typeof payload === 'object' && payload !== null && 'apartments' in payload
      ? (payload as ApartmentResponse).apartments
      : payload

  if (Array.isArray(apartments)) {
    return apartments as Property[]
  }

  if (typeof apartments === 'string') {
    const parsed = JSON.parse(apartments)
    if (Array.isArray(parsed)) {
      return parsed as Property[]
    }
  }

  throw new Error('Unexpected apartment response format')
}

const callApi = async (url: string, query: string, headers: HeadersInit): Promise<Property[]> => {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return parseApartments(await response.json())
}

const pingApi = async (url: string, headers: HeadersInit): Promise<void> => {
  const response = await fetch(url, {
    headers,
  })

  if (!response.ok) {
    throw new Error(`API ping failed: ${response.status} ${response.statusText}`)
  }
}

export const bootBackend = async (env: EnvLike = import.meta.env): Promise<void> => {
  if (useLocalApi(env)) {
    console.log('Using local API - skipping remote prewarm')
    return
  }

  try {
    await pingApi(`${resolveRunpodBaseUrl(env)}/ping`, getAuthHeaders(env))
  } catch (err) {
    console.error('Failed to ping RunPod backend:', err)
  }
}

export const searchProperties = async (
  query: string,
  env: EnvLike = import.meta.env,
): Promise<Property[]> => {
  if (useLocalApi(env)) {
    console.log('Using local API for search')
    return callApi(LOCAL_API_URL, query, {
      'Content-Type': 'application/json',
    })
  }

  console.log('Using RunPod load balancer API for search')
  return callApi(`${resolveRunpodBaseUrl(env)}/generate`, query, getAuthHeaders(env))
}
