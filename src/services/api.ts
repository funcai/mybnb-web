import type { Property, PropertyAttribute, PropertyQuestionScore } from '../types/property'
import type {
  AgentApartment,
  AgentAttribute,
  AgentMatchingApartment,
  AgentQuestionResult,
  AgentRequest,
} from '../types/agent'

type EnvLike = Record<string, string | undefined>

type AcceptedPayload = {
  requestId: string
  request?: AgentRequest
}

type RequestPayload = AcceptedPayload

type EventSourceLike = {
  addEventListener: (type: string, listener: (event: MessageEvent<string>) => void) => void
  close: () => void
  onerror: ((event: Event) => void) | null
}

type EventSourceFactory = (url: string) => EventSourceLike

export type SearchHandlers = {
  onAccepted?: (payload: AcceptedPayload) => void
  onRequest?: (payload: RequestPayload) => void
  onUpdate?: (properties: Property[]) => void
  onError?: (error: Error) => void
}

type StartSearchOptions = {
  env?: EnvLike
  eventSourceFactory?: EventSourceFactory
}

const defaultEventSourceFactory: EventSourceFactory = (url) => new EventSource(url)

export const resolveAgentBaseUrl = (env: EnvLike = import.meta.env): string => {
  const baseUrl = env.VITE_AGENT_BASE_URL?.trim()
  if (baseUrl) {
    return baseUrl.replace(/\/+$/, '')
  }
  return '/api'
}

const buildQuestionMap = (request?: AgentRequest): Map<string, string> => {
  const questionMap = new Map<string, string>()
  for (const question of request?.nonFilterableQuestions ?? []) {
    const id = question.id?.trim()
    const text = question.question?.trim()
    if (id && text) {
      questionMap.set(id, text)
    }
  }
  return questionMap
}

const normalizeValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeValue(entry)).join(', ')
  }
  if (value && typeof value === 'object') {
    return JSON.stringify(value)
  }
  return 'Unknown'
}

const formatAttributeLabel = (key: string): string =>
  key
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const mapAttribute = (attribute: AgentAttribute): PropertyAttribute | null => {
  const key = attribute.key?.trim()
  if (!key) {
    return null
  }
  return {
    key,
    label: formatAttributeLabel(key),
    value: normalizeValue(attribute.value),
  }
}

const mapQuestionScore = (
  result: AgentQuestionResult,
  questionMap: Map<string, string>,
): PropertyQuestionScore | null => {
  const questionId = result.nonFilterableQuestionId?.trim()
  if (!questionId) {
    return null
  }
  return {
    questionId,
    question: questionMap.get(questionId) ?? questionId,
    score: typeof result.score === 'number' ? result.score : 0,
  }
}

const mapCoordinates = (apartment: AgentApartment): Property['coordinates'] => {
  const coordinates = apartment.coordinates
  if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
    return undefined
  }
  if (
    coordinates.lat < -90 ||
    coordinates.lat > 90 ||
    coordinates.lng < -180 ||
    coordinates.lng > 180
  ) {
    return undefined
  }
  return {
    lat: coordinates.lat,
    lng: coordinates.lng,
  }
}

export const mapMatchingApartmentsToProperties = (
  apartments: AgentMatchingApartment[],
  questionMap: Map<string, string>,
): Property[] =>
  apartments
    .map((entry) => {
      const apartment = entry.apartment
      if (!apartment) {
        return null
      }
      const id = apartment.id?.trim() || entry.apartmentId?.trim()
      const sourceUrl = apartment.sourceUrl?.trim()
      if (!id || !sourceUrl) {
        return null
      }
      const property: Property = {
        id,
        provider: apartment.provider?.trim() || 'unknown',
        sourceUrl,
        title: apartment.ogTitle?.trim() || sourceUrl,
        description: apartment.ogDescription?.trim() || apartment.description?.trim() || '',
        attributes: (apartment.attributes ?? [])
          .map((attribute) => mapAttribute(attribute))
          .filter((attribute): attribute is PropertyAttribute => attribute !== null),
        questionScores: (entry.nonFilterableQuestionResults ?? [])
          .map((result) => mapQuestionScore(result, questionMap))
          .filter((result): result is PropertyQuestionScore => result !== null)
          .sort((left, right) => right.score - left.score),
      }
      const coordinates = mapCoordinates(apartment)
      if (coordinates) {
        property.coordinates = coordinates
      }
      return property
    })
    .filter((property): property is Property => property !== null)

const parseJson = <T>(raw: string): T => JSON.parse(raw) as T

const postJson = async <T>(url: string, body: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

export const bootBackend = async (env: EnvLike = import.meta.env): Promise<void> => {
  try {
    await fetch(`${resolveAgentBaseUrl(env)}/boot`, {
      method: 'POST',
    })
  } catch (error) {
    console.error('Failed to boot backend:', error)
  }
}

export const startSearch = async (
  searchQuery: string,
  handlers: SearchHandlers,
  options: StartSearchOptions = {},
): Promise<() => void> => {
  const env = options.env ?? import.meta.env
  const eventSourceFactory = options.eventSourceFactory ?? defaultEventSourceFactory
  const baseUrl = resolveAgentBaseUrl(env)
  const { requestId } = await postJson<{ requestId: string }>(`${baseUrl}/requests`, {
    searchQuery,
  })
  let questionMap = new Map<string, string>()

  const source = eventSourceFactory(`${baseUrl}/requests/${encodeURIComponent(requestId)}`)
  const cleanup = () => {
    source.close()
  }

  source.addEventListener('accepted', (event) => {
    const payload = parseJson<AcceptedPayload>(event.data)
    questionMap = buildQuestionMap(payload.request)
    handlers.onAccepted?.(payload)
  })

  source.addEventListener('request', (event) => {
    const payload = parseJson<RequestPayload>(event.data)
    questionMap = buildQuestionMap(payload.request)
    handlers.onRequest?.(payload)
  })

  source.addEventListener('update', (event) => {
    const payload = parseJson<AgentMatchingApartment[]>(event.data)
    handlers.onUpdate?.(mapMatchingApartmentsToProperties(payload, questionMap))
  })

  source.onerror = () => {
    handlers.onError?.(new Error(`SSE connection failed for request ${requestId}`))
  }

  return cleanup
}
