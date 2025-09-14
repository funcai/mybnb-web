// Previous RunPod/local API logic removed. We now support creating a request
// and streaming updates for that request via SSE.

// Create a new search request and return its requestId
// POST http://127.0.0.1:8080/api/requests with body { searchQuery }
export const createSearchRequest = async (
  query: string,
  opts?: { signal?: AbortSignal },
): Promise<string> => {
  const url = 'http://127.0.0.1:8080/api/requests'
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

// Stream updates for an existing request via SSE
// GET http://127.0.0.1:8080/api/requests/{requestId}
export const streamRequestById = async (
  requestId: string,
  onUpdate: (data: unknown) => void,
  opts?: { signal?: AbortSignal },
): Promise<void> => {
  const url = `http://127.0.0.1:8080/api/requests/${encodeURIComponent(requestId)}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
    },
    signal: opts?.signal,
  })

  if (!response.ok) {
    throw new Error(`SSE request failed: ${response.status} ${response.statusText}`)
  }

  if (!response.body) {
    throw new Error('SSE response has no body to read')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  try {
    // Read the stream and parse SSE frames
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // Split by double newline which separates SSE events
      const parts = buffer.split(/\r?\n\r?\n/)
      buffer = parts.pop() || '' // keep the trailing partial chunk

      for (const part of parts) {
        const lines = part.split(/\r?\n/)
        let eventName = 'message'
        const dataLines: string[] = []

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventName = line.slice(6).trim()
          } else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trim())
          }
        }

        const dataStr = dataLines.join('\n')
        if (eventName === 'update') {
          try {
            const json = JSON.parse(dataStr)
            console.log('SSE update event:', json)
            onUpdate(json)
          } catch {
            console.warn('Failed to parse SSE update data as JSON:', dataStr)
          }
        }
      }
    }
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'name' in err &&
      (err as { name?: string }).name === 'AbortError'
    ) {
      console.log('SSE request aborted')
      return
    }
    throw err
  } finally {
    try {
      reader.releaseLock()
    } catch {
      // ignore
    }
  }
}

// Backward-compat function retained (no longer used by views)
export const streamSearchRequest = async (
  query: string,
  onUpdate: (data: unknown) => void,
  opts?: { signal?: AbortSignal },
): Promise<void> => {
  const requestId = await createSearchRequest(query, opts)
  return streamRequestById(requestId, onUpdate, opts)
}
