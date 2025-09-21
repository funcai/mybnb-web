export type FilterOperator = 'eq' | 'gte' | 'lte' | 'gt' | 'lt' | string

export interface SearchFilter {
  key: string
  operator: FilterOperator
  value: string | number | boolean
}

export type QuestionScoringType = 'oneTakesAll' | string

export interface NonFilterableQuestionDef {
  id: string
  question: string
  scoringType: QuestionScoringType
}

export interface SearchRequest {
  createdAt: string
  filters: SearchFilter[]
  id: string
  nonFilterableQuestions: NonFilterableQuestionDef[]
  updatedAt: string
  userQuery: string
}

export interface AcceptedEventPayload {
  requestId: string
  request: SearchRequest
}
