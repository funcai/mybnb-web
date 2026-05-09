import type { MapMarker } from './MapView.vue'

export const markerViewportSignature = (markers: MapMarker[]): string =>
  markers
    .map((marker) => `${marker.id}:${marker.lng.toFixed(6)}:${marker.lat.toFixed(6)}`)
    .sort()
    .join('|')

export const markerBounds = (markers: MapMarker[]): [[number, number], [number, number]] | null => {
  if (markers.length === 0) {
    return null
  }

  let west = markers[0].lng
  let east = markers[0].lng
  let south = markers[0].lat
  let north = markers[0].lat

  for (const marker of markers.slice(1)) {
    west = Math.min(west, marker.lng)
    east = Math.max(east, marker.lng)
    south = Math.min(south, marker.lat)
    north = Math.max(north, marker.lat)
  }

  return [
    [west, south],
    [east, north],
  ]
}
