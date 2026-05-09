<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PropertyList from '../components/PropertyList.vue'
import SearchBar from '../components/SearchBar.vue'
import { createMockStartSearch, resolveMockModeFromQuery } from '../services/mockSearch'
import { createHomeSearchController } from './homeSearchController'
import MapView, { type MapMarker } from '../components/MapView.vue'

const route = useRoute()
const router = useRouter()

const mockMode =
  typeof window !== 'undefined' ? resolveMockModeFromQuery(window.location.search) : null

const { properties, isLoading, hasSearched, loadingText, handleSearch, dispose } =
  createHomeSearchController(mockMode ? createMockStartSearch({ mode: mockMode }) : undefined)

const currentQuery = computed(() => {
  const q = route.query.q
  return typeof q === 'string' ? q : ''
})

const runSearchForRoute = () => {
  const q = currentQuery.value.trim()
  if (!q) return
  void handleSearch(q)
}

const onSubmit = (query: string) => {
  const trimmed = query.trim()
  if (!trimmed) return
  if (trimmed === currentQuery.value) {
    void handleSearch(trimmed)
    return
  }
  // URL change triggers the watcher below, which kicks off the search.
  const passthrough: Record<string, string> = {}
  for (const [key, value] of Object.entries(route.query)) {
    if (typeof value === 'string' && key !== 'q') passthrough[key] = value
  }
  router.replace({ name: 'search', query: { ...passthrough, q: trimmed } })
}

const goHome = () => {
  const passthrough: Record<string, string> = {}
  for (const [key, value] of Object.entries(route.query)) {
    if (typeof value === 'string' && key !== 'q') passthrough[key] = value
  }
  router.push({ name: 'home', query: passthrough })
}

watch(
  () => currentQuery.value,
  () => {
    runSearchForRoute()
  },
)

onMounted(() => {
  if (!currentQuery.value) {
    // Refresh on /search with no query: bounce back home.
    router.replace({ name: 'home' })
    return
  }
  runSearchForRoute()
})

onUnmounted(() => {
  dispose()
})

// Try to bias the map toward the city mentioned in the query (cheap heuristic).
const cityHint = computed(() => {
  const q = currentQuery.value.toLowerCase()
  const cities: Record<string, [number, number]> = {
    vienna: [16.3738, 48.2082],
    wien: [16.3738, 48.2082],
    augsburg: [10.8978, 48.3705],
    berlin: [13.405, 52.52],
    munich: [11.582, 48.1351],
    münchen: [11.582, 48.1351],
    hamburg: [9.9937, 53.5511],
  }
  for (const name of Object.keys(cities)) {
    if (q.includes(name)) return { name, center: cities[name] }
  }
  return null
})

const mapCenter = computed<[number, number]>(() =>
  cityHint.value ? cityHint.value.center : [10.4515, 51.1657],
)
const mapZoom = computed(() => (cityHint.value ? 11 : 4.5))

// Deterministic hash so the same property always lands at the same dummy spot.
const hashString = (input: string): number => {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// TODO: replace with real coordinates from the backend.
const markers = computed<MapMarker[]>(() => {
  const [centerLng, centerLat] = mapCenter.value
  const spread = cityHint.value ? 0.04 : 1.2 // ~4km in city, country-wide otherwise
  return properties.value.map((p) => {
    const h = hashString(p.id)
    const dx = ((h & 0xffff) / 0xffff - 0.5) * 2 * spread
    const dy = (((h >>> 16) & 0xffff) / 0xffff - 0.5) * 2 * spread
    return {
      id: p.id,
      lng: centerLng + dx,
      lat: centerLat + dy,
      label: p.title,
    }
  })
})

const hoveredId = ref<string | null>(null)
const setHovered = (id: string | null) => {
  hoveredId.value = id
}

// Mobile-only: toggle between results list and full-screen map.
const showMobileMap = ref(false)
const openMobileMap = () => {
  showMobileMap.value = true
}
const closeMobileMap = () => {
  showMobileMap.value = false
}

// Selecting a marker should: highlight the property, dismiss the mobile map
// overlay (desktop is unaffected), and scroll the corresponding card into view.
const onMarkerSelect = (id: string) => {
  hoveredId.value = id
  const wasMobileMap = showMobileMap.value
  if (wasMobileMap) closeMobileMap()
  // Wait for the overlay to unmount so the list is in the layout again.
  void nextTick(() => {
    const el = document.querySelector<HTMLElement>(`[data-property-id="${CSS.escape(id)}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[#f7f3ec] text-[#1c1a17] lg:h-screen">
    <!-- Top brand bar -->
    <header class="shrink-0 border-b border-[#e6e0d6]">
      <div
        class="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 text-xs uppercase tracking-[0.28em] text-[#8a8278]"
      >
        <button
          type="button"
          class="font-serif text-xl font-medium normal-case tracking-tight text-[#1c1a17] hover:text-[#8b6f47]"
          @click="goHome"
        >
          myBnB
        </button>
        <span class="hidden sm:inline">Curated Stays · Short &amp; Long Term</span>
        <span>Worldwide</span>
      </div>
    </header>

    <div class="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
      <!-- Left: search + results.
           Mobile: regular page-flow scrolling so the brand header scrolls away.
           Desktop: independent scroll container next to the always-visible map. -->
      <section
        class="flex flex-1 flex-col border-b border-[#e6e0d6] lg:min-h-0 lg:max-w-[640px] lg:overflow-y-auto lg:border-b-0 lg:border-r"
      >
        <div
          class="sticky top-0 z-10 border-b border-[#e6e0d6] bg-[#f7f3ec]/95 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-6"
        >
          <SearchBar :isLoading="isLoading" :initialQuery="currentQuery" @search="onSubmit" />
          <div class="mt-1 min-h-[1.25rem] sm:mt-3">
            <transition name="loading-fade" mode="out-in">
              <span
                v-if="isLoading"
                :key="loadingText"
                class="block font-serif text-base italic text-[#8b6f47]"
              >
                {{ loadingText }}
              </span>
              <span
                v-else-if="hasSearched"
                key="result-count"
                class="block text-[11px] uppercase tracking-[0.32em] text-[#8a8278]"
              >
                {{ properties.length }} properties found
              </span>
            </transition>
          </div>
        </div>

        <div class="flex-1 pb-6 sm:px-6 sm:pt-6">
          <PropertyList
            :properties="properties"
            :isLoading="isLoading"
            :highlightedId="hoveredId"
            @hover="setHovered"
          />
        </div>
      </section>

      <!-- Right: map.
           Desktop (lg+): always visible, side-by-side with the list.
           Mobile: hidden by default, toggled via the floating "Show map" button
           into a fixed full-screen overlay. -->
      <section
        :class="[
          'relative flex-1',
          showMobileMap
            ? 'fixed inset-0 z-40 bg-[#f7f3ec] lg:static lg:inset-auto lg:z-auto'
            : 'hidden lg:block lg:min-h-0',
        ]"
      >
        <MapView
          :center="mapCenter"
          :zoom="mapZoom"
          :markers="markers"
          :highlightedId="hoveredId"
          @hover="setHovered"
          @select="onMarkerSelect"
        />

        <!-- Mobile-only: dismiss the map overlay. -->
        <button
          v-if="showMobileMap"
          type="button"
          class="absolute right-4 top-4 z-10 flex items-center gap-2 border border-[#1c1a17] bg-[#f7f3ec]/95 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#1c1a17] shadow-sm backdrop-blur-sm transition-colors hover:bg-[#1c1a17] hover:text-[#f7f3ec] lg:hidden"
          @click="closeMobileMap"
          aria-label="Show list"
        >
          <span aria-hidden="true">×</span>
          Show list
        </button>
      </section>
    </div>

    <!-- Mobile-only: floating "Show map" button. -->
    <button
      v-if="!showMobileMap"
      type="button"
      class="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 border border-[#1c1a17] bg-[#1c1a17] px-5 py-3 text-[11px] font-medium uppercase tracking-[0.28em] text-[#f7f3ec] shadow-lg transition-colors hover:bg-[#8b6f47] lg:hidden"
      @click="openMobileMap"
    >
      <span aria-hidden="true" class="h-1.5 w-1.5 rotate-45 bg-[#8b6f47]"></span>
      Show map
    </button>
  </div>
</template>

<style scoped>
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}
.loading-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.loading-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
