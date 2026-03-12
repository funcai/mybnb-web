import { ref, type Ref } from 'vue'

import type { Property } from '../types/property'
import type { SearchHandlers } from '../services/api'
import { startSearch as defaultStartSearch } from '../services/api'

type RequestState = {
  status?: string
}

type StartSearchFn = (searchQuery: string, handlers: SearchHandlers) => Promise<() => void>

type HomeSearchController = {
  properties: Ref<Property[]>
  isLoading: Ref<boolean>
  hasSearched: Ref<boolean>
  loadingText: Ref<string>
  handleSearch: (query: string) => Promise<void>
  dispose: () => void
}

const loadingMessages = [
  'Looking under beds for dust...',
  'Fluffing the pillows...',
  'Peeking behind curtains... just in case',
  'Inspecting for creaky floorboards...',
  'Preheating the towel rack...',
  'Counting spoons in the cutlery drawer...',
  'Defrosting the freezer compartment...',
  'Checking the water pressure in the shower...',
  'Wiping fingerprints off the fridge door...',
]

const isTerminalStatus = (status?: string): boolean => status === 'completed' || status === 'failed'

export const createHomeSearchController = (
  startSearch: StartSearchFn = defaultStartSearch,
): HomeSearchController => {
  const properties = ref<Property[]>([])
  const isLoading = ref(false)
  const hasSearched = ref(false)
  const loadingText = ref('Starting your apartment search...')

  let loadingInterval: ReturnType<typeof setInterval> | null = null
  let activeCleanup: (() => void) | null = null
  let activeSearchToken = 0

  const stopLoadingTextAnimation = () => {
    if (loadingInterval !== null) {
      clearInterval(loadingInterval)
      loadingInterval = null
    }
    loadingText.value = 'Discover amazing places to stay'
  }

  const startLoadingTextAnimation = () => {
    stopLoadingTextAnimation()
    loadingText.value = 'Starting your apartment search...'
    loadingInterval = globalThis.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length)
      loadingText.value = loadingMessages[randomIndex]
    }, 5000)
  }

  const closeActiveSearch = () => {
    if (activeCleanup) {
      activeCleanup()
      activeCleanup = null
    }
  }

  const finishSearch = () => {
    isLoading.value = false
    stopLoadingTextAnimation()
    closeActiveSearch()
  }

  const handleRequestState = (searchToken: number, request?: RequestState) => {
    if (searchToken !== activeSearchToken) {
      return
    }
    if (isTerminalStatus(request?.status)) {
      finishSearch()
    }
  }

  const handleSearch = async (query: string): Promise<void> => {
    activeSearchToken += 1
    const searchToken = activeSearchToken

    closeActiveSearch()
    properties.value = []
    hasSearched.value = true
    isLoading.value = true
    startLoadingTextAnimation()

    try {
      activeCleanup = await startSearch(query, {
        onAccepted: (payload) => {
          handleRequestState(searchToken, payload.request)
        },
        onRequest: (payload) => {
          handleRequestState(searchToken, payload.request)
        },
        onUpdate: (nextProperties) => {
          if (searchToken !== activeSearchToken) {
            return
          }
          properties.value = nextProperties
        },
        onError: (error) => {
          if (searchToken !== activeSearchToken) {
            return
          }
          console.error('Search failed:', error)
          finishSearch()
        },
      })
    } catch (error) {
      if (searchToken !== activeSearchToken) {
        return
      }
      console.error('Search failed:', error)
      finishSearch()
    }
  }

  const dispose = () => {
    activeSearchToken += 1
    stopLoadingTextAnimation()
    closeActiveSearch()
  }

  return {
    properties,
    isLoading,
    hasSearched,
    loadingText,
    handleSearch,
    dispose,
  }
}
