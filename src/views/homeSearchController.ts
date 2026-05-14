import { computed, ref, type Ref } from 'vue'

import type { Property } from '../types/property'
import type { SearchHandlers, SearchProgress } from '../services/api'
import {
  normalizeSearchProgress,
  subscribeToSearch as defaultSubscribeToSearch,
} from '../services/api'
import type { AgentLocationHint, AgentQuestion } from '../types/agent'

type RequestState = {
  status?: string
  nonFilterableQuestions?: AgentQuestion[]
  locationHint?: AgentLocationHint
}

type RequestPayload = {
  request?: RequestState
  state?: SearchProgress
}

type SubscribeToSearchFn = (
  requestId: string,
  handlers: SearchHandlers,
) => (() => void) | Promise<() => void>

export type MlQuestion = {
  id: string
  question: string
  scoringType?: string
}

type HomeSearchController = {
  properties: Readonly<Ref<Property[]>>
  mlQuestions: Ref<MlQuestion[]>
  enabledQuestionIds: Ref<Set<string>>
  isLoading: Ref<boolean>
  hasSearched: Ref<boolean>
  loadingText: Ref<string>
  searchProgress: Ref<SearchProgress>
  locationHint: Ref<AgentLocationHint | null>
  connectToSearch: (requestId: string) => Promise<void>
  toggleQuestionFilter: (questionId: string) => void
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

const normalizeMlQuestions = (questions?: AgentQuestion[]): MlQuestion[] =>
  (questions ?? [])
    .map((question): MlQuestion | null => {
      const id = question.id?.trim()
      const text = question.question?.trim()
      if (!id || !text) {
        return null
      }
      const normalized: MlQuestion = {
        id,
        question: text,
      }
      const scoringType = question.scoringType?.trim()
      if (scoringType) {
        normalized.scoringType = scoringType
      }
      return normalized
    })
    .filter((question): question is MlQuestion => question !== null)

export const propertyMatchesEnabledQuestions = (
  property: Property,
  enabledQuestionIds: Set<string>,
): boolean => {
  for (const questionId of enabledQuestionIds) {
    const score = property.questionScores.find(
      (questionScore) => questionScore.questionId === questionId,
    )?.score
    if (typeof score !== 'number' || score < 0.5) {
      return false
    }
  }
  return true
}

export const createHomeSearchController = (
  subscribeToSearch: SubscribeToSearchFn = defaultSubscribeToSearch,
): HomeSearchController => {
  const allProperties = ref<Property[]>([])
  const mlQuestions = ref<MlQuestion[]>([])
  const enabledQuestionIds = ref<Set<string>>(new Set())
  const properties = computed(() =>
    allProperties.value.filter((property) =>
      propertyMatchesEnabledQuestions(property, enabledQuestionIds.value),
    ),
  )
  const isLoading = ref(false)
  const hasSearched = ref(false)
  const loadingText = ref('Starting your apartment search...')
  const searchProgress = ref<SearchProgress>(normalizeSearchProgress())
  const locationHint = ref<AgentLocationHint | null>(null)

  let loadingInterval: ReturnType<typeof setInterval> | null = null
  let activeCleanup: (() => void) | null = null
  let activeSearchToken = 0
  let closeAfterNextUpdateToken: number | null = null

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

  const finishSearchAfterNextUpdate = (searchToken: number) => {
    isLoading.value = false
    stopLoadingTextAnimation()
    closeAfterNextUpdateToken = searchToken
  }

  const syncMlQuestions = (questions?: AgentQuestion[]) => {
    const nextQuestions = normalizeMlQuestions(questions)
    const previousIds = new Set(mlQuestions.value.map((question) => question.id))
    const nextIds = new Set(nextQuestions.map((question) => question.id))
    const nextEnabled = new Set(enabledQuestionIds.value)

    for (const question of nextQuestions) {
      if (!previousIds.has(question.id)) {
        nextEnabled.add(question.id)
      }
    }
    for (const questionId of nextEnabled) {
      if (!nextIds.has(questionId)) {
        nextEnabled.delete(questionId)
      }
    }

    mlQuestions.value = nextQuestions
    enabledQuestionIds.value = nextEnabled
  }

  const handleRequestState = (searchToken: number, payload: RequestPayload) => {
    if (searchToken !== activeSearchToken) {
      return
    }
    syncMlQuestions(payload.request?.nonFilterableQuestions)
    locationHint.value = payload.request?.locationHint ?? null
    searchProgress.value = normalizeSearchProgress(payload.state, payload.request)
    if (isTerminalStatus(payload.request?.status)) {
      finishSearchAfterNextUpdate(searchToken)
    }
  }

  const connectToSearch = async (requestId: string): Promise<void> => {
    activeSearchToken += 1
    const searchToken = activeSearchToken

    closeActiveSearch()
    closeAfterNextUpdateToken = null
    allProperties.value = []
    mlQuestions.value = []
    enabledQuestionIds.value = new Set()
    locationHint.value = null
    searchProgress.value = normalizeSearchProgress()
    hasSearched.value = true
    isLoading.value = true
    startLoadingTextAnimation()

    try {
      activeCleanup = await subscribeToSearch(requestId, {
        onAccepted: (payload) => {
          handleRequestState(searchToken, payload)
        },
        onRequest: (payload) => {
          handleRequestState(searchToken, payload)
        },
        onUpdate: (nextProperties) => {
          if (searchToken !== activeSearchToken) {
            return
          }
          allProperties.value = nextProperties
          if (closeAfterNextUpdateToken === searchToken) {
            closeAfterNextUpdateToken = null
            closeActiveSearch()
          }
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
    closeAfterNextUpdateToken = null
    stopLoadingTextAnimation()
    closeActiveSearch()
  }

  const toggleQuestionFilter = (questionId: string) => {
    const next = new Set(enabledQuestionIds.value)
    if (next.has(questionId)) {
      next.delete(questionId)
    } else {
      next.add(questionId)
    }
    enabledQuestionIds.value = next
  }

  return {
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
  }
}
