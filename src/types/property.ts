// New types aligned with updated backend response
export interface ApartmentAttribute {
  key: string
  value: string | number | boolean
}

export interface ApartmentImage {
  id: string
  url: string
}

export interface NonFilterableQuestionResult {
  nonFilterableQuestionId: string
  score: number
}

export interface Apartment {
  id: string
  provider: string
  providerId: string
  sourceUrl: string
  attributes: ApartmentAttribute[]
  description: string
  images: ApartmentImage[]
  // Optional Open Graph metadata provided by the backend
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  // Non-filterable question scores provided per update item by the backend
  nonFilterableQuestionResults?: NonFilterableQuestionResult[]
  // Convenience: overall score computed on the client as the sum of individual scores
  overallScore?: number
}
