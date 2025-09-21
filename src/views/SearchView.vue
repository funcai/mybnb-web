<script setup lang="ts">
import { ref, onUnmounted, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchBar from '../components/SearchBar.vue'
import PropertyList from '../components/PropertyList.vue'
import LoadingAnimation from '../components/LoadingAnimation.vue'
import type { Apartment } from '../types/property'
import { createSearchRequest, openRequestEventSource } from '../services/api'
import { normalizeUpdateToApartments, upsertById } from '../utils/apartments'
import type { AcceptedEventPayload, SearchRequest } from '../types/request'

const route = useRoute()
const router = useRouter()

const apartments = ref<Apartment[]>([])
const isLoading = ref(true)
const loadingText = ref('Starting your apartment search…')
// Store request metadata for later use
const requestDoc = ref<SearchRequest | null>(null)
const currentRequestId = ref<string | null>(null)

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
let ev: EventSource | null = null

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

function startStreamingForRequestId(requestId: string) {
  // Close any existing connection
  if (ev) {
    try {
      ev.close()
    } catch {}
    ev = null
  }

  // Initial state for a fresh request
  apartments.value = []
  isLoading.value = true
  startLoadingTextAnimation()
  requestDoc.value = null
  currentRequestId.value = requestId

  // Open EventSource and attach listeners
  ev = openRequestEventSource(requestId)

  ev.addEventListener('accepted', (e) => {
    try {
      const payload = JSON.parse((e as MessageEvent).data) as AcceptedEventPayload
      requestDoc.value = payload.request
      currentRequestId.value = payload.requestId || requestId
    } catch (err) {
      console.warn('Failed to parse accepted event payload', err)
    }
  })

  ev.addEventListener('update', (e) => {
    try {
      const enriched = JSON.parse((e as MessageEvent).data) as unknown
      const newItems = normalizeUpdateToApartments(enriched)
      if (newItems.length > 0) {
        apartments.value = upsertById(apartments.value, newItems)
        if (apartments.value.length > 0) {
          isLoading.value = false
          stopLoadingTextAnimation()
        }
      }
    } catch (err) {
      console.warn('Failed to parse update event payload', err)
    }
  })

  ev.addEventListener('error', (e) => {
    console.error('EventSource error:', e)
    // EventSource will attempt to reconnect automatically; keep loading state as-is
  })
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
  if (ev) {
    try {
      ev.close()
    } catch {}
    ev = null
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
      <SearchBar
        @search="handleSearch"
        :isLoading="isLoading"
        :initialQuery="(requestDoc && requestDoc.userQuery) || ''"
      />

      <!-- Results -->
      <div class="mt-8 max-w-4xl mx-auto">
        <h2 class="text-2xl font-semibold text-center text-white mb-2">
          {{ isLoading ? loadingText : `${apartments.length} properties found` }}
        </h2>
        <LoadingAnimation v-if="isLoading" />
        <!-- Show apartments as soon as we have any, even while streaming -->
        <PropertyList v-if="apartments.length > 0" :apartments="apartments" :request="requestDoc" />
      </div>
    </div>
  </div>
</template>
