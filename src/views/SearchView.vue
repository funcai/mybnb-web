<script setup lang="ts">
import { ref, onUnmounted, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchBar from '../components/SearchBar.vue'
import PropertyList from '../components/PropertyList.vue'
import LoadingAnimation from '../components/LoadingAnimation.vue'
import type { Apartment } from '../types/property'
import { createSearchRequest, streamRequestById } from '../services/api'
import { normalizeUpdateToApartments, upsertById } from '../utils/apartments'

const route = useRoute()
const router = useRouter()

const apartments = ref<Apartment[]>([])
const isLoading = ref(true)
const loadingText = ref('Starting your apartment search…')

const loadingMessages = [
  'Looking under beds for dust…',
  'Fluffing the pillows…',
  'Peeking behind curtains… just in case',
  'Inspecting for creaky floorboards…',
  'Preheating the towel rack…',
  'Counting spoons in the cutlery drawer…',
  'Defrosting the freezer compartment…',
  'Checking the water pressure in the shower…',
  'Wiping fingerprints off the fridge door…',
]

let loadingInterval: number | null = null
let sseController: AbortController | null = null

const startLoadingTextAnimation = () => {
  loadingText.value = 'Starting your apartment search…'

  loadingInterval = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * loadingMessages.length)
    loadingText.value = loadingMessages[randomIndex]
  }, 5000)
}

const stopLoadingTextAnimation = () => {
  if (loadingInterval) {
    clearInterval(loadingInterval)
    loadingInterval = null
  }
  loadingText.value = 'Discover amazing places to stay'
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function startStreamingForRequestId(requestId: string) {
  // Abort any previous stream loop
  if (sseController) {
    sseController.abort()
    sseController = null
  }

  // Initial state for a fresh request
  apartments.value = []
  isLoading.value = true
  startLoadingTextAnimation()

  const controller = new AbortController()
  sseController = controller
  let attempt = 0

  while (sseController === controller) {
    try {
      await streamRequestById(
        requestId,
        (data) => {
          const newItems = normalizeUpdateToApartments(data)
          if (newItems.length > 0) {
            apartments.value = upsertById(apartments.value, newItems)
            if (apartments.value.length > 0) {
              isLoading.value = false
              stopLoadingTextAnimation()
            }
          }
        },
        { signal: controller.signal },
      )
    } catch (error) {
      // If we were aborted or navigated away, stop trying
      if (sseController !== controller) break
      console.error('SSE by requestId failed:', error)
    } finally {
      // If we were aborted or navigated away, exit loop
      if (sseController !== controller) break
      // If stream ended (server closed) but we're still on the page, stop loading state
      isLoading.value = false
      stopLoadingTextAnimation()
    }

    // Reconnect with exponential backoff while still active
    attempt += 1
    const delayMs = Math.min(1000 * 2 ** Math.min(attempt, 4), 10000)
    await wait(delayMs)
  }
}

function getRequestIdFromRoute(): string | null {
  const rid = route.params.requestId
  if (typeof rid === 'string') return rid
  if (Array.isArray(rid)) return rid[0] || null
  return null
}

onMounted(() => {
  const rid = getRequestIdFromRoute()
  if (rid) startStreamingForRequestId(rid)
})

watch(
  () => route.params.requestId,
  (newVal) => {
    const rid = typeof newVal === 'string' ? newVal : Array.isArray(newVal) ? newVal[0] : null
    if (rid) startStreamingForRequestId(rid)
  },
)

onUnmounted(() => {
  if (sseController) {
    sseController.abort()
    sseController = null
  }
  stopLoadingTextAnimation()
})

const handleSearch = async (query: string) => {
  // Start a new request and navigate to its page
  try {
    isLoading.value = true
    const newId = await createSearchRequest(query)
    router.push({ name: 'search', params: { requestId: newId } })
  } finally {
    // allow navigation to replace this component; local state doesn't matter afterwards
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <img src="/logo.png" alt="MyBnB logo" class="w-24 h-24 mx-auto mb-4" />
        <h1
          class="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          myBnB
        </h1>
        <p class="text-slate-300 text-lg max-w-2xl mx-auto">
          Find your perfect furnished apartment for short-term and long-term stays
        </p>
      </div>

      <!-- Search Bar -->
      <SearchBar @search="handleSearch" :isLoading="isLoading" />

      <!-- Results -->
      <div class="mt-8 max-w-4xl mx-auto">
        <h2 class="text-2xl font-semibold text-center text-white mb-2">
          {{ isLoading ? loadingText : `${apartments.length} properties found` }}
        </h2>
        <LoadingAnimation v-if="isLoading" />
        <!-- Show apartments as soon as we have any, even while streaming -->
        <PropertyList v-if="apartments.length > 0" :apartments="apartments" />
      </div>
    </div>
  </div>
</template>
