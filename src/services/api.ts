// Previous RunPod/local API logic removed. We now support creating a request
// and streaming updates for that request via SSE.

// Backend base URL from Vite env with fallback to local default
const API_BASE_URL =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined) || 'http://127.0.0.1:8080'

// Create a new search request and return its requestId
// POST {API_BASE_URL}/api/requests with body { searchQuery }
export const createSearchRequest = async (
  query: string,
  opts?: { signal?: AbortSignal },
): Promise<string> => {
  const url = `${API_BASE_URL}/api/requests`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ searchQuery: query }),
    signal: opts?.signal,
  })

  if (!res.ok) {
    throw new Error(`Create request failed: ${res.status} ${res.statusText}`)
  }
  const data = (await res.json()) as unknown
  // Accept either { requestId } or { id } from backend
  const requestId =
    (data && typeof data === 'object' && 'requestId' in (data as Record<string, unknown>)
      ? (data as { requestId: string }).requestId
      : undefined) ||
    (data && typeof data === 'object' && 'id' in (data as Record<string, unknown>)
      ? (data as { id: string }).id
      : undefined)
  if (!requestId) {
    throw new Error('Create request did not return a requestId')
  }
  return requestId
}

// Open an EventSource to stream events for a request (preferred approach)
// Consumers should add listeners for 'accepted' and 'update' events.
// Usage:
//   const ev = openRequestEventSource(id)
//   ev.addEventListener('accepted', ...)
//   ev.addEventListener('update', ...)
export const openRequestEventSource = (requestId: string): EventSource => {
  const url = `${API_BASE_URL}/api/requests/${encodeURIComponent(requestId)}`
  return new EventSource(url)
}

