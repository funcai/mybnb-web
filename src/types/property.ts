export interface PropertyAttribute {
  key: string
  label: string
  value: string
}

export interface PropertyQuestionScore {
  questionId: string
  question: string
  score: number
}

export interface Property {
  id: string
  provider: string
  sourceUrl: string
  title: string
  description: string
  attributes: PropertyAttribute[]
  questionScores: PropertyQuestionScore[]
}
