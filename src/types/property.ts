// New types aligned with updated backend response
export interface ApartmentAttribute {
  key: string
  value: string | number | boolean
}

export interface ApartmentImage {
  id: string
  url: string
}

export interface Apartment {
  id: string
  provider: string
  providerId: string
  sourceUrl: string
  attributes: ApartmentAttribute[]
  description: string
  images: ApartmentImage[]
}
