<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PropertyList from '../components/PropertyList.vue'
import SearchBar from '../components/SearchBar.vue'
import SearchProgressDisplay from '../components/SearchProgressDisplay.vue'
import { createSearch as defaultCreateSearch } from '../services/api'
import {
  createMockCreateSearch,
  createMockSubscribeToSearch,
  resolveMockModeFromQuery,
} from '../services/mockSearch'
import { buildSearchRoute } from '../router/searchRoute'
import { createHomeSearchController } from './homeSearchController'
import {
  locationFallbackZoom,
  locationHintBounds,
  locationHintCenter,
  propertyCoordinateCenter,
  worldCenter,
  worldZoom,
} from './searchMapViewport'
import MapView, { type MapMarker } from '../components/MapView.vue'

const route = useRoute()
const router = useRouter()

const mockMode =
  typeof window !== 'undefined' ? resolveMockModeFromQuery(window.location.search) : null
const createSearch = mockMode ? createMockCreateSearch() : defaultCreateSearch

const {
  properties,
  mlQuestions,
  enabledQuestionIds,
  isLoading,
  hasSearched,
  loadingText,
  searchProgress,
  locationHint,
  connectToSearch,
  toggleQuestionFilter,
  dispose,
} = createHomeSearchController(
  mockMode ? createMockSubscribeToSearch({ mode: mockMode }) : undefined,
)

const currentQuery = computed(() => {
  const q = route.query.q
  return typeof q === 'string' ? q : ''
})

const currentRequestId = computed(() => {
  const requestId = route.params.requestId
  return typeof requestId === 'string' ? requestId : ''
})

const connectToRouteRequest = () => {
  const requestId = currentRequestId.value.trim()
  if (!requestId) {
    router.replace({ name: 'home' })
    return
  }
  void connectToSearch(requestId)
}

const onSubmit = async (query: string) => {
  const trimmed = query.trim()
  if (!trimmed) return
  const passthrough: Record<string, string> = {}
  for (const [key, value] of Object.entries(route.query)) {
    if (typeof value === 'string' && key !== 'q') passthrough[key] = value
  }
  try {
    const requestId = await createSearch(trimmed)
    router.replace(buildSearchRoute(requestId, trimmed, passthrough))
  } catch (error) {
    console.error('Failed to create search:', error)
  }
}

const goHome = () => {
  const passthrough: Record<string, string> = {}
  for (const [key, value] of Object.entries(route.query)) {
    if (typeof value === 'string' && key !== 'q') passthrough[key] = value
  }
  router.push({ name: 'home', query: passthrough })
}

watch(
  () => currentRequestId.value,
  () => {
    connectToRouteRequest()
  },
)

onMounted(() => {
  connectToRouteRequest()
})

onUnmounted(() => {
  dispose()
})

const propertyCoordinates = computed(() =>
  properties.value.filter((property) => property.coordinates !== undefined),
)

const mapCenter = computed<[number, number]>(() => {
  return (
    propertyCoordinateCenter(properties.value) ??
    locationHintCenter(locationHint.value) ??
    worldCenter
  )
})
const mapBounds = computed(() =>
  propertyCoordinates.value.length > 0 ? null : locationHintBounds(locationHint.value),
)
const mapZoom = computed(() =>
  propertyCoordinates.value.length > 0 || locationHintCenter(locationHint.value)
    ? locationFallbackZoom
    : worldZoom,
)

const markers = computed<MapMarker[]>(() =>
  propertyCoordinates.value.map((property) => ({
    id: property.id,
    lng: property.coordinates?.lng ?? 0,
    lat: property.coordinates?.lat ?? 0,
    label: property.title,
  })),
)

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
          42 eyes
        </button>
        <span class="hidden sm:inline">Find the exact apartment you're looking for</span>
        <span>Worldwide</span>
      </div>
    </header>

    <div class="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
      <!-- Left: search + results.
           Mobile: regular page-flow scrolling so the brand header scrolls away.
           Desktop: independent scroll container next to the always-visible map. -->
      <section
        class="flex flex-1 flex-col border-b border-[#e6e0d6] lg:min-h-0 lg:w-full lg:max-w-[850px] lg:flex-none lg:overflow-y-auto lg:border-b-0 lg:border-r"
      >
        <div
          class="sticky top-0 z-10 border-b border-[#e6e0d6] bg-[#f7f3ec]/95 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-6"
        >
          <SearchBar :isLoading="isLoading" :initialQuery="currentQuery" @search="onSubmit" />
          <div class="mt-3 sm:mt-4">
            <SearchProgressDisplay
              :isLoading="isLoading"
              :hasSearched="hasSearched"
              :progress="searchProgress"
              :loadingText="loadingText"
              :resultsCount="properties.length"
            />
          </div>
          <div v-if="mlQuestions.length > 0" class="mt-4 flex flex-wrap gap-2">
            <label
              v-for="question in mlQuestions"
              :key="question.id"
              class="inline-flex cursor-pointer items-center gap-2 border px-2.5 py-1.5 text-[11px] leading-snug transition-colors"
              :class="
                enabledQuestionIds.has(question.id)
                  ? 'border-[#8b6f47] bg-[#8b6f47]/10 text-[#6f5836]'
                  : 'border-[#d8cfc0] bg-white/45 text-[#8a8278]'
              "
            >
              <input
                type="checkbox"
                class="h-3.5 w-3.5 accent-[#8b6f47]"
                :checked="enabledQuestionIds.has(question.id)"
                @change="toggleQuestionFilter(question.id)"
              />
              <span>{{ question.question }}</span>
            </label>
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
          'flex-1',
          showMobileMap
            ? 'fixed inset-x-0 bottom-0 top-[40dvh] z-40 bg-[#f7f3ec] shadow-[0_-12px_32px_rgba(28,26,23,0.18)] lg:relative lg:inset-auto lg:top-auto lg:z-auto lg:shadow-none'
            : 'relative hidden lg:block lg:min-h-0',
        ]"
      >
        <MapView
          :center="mapCenter"
          :zoom="mapZoom"
          :bounds="mapBounds"
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
