export interface AgentQuestion {
  id?: string
  question?: string
}

export interface AgentRequest {
  id?: string
  status?: string
  nonFilterableQuestions?: AgentQuestion[]
}

export interface AgentAttribute {
  key?: string
  value?: unknown
}

export interface AgentCoordinates {
  lat?: number
  lng?: number
  source?: string
  accuracy?: string
}

export interface AgentApartment {
  id?: string
  provider?: string
  sourceUrl?: string
  ogTitle?: string
  ogDescription?: string
  description?: string
  attributes?: AgentAttribute[]
  coordinates?: AgentCoordinates | null
}

export interface AgentQuestionResult {
  nonFilterableQuestionId?: string
  score?: number
}

export interface AgentMatchingApartment {
  apartmentId?: string
  apartment?: AgentApartment
  nonFilterableQuestionResults?: AgentQuestionResult[]
}
