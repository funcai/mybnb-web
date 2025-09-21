import type { Apartment, NonFilterableQuestionResult } from '../types/property'

function isNonFilterableQuestionResult(value: unknown): value is NonFilterableQuestionResult {
  if (!value || typeof value !== 'object') return false
  const rec = value as Record<string, unknown>
  return (
    typeof rec.nonFilterableQuestionId === 'string' &&
    typeof rec.score === 'number'
  )
}

// Normalize SSE update payloads to an array of Apartment items.
// Assumes the payload is always Array<{ apartment: Apartment }>.
export function normalizeUpdateToApartments(payload: unknown): Apartment[] {
  if (!Array.isArray(payload)) return []
  const result: Apartment[] = []
  for (const item of payload) {
    if (item && typeof item === 'object' && 'apartment' in (item as Record<string, unknown>)) {
      const a = (item as { apartment: unknown }).apartment
      if (a && typeof a === 'object') {
        const ap: Apartment = { ...(a as Apartment) }
        const nqr = (item as { nonFilterableQuestionResults?: unknown }).nonFilterableQuestionResults
        if (Array.isArray(nqr)) {
          const typed: NonFilterableQuestionResult[] = nqr.filter(isNonFilterableQuestionResult)
          ap.nonFilterableQuestionResults = typed
          ap.overallScore = typed.reduce((sum, it) => sum + (typeof it.score === 'number' ? it.score : 0), 0)
        }
        result.push(ap)
      }
    }
  }
  return result
}

export function upsertById(existing: Apartment[], items: Apartment[]): Apartment[] {
  const map = new Map(existing.map((a) => [a.id, a]))
  for (const it of items) {
    map.set(it.id, it)
  }
  return Array.from(map.values())
}
