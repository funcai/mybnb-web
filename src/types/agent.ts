export interface AgentQuestion {
  id?: string
  question?: string
  scoringType?: string
}

export interface AgentRequest {
  id?: string
  status?: string
  foundApartments?: number
  nonFilterableQuestions?: AgentQuestion[]
  locationHint?: AgentLocationHint
}

export interface AgentRequestState {
  foundApartments?: number
  returnedApartmentsToFrontend?: number
  requestedApartmentsForInvestigation?: number
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

export interface AgentLocationHint {
  query?: string
  provider?: string
  center?: {
    lat?: number
    lng?: number
  }
  bbox?: {
    south?: number
    west?: number
    north?: number
    east?: number
  }
}

export interface AgentApartment {
  id?: string
  provider?: string
  sourceUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  images?: Array<{ url?: string }>
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
