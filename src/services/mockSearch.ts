import type { Property } from '../types/property'
import type { SearchHandlers } from './api'

const sampleProperties: Property[] = [
  {
    id: 'mock-1',
    provider: 'Wunderflats',
    sourceUrl: 'https://example.com/listings/vienna-altbau-loft',
    title: 'Sunlit Altbau Loft near Naschmarkt',
    description:
      'A meticulously restored Viennese Altbau apartment with stucco ceilings, herringbone parquet, and floor-to-ceiling windows overlooking a quiet courtyard.',
    imageUrl:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=75',
    coordinates: { lat: 48.1992, lng: 16.3645 },
    attributes: [
      { key: 'city', label: 'City', value: 'Vienna' },
      { key: 'price', label: 'Monthly rent', value: '€1,420' },
      { key: 'rooms', label: 'Rooms', value: '2' },
      { key: 'size', label: 'Size', value: '64 m²' },
      { key: 'furnished', label: 'Furnished', value: 'Yes' },
    ],
    questionScores: [
      { questionId: 'q1', question: 'Walk-in shower', score: 0.92 },
      { questionId: 'q2', question: 'Under €1500/month', score: 1 },
      { questionId: 'q3', question: 'Located in Vienna', score: 1 },
    ],
  },
  {
    id: 'mock-2',
    provider: 'Spotahome',
    sourceUrl: 'https://example.com/listings/augsburg-dining-suite',
    title: 'Refined Suite with Generous Dining Room',
    description:
      'Designer furnishings, a solid oak dining table seating six, and a private balcony with views over Augsburg’s historic rooftops.',
    imageUrl:
      'https://images.unsplash.com/photo-1615803796379-b4cda8e9c09c?auto=format&fit=crop&w=900&q=75',
    coordinates: { lat: 48.3697, lng: 10.8988 },
    attributes: [
      { key: 'city', label: 'City', value: 'Augsburg' },
      { key: 'price', label: 'Monthly rent', value: '€1,680' },
      { key: 'rooms', label: 'Rooms', value: '3' },
      { key: 'size', label: 'Size', value: '82 m²' },
    ],
    questionScores: [
      { questionId: 'q1', question: 'Dining table for 4+', score: 0.97 },
      { questionId: 'q2', question: 'Under €1700/month', score: 1 },
      { questionId: 'q3', question: 'Located in Augsburg', score: 1 },
    ],
  },
  {
    id: 'mock-3',
    provider: 'Homelike',
    sourceUrl: 'https://example.com/listings/vienna-high-bed-studio',
    title: 'Minimalist Studio with High Platform Bed',
    description: '',
    imageUrl:
      'https://images.unsplash.com/photo-1528914137830-c85ee162f588?auto=format&fit=crop&w=900&q=75',
    coordinates: { lat: 48.2121, lng: 16.3764 },
    attributes: [
      { key: 'city', label: 'City', value: 'Vienna' },
      { key: 'price', label: 'Monthly rent', value: '€1,150' },
      { key: 'rooms', label: 'Rooms', value: '1' },
    ],
    questionScores: [
      { questionId: 'q1', question: 'High bed', score: 0.81 },
      { questionId: 'q2', question: 'Under €1200/month', score: 1 },
    ],
  },
]

export type MockMode = 'results' | 'empty' | 'loading'

type MockOptions = {
  mode?: MockMode
  delayMs?: number
  streamStepMs?: number
}

export const createMockCreateSearch = () => async (): Promise<string> => 'mock-request'

export const createMockSubscribeToSearch = (options: MockOptions = {}) => {
  const { mode = 'results', delayMs = 600, streamStepMs = 350 } = options

  return async (_requestId: string, handlers: SearchHandlers): Promise<() => void> => {
    let cancelled = false
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        if (!cancelled) fn()
      }, ms)
      timeouts.push(t)
    }

    schedule(
      () =>
        handlers.onAccepted?.({
          requestId: 'mock-request',
          request: { status: 'pending' },
          state: {
            foundApartments: 0,
            returnedApartmentsToFrontend: 0,
            requestedApartmentsForInvestigation: 0,
          },
        }),
      50,
    )

    if (mode === 'loading') {
      // Never completes — useful for previewing the loading state.
      return () => {
        cancelled = true
        timeouts.forEach(clearTimeout)
      }
    }

    const finalProperties = mode === 'empty' ? [] : sampleProperties

    // Stream properties in one by one to mimic a live search.
    finalProperties.forEach((_, i) => {
      schedule(
        () => {
          handlers.onUpdate?.(finalProperties.slice(0, i + 1))
          handlers.onRequest?.({
            requestId: 'mock-request',
            request: { status: 'running' },
            state: {
              foundApartments: finalProperties.length,
              returnedApartmentsToFrontend: i + 1,
              requestedApartmentsForInvestigation: finalProperties.length,
            },
          })
        },
        delayMs + i * streamStepMs,
      )
    })

    schedule(
      () => {
        handlers.onUpdate?.(finalProperties)
        handlers.onRequest?.({
          requestId: 'mock-request',
          request: { status: 'completed' },
          state: {
            foundApartments: finalProperties.length,
            returnedApartmentsToFrontend: finalProperties.length,
            requestedApartmentsForInvestigation: finalProperties.length,
          },
        })
      },
      delayMs + finalProperties.length * streamStepMs + 100,
    )

    return () => {
      cancelled = true
      timeouts.forEach(clearTimeout)
    }
  }
}

export const resolveMockModeFromQuery = (search: string): MockMode | null => {
  const params = new URLSearchParams(search)
  const value = params.get('mock')
  if (value === null) return null
  if (value === 'empty') return 'empty'
  if (value === 'loading') return 'loading'
  // `?mock`, `?mock=1`, `?mock=results`, etc.
  return 'results'
}
