<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SearchBar from '../components/SearchBar.vue'
import PropertyList from '../components/PropertyList.vue'
import type { Apartment } from '../types/property'
import { createSearchRequest } from '../services/api'
import LoadingAnimation from '../components/LoadingAnimation.vue'

const apartments = ref<Apartment[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)
const loadingText = ref('Starting your apartment search…')
const router = useRouter()

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

const handleSearch = async (query: string) => {
  // Create a new request and redirect to the dedicated search page
  isLoading.value = true
  hasSearched.value = true
  apartments.value = []
  startLoadingTextAnimation()
  try {
    const requestId = await createSearchRequest(query)
    await router.push({ name: 'search', params: { requestId } })
  } catch (error) {
    console.error('Failed to create search request:', error)
  } finally {
    isLoading.value = false
    stopLoadingTextAnimation()
  }
}

// No special unmount handling needed beyond stopping the loading animation
// (No SSE used on Home page anymore)

// (helpers removed; streaming now happens in SearchView)
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
      <div v-if="hasSearched" class="mt-8 max-w-4xl mx-auto">
        <h2 class="text-2xl font-semibold text-center text-white mb-2">
          {{ isLoading ? loadingText : `${apartments.length} properties found` }}
        </h2>
        <LoadingAnimation v-if="isLoading" />
        <!-- Show apartments as soon as we have any, even while streaming -->
        <PropertyList v-if="apartments.length > 0" :apartments="apartments" />
      </div>

      <!-- Welcome message when no search has been performed -->
      <div v-if="!hasSearched" class="text-center py-16">
        <div class="text-slate-400 text-lg mb-4">
          Start your search to discover amazing properties
        </div>
        <div class="text-slate-500 text-sm">Enter your search terms above</div>
      </div>
    </div>
  </div>
</template>
