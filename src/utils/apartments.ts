import type { Apartment } from '../types/property'

// Normalize SSE update payloads to an array of Apartment items.
// Assumes the payload is always Array<{ apartment: Apartment }>.
export function normalizeUpdateToApartments(payload: unknown): Apartment[] {
  if (!Array.isArray(payload)) return []
  const result: Apartment[] = []
  for (const item of payload) {
    if (item && typeof item === 'object' && 'apartment' in (item as Record<string, unknown>)) {
      const a = (item as { apartment: unknown }).apartment
      if (a && typeof a === 'object') result.push(a as Apartment)
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
