import type { Property, PropertyAttribute, PropertyQuestionScore } from '../types/property'
import type {
  AgentApartment,
  AgentAttribute,
  AgentMatchingApartment,
  AgentQuestionResult,
  AgentRequest,
  AgentRequestState,
} from '../types/agent'

type EnvLike = Record<string, string | undefined>

type AcceptedPayload = {
  requestId: string
  request?: AgentRequest
  state?: SearchProgress
}

type RequestPayload = AcceptedPayload

export type SearchProgress = {
  foundApartments: number
  returnedApartmentsToFrontend: number
  requestedApartmentsForInvestigation: number
}

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
  const validScore = typeof result.score === 'number' && Number.isFinite(result.score) && result.score >= 0 && result.score <= 1
  const invalid = result.status !== 'unknown' && !validScore && (result.score != null || result.status === 'scored')
  return {
    questionId,
    question: questionMap.get(questionId) ?? questionId,
    score: result.status !== 'unknown' && validScore ? result.score as number : undefined,
    ...(invalid ? { status: 'unknown' as const, errorCode: 'invalid_score' } : {
      ...(result.status ? { status: result.status } : {}),
      ...(result.errorCode ? { errorCode: result.errorCode } : {}),
    }),
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

const normalizeCount = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }
  return Math.max(0, Math.trunc(value))
}

export const normalizeSearchProgress = (
  state?: AgentRequestState,
  request?: AgentRequest,
): SearchProgress => ({
  foundApartments: normalizeCount(state?.foundApartments ?? request?.foundApartments),
  returnedApartmentsToFrontend: normalizeCount(state?.returnedApartmentsToFrontend),
  requestedApartmentsForInvestigation: normalizeCount(state?.requestedApartmentsForInvestigation),
})

const firstImageUrl = (apartment: AgentApartment): string | undefined => {
  const ogImage = apartment.ogImage?.trim()
  if (ogImage) {
    return ogImage
  }
  for (const image of apartment.images ?? []) {
    const url = image.url?.trim()
    if (url) {
      return url
    }
  }
  return undefined
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
      const resultScores = new Map(
        (entry.nonFilterableQuestionResults ?? [])
          .map((result) => mapQuestionScore(result, questionMap))
          .filter((result): result is PropertyQuestionScore => result !== null)
          .map((result) => [result.questionId, result] as const),
      )
      const property: Property = {
        id,
        provider: apartment.provider?.trim() || 'unknown',
        sourceUrl,
        title: apartment.ogTitle?.trim() || sourceUrl,
        description: apartment.ogDescription?.trim() || apartment.description?.trim() || '',
        attributes: (apartment.attributes ?? [])
          .map((attribute) => mapAttribute(attribute))
          .filter((attribute): attribute is PropertyAttribute => attribute !== null),
        questionScores:
          questionMap.size > 0
            ? Array.from(questionMap.entries()).map(([questionId, question]) => ({
                questionId,
                question,
                score: resultScores.get(questionId)?.score,
                ...(resultScores.get(questionId)?.status ? { status: resultScores.get(questionId)!.status } : {}),
                ...(resultScores.get(questionId)?.errorCode ? { errorCode: resultScores.get(questionId)!.errorCode } : {}),
              }))
            : (entry.nonFilterableQuestionResults ?? [])
                .map((result) => mapQuestionScore(result, questionMap))
                .filter((result): result is PropertyQuestionScore => result !== null),
      }
      const imageUrl = firstImageUrl(apartment)
      if (imageUrl) {
        property.imageUrl = imageUrl
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
    const payload = await response.json().catch(() => null)
    const safeCodes = ['preview_session_closed', 'preview_busy_or_limit', 'unsupported_question', 'invalid_query', 'catalog_unavailable', 'catalog_invalid', 'request_not_saved', 'search_unavailable']
    const message = safeCodes.includes(payload?.error?.code) && typeof payload?.error?.message === 'string'
      ? payload.error.message.slice(0, 200) : 'Search is temporarily unavailable. Please try again later.'
    throw new Error(message)
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

export const createSearch = async (
  searchQuery: string,
  options: { env?: EnvLike; criterion?: string } = {},
): Promise<string> => {
  const env = options.env ?? import.meta.env
  const baseUrl = resolveAgentBaseUrl(env)
  const { requestId } = await postJson<{ requestId: string }>(`${baseUrl}/requests`, {
    searchQuery,
    ...(options.criterion ? { criterion: options.criterion } : {}),
  })
  return requestId
}

export const subscribeToSearch = (
  requestId: string,
  handlers: SearchHandlers,
  options: StartSearchOptions = {},
): (() => void) => {
  const env = options.env ?? import.meta.env
  const eventSourceFactory = options.eventSourceFactory ?? defaultEventSourceFactory
  const baseUrl = resolveAgentBaseUrl(env)
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

  source.addEventListener('error', (event) => {
    if (typeof event.data === 'string' && event.data) {
      handlers.onError?.(new Error('The search could not finish. Saved results remain available.'))
      cleanup()
    }
  })

  source.onerror = () => {
    handlers.onError?.(new Error(`SSE connection failed for request ${requestId}`))
  }

  return cleanup
}

export type SearchCapabilities = { mode: 'catalog'; open: boolean; questions: string[]; maxCandidates: number; deadline: string }
export const fetchSearchCapabilities = async (env: EnvLike = import.meta.env): Promise<SearchCapabilities | null> => {
  try {
    const response = await fetch(`${resolveAgentBaseUrl(env)}/search-capabilities`)
    if (!response.ok) return null
    const data = await response.json()
    if (data.mode !== 'catalog' || typeof data.open !== 'boolean' || !Array.isArray(data.questions) ||
      data.questions.length !== 14 || !data.questions.every((q: unknown) => typeof q === 'string' && q.length < 512) ||
      !Number.isInteger(data.maxCandidates) || data.maxCandidates < 1 || data.maxCandidates > 5) return null
    return data as SearchCapabilities
  } catch { return null }
}
