<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export type MapMarker = {
  id: string
  lng: number
  lat: number
  label?: string
}

const props = withDefaults(
  defineProps<{
    center?: [number, number]
    zoom?: number
    markers?: MapMarker[]
    highlightedId?: string | null
  }>(),
  {
    center: () => [10.4515, 51.1657],
    zoom: 4.5,
    markers: () => [],
    highlightedId: null,
  },
)

const emit = defineEmits<{
  hover: [id: string | null]
  select: [id: string]
}>()

const container = ref<HTMLDivElement | null>(null)
let map: MapLibreMap | null = null
let mapReady = false
let resizeObserver: ResizeObserver | null = null
const markerInstances = new Map<string, { marker: Marker; el: HTMLElement }>()

const buildMarkerElement = (marker: MapMarker): HTMLElement => {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = 'mybnb-marker'
  el.setAttribute('aria-label', marker.label ?? 'Property')
  el.dataset.id = marker.id
  el.innerHTML = '<span class="mybnb-marker__pin"></span>'
  el.addEventListener('mouseenter', () => emit('hover', marker.id))
  el.addEventListener('mouseleave', () => emit('hover', null))
  el.addEventListener('focus', () => emit('hover', marker.id))
  el.addEventListener('blur', () => emit('hover', null))
  el.addEventListener('click', (e) => {
    e.stopPropagation()
    emit('select', marker.id)
  })
  return el
}

const syncMarkers = () => {
  if (!map || !mapReady) return
  const incomingIds = new Set(props.markers.map((m) => m.id))

  for (const [id, entry] of markerInstances) {
    if (!incomingIds.has(id)) {
      entry.marker.remove()
      markerInstances.delete(id)
    }
  }

  for (const m of props.markers) {
    const existing = markerInstances.get(m.id)
    if (existing) {
      existing.marker.setLngLat([m.lng, m.lat])
      continue
    }
    const el = buildMarkerElement(m)
    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([m.lng, m.lat])
      .addTo(map)
    markerInstances.set(m.id, { marker, el })
  }

  applyHighlight()
}

const applyHighlight = () => {
  for (const [id, entry] of markerInstances) {
    entry.el.classList.toggle('is-highlighted', id === props.highlightedId)
  }
}

onMounted(() => {
  if (!container.value) return
  map = new maplibregl.Map({
    container: container.value,
    // OpenFreeMap public style — see https://openfreemap.org/quick_start/
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: props.center,
    zoom: props.zoom,
    attributionControl: { compact: true },
  })
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
  map.on('load', () => {
    mapReady = true
    syncMarkers()
  })

  // Maplibre listens to window resize but not to its container's size changing
  // (e.g. when toggled from display:none to visible on mobile).
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      map?.resize()
    })
    resizeObserver.observe(container.value)
  }
})

watch(
  () => [props.center?.[0], props.center?.[1], props.zoom] as const,
  ([lng, lat, zoom]) => {
    if (!map || lng === undefined || lat === undefined) return
    map.flyTo({ center: [lng, lat], zoom: zoom ?? props.zoom, essential: true })
  },
)

watch(() => props.markers, syncMarkers, { deep: true })
watch(() => props.highlightedId, applyHighlight)

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  for (const entry of markerInstances.values()) entry.marker.remove()
  markerInstances.clear()
  map?.remove()
  map = null
  mapReady = false
})
</script>

<template>
  <div ref="container" class="absolute inset-0 h-full w-full"></div>
</template>

<style scoped>
:deep(.maplibregl-ctrl-attrib) {
  background: rgba(247, 243, 236, 0.8);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 10px;
}
:deep(.maplibregl-ctrl-group) {
  border-radius: 0;
  box-shadow: none;
  border: 1px solid #e6e0d6;
  background: #ffffff;
}
:deep(.maplibregl-ctrl-group button) {
  border-radius: 0;
}
</style>

<style>
/* Unscoped: markers are injected via raw DOM by maplibre. */
.mybnb-marker {
  appearance: none;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  width: 22px;
  height: 30px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  /* No transition here — maplibre writes `transform: translate(...)` on this
     element every frame to position the marker. Animating it would cause lag. */
}
.mybnb-marker__pin {
  width: 18px;
  height: 18px;
  background: #1c1a17;
  border: 2px solid #f7f3ec;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  display: block;
  transform-origin: 50% 100%;
  transform: rotate(45deg) translate(-2px, 2px);
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}
.mybnb-marker:hover .mybnb-marker__pin,
.mybnb-marker.is-highlighted .mybnb-marker__pin {
  background: #8b6f47;
  box-shadow:
    0 0 0 4px rgba(139, 111, 71, 0.25),
    0 4px 8px rgba(0, 0, 0, 0.25);
}
.mybnb-marker.is-highlighted .mybnb-marker__pin {
  transform: rotate(45deg) translate(-2px, 2px) scale(1.18);
}
.mybnb-marker.is-highlighted {
  z-index: 2;
}
</style>
