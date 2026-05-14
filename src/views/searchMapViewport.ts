import type { AgentLocationHint } from '../types/agent'
import type { Property } from '../types/property'

export type MapBounds = [[number, number], [number, number]]

export const worldCenter: [number, number] = [0, 20]
export const worldZoom = 1.5
export const locationFallbackZoom = 11

const isValidLat = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90

const isValidLng = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180

export const locationHintCenter = (
  locationHint?: AgentLocationHint | null,
): [number, number] | null => {
  const lat = locationHint?.center?.lat
  const lng = locationHint?.center?.lng
  if (!isValidLat(lat) || !isValidLng(lng)) {
    return null
  }
  return [lng, lat]
}

export const locationHintBounds = (locationHint?: AgentLocationHint | null): MapBounds | null => {
  const bbox = locationHint?.bbox
  if (!bbox) {
    return null
  }
  if (
    !isValidLat(bbox.south) ||
    !isValidLat(bbox.north) ||
    !isValidLng(bbox.west) ||
    !isValidLng(bbox.east) ||
    bbox.south > bbox.north ||
    bbox.west > bbox.east
  ) {
    return null
  }
  return [
    [bbox.west, bbox.south],
    [bbox.east, bbox.north],
  ]
}

export const propertyCoordinateCenter = (properties: Property[]): [number, number] | null => {
  const propertyCoordinates = properties.filter((property) => property.coordinates !== undefined)
  if (propertyCoordinates.length === 0) {
    return null
  }
  const totals = propertyCoordinates.reduce(
    (acc, property) => {
      acc.lng += property.coordinates?.lng ?? 0
      acc.lat += property.coordinates?.lat ?? 0
      return acc
    },
    { lng: 0, lat: 0 },
  )
  return [totals.lng / propertyCoordinates.length, totals.lat / propertyCoordinates.length]
}
