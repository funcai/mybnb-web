import type { Property } from '../types/property'

const mockProperties: Property[] = [
  {
    id: '6866f1ce150abac3dfb5f27e',
    listingId: '68108fb88c669876ae4b0218',
    provider: 'wunderflats',
    url: 'https://wunderflats.com/en/furnished-apartment/stylishly-furnished-48-m-apartment-in-the-heart-of-mannheim-ideal-for-business-travelers-expats-and-students/68108fb88c669876ae4b0218',
    location: {
      type: 'Point',
      coordinates: [8.4642, 49.4875],
    },
    address: {
      street: 'Windmühlstraße',
      postalCode: '68165',
      city: 'Mannheim',
      country: 'DE',
    },
    facts: {
      area_m2: 48,
      rooms: 1,
      beds: 1,
      rent_monthly: 1250,
      deposit: 1000,
      currency: 'EUR',
      furnished: true,
    },
  },
  {
    id: '6866f1ce150abac3dfb5f27f',
    listingId: '68108fb88c669876ae4b0219',
    provider: 'wunderflats',
    url: 'https://wunderflats.com/en/furnished-apartment/modern-loft-berlin-mitte',
    location: {
      type: 'Point',
      coordinates: [13.405, 52.52],
    },
    address: {
      street: 'Rosenthaler Straße',
      postalCode: '10119',
      city: 'Berlin',
      country: 'DE',
    },
    facts: {
      area_m2: 65,
      rooms: 2,
      beds: 1,
      rent_monthly: 1800,
      deposit: 1500,
      currency: 'EUR',
      furnished: true,
    },
  },
  {
    id: '6866f1ce150abac3dfb5f280',
    listingId: '68108fb88c669876ae4b021a',
    provider: 'wunderflats',
    url: 'https://wunderflats.com/en/furnished-apartment/cozy-studio-munich-center',
    location: {
      type: 'Point',
      coordinates: [11.582, 48.1351],
    },
    address: {
      street: 'Maximilianstraße',
      postalCode: '80539',
      city: 'Munich',
      country: 'DE',
    },
    facts: {
      area_m2: 35,
      rooms: 1,
      beds: 1,
      rent_monthly: 1600,
      deposit: 1200,
      currency: 'EUR',
      furnished: true,
    },
  },
  {
    id: '6866f1ce150abac3dfb5f281',
    listingId: '68108fb88c669876ae4b021b',
    provider: 'wunderflats',
    url: 'https://wunderflats.com/en/furnished-apartment/spacious-apartment-hamburg',
    location: {
      type: 'Point',
      coordinates: [9.9937, 53.5511],
    },
    address: {
      street: 'Eppendorfer Weg',
      postalCode: '20259',
      city: 'Hamburg',
      country: 'DE',
    },
    facts: {
      area_m2: 78,
      rooms: 3,
      beds: 2,
      rent_monthly: 2200,
      deposit: 1800,
      currency: 'EUR',
      furnished: true,
    },
  },
  {
    id: '6866f1ce150abac3dfb5f282',
    listingId: '68108fb88c669876ae4b021c',
    provider: 'wunderflats',
    url: 'https://wunderflats.com/en/furnished-apartment/elegant-flat-cologne',
    location: {
      type: 'Point',
      coordinates: [6.9603, 50.9375],
    },
    address: {
      street: 'Hohenzollernring',
      postalCode: '50672',
      city: 'Cologne',
      country: 'DE',
    },
    facts: {
      area_m2: 55,
      rooms: 2,
      beds: 1,
      rent_monthly: 1400,
      deposit: 1100,
      currency: 'EUR',
      furnished: true,
    },
  },
  {
    id: '6866f1ce150abac3dfb5f283',
    listingId: '68108fb88c669876ae4b021d',
    provider: 'wunderflats',
    url: 'https://wunderflats.com/en/furnished-apartment/modern-studio-frankfurt',
    location: {
      type: 'Point',
      coordinates: [8.6821, 50.1109],
    },
    address: {
      street: 'Kaiserstraße',
      postalCode: '60311',
      city: 'Frankfurt',
      country: 'DE',
    },
    facts: {
      area_m2: 42,
      rooms: 1,
      beds: 1,
      rent_monthly: 1700,
      deposit: 1300,
      currency: 'EUR',
      furnished: true,
    },
  },
  {
    id: '6866f1ce150abac3dfb5f284',
    listingId: '68108fb88c669876ae4b021e',
    provider: 'wunderflats',
    url: 'https://wunderflats.com/en/furnished-apartment/luxury-penthouse-düsseldorf',
    location: {
      type: 'Point',
      coordinates: [6.7735, 51.2277],
    },
    address: {
      street: 'Königsallee',
      postalCode: '40212',
      city: 'Düsseldorf',
      country: 'DE',
    },
    facts: {
      area_m2: 95,
      rooms: 3,
      beds: 2,
      rent_monthly: 2800,
      deposit: 2200,
      currency: 'EUR',
      furnished: true,
    },
  },
  {
    id: '6866f1ce150abac3dfb5f285',
    listingId: '68108fb88c669876ae4b021f',
    provider: 'wunderflats',
    url: 'https://wunderflats.com/en/furnished-apartment/charming-apartment-stuttgart',
    location: {
      type: 'Point',
      coordinates: [9.1829, 48.7758],
    },
    address: {
      street: 'Königstraße',
      postalCode: '70173',
      city: 'Stuttgart',
      country: 'DE',
    },
    facts: {
      area_m2: 60,
      rooms: 2,
      beds: 1,
      rent_monthly: 1550,
      deposit: 1200,
      currency: 'EUR',
      furnished: true,
    },
  },
  {
    id: '6866f1ce150abac3dfb5f286',
    listingId: '68108fb88c669876ae4b0220',
    provider: 'wunderflats',
    url: 'https://wunderflats.com/en/furnished-apartment/minimalist-loft-leipzig',
    location: {
      type: 'Point',
      coordinates: [12.3731, 51.3397],
    },
    address: {
      street: 'Augustusplatz',
      postalCode: '04109',
      city: 'Leipzig',
      country: 'DE',
    },
    facts: {
      area_m2: 52,
      rooms: 2,
      beds: 1,
      rent_monthly: 1100,
      deposit: 900,
      currency: 'EUR',
      furnished: true,
    },
  },
  {
    id: '6866f1ce150abac3dfb5f287',
    listingId: '68108fb88c669876ae4b0221',
    provider: 'wunderflats',
    url: 'https://wunderflats.com/en/furnished-apartment/cozy-flat-nuremberg',
    location: {
      type: 'Point',
      coordinates: [11.0767, 49.4521],
    },
    address: {
      street: 'Hauptmarkt',
      postalCode: '90403',
      city: 'Nuremberg',
      country: 'DE',
    },
    facts: {
      area_m2: 45,
      rooms: 1,
      beds: 1,
      rent_monthly: 1300,
      deposit: 1000,
      currency: 'EUR',
      furnished: true,
    },
  },
]

// Mock implementation – kept for local testing
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const searchPropertiesMock = async (_query: string): Promise<Property[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockProperties
}

// Production implementation – calls RunPod runsync endpoint
export const searchProperties = async (query: string): Promise<Property[]> => {
  const endpointId = import.meta.env.VITE_RUNPOD_ENDPOINT_ID
  const apiKey = import.meta.env.VITE_RUNPOD_API_KEY

  // Fallback to mock if env vars are missing
  if (!endpointId || !apiKey) {
    console.warn('RunPod env variables missing – falling back to mock search')
    return searchPropertiesMock(query)
  }

  try {
    const response = await fetch(`https://api.runpod.ai/v2/${endpointId}/runsync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input: { query } }),
    })

    if (!response.ok) {
      throw new Error(`RunPod request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Expecting the model to return an array of properties in data.output
    if (data?.output && Array.isArray(data.output)) {
      return data.output as Property[]
    }

    console.warn('Unexpected RunPod response format – falling back to mock search', data)
    return searchPropertiesMock(query)
  } catch (err) {
    console.error('RunPod search error – falling back to mock search', err)
    return searchPropertiesMock(query)
  }
}

export const getPropertyById = async (id: string): Promise<Property | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const property = mockProperties.find((p) => p.id === id)
  return property || null
}
