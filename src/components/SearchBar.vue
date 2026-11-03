<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SearchCapabilities } from '../services/api'
import { Search } from 'lucide-vue-next'

interface SearchBarProps {
  isLoading?: boolean
  initialQuery?: string
  capabilities?: SearchCapabilities | null
  initialCriterion?: string
}

const props = withDefaults(defineProps<SearchBarProps>(), {
  isLoading: false,
  initialQuery: '',
})

const emit = defineEmits<{
  search: [query: string, criterion?: string]
}>()

const query = ref(props.initialQuery)
const criterion = ref(props.initialCriterion ?? '')
watch(() => props.capabilities, (capabilities) => {
  if (capabilities && !capabilities.questions.includes(criterion.value)) criterion.value = capabilities.questions[0] ?? ''
}, { immediate: true })
watch(() => props.initialCriterion, (value) => { if (value) criterion.value = value })

watch(
  () => props.initialQuery,
  (next) => {
    query.value = next
  },
)

const examples = [
  'Try: Apartment in Vienna with a walk in shower for < 1500€ per month',
  'Try: Apartment in Augsburg with a dining table for at least 4 people for < 1700€ per month',
  'Try: Apartment in Vienna with a high bed for < 1200€ per month',
]

const exampleHint = ref('')

exampleHint.value = props.initialQuery ? '' : examples[Math.floor(Math.random() * examples.length)]

const handleSubmit = (e: Event) => {
  e.preventDefault()
  emit('search', query.value, props.capabilities ? criterion.value : undefined)
  exampleHint.value = ''
}
</script>

<template>
  <div class="mx-auto mb-3 w-full max-w-2xl sm:mb-8">
    <form @submit="handleSubmit" class="relative">
      <label v-if="capabilities" class="mb-3 block text-sm text-[#4a4640]">
        Photo feature
        <select v-model="criterion" class="mt-1 block w-full border border-[#1c1a17] bg-white p-3">
          <option v-for="question in capabilities.questions" :key="question" :value="question">{{ question }}</option>
        </select>
      </label>
      <div class="flex flex-col items-stretch border border-[#1c1a17] bg-white sm:flex-row">
        <div class="relative flex-1">
          <Search
            class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8278] sm:left-5"
          />
          <input
            v-model="query"
            type="text"
            inputmode="search"
            enterkeyhint="search"
            autocapitalize="off"
            autocomplete="off"
            spellcheck="false"
            :placeholder="capabilities ? 'Location or listing keyword (optional)' : 'What are you looking for?'"
            class="w-full bg-transparent py-4 pl-11 pr-4 text-base text-[#1c1a17] placeholder:text-[#8a8278]/80 focus:outline-none sm:py-5 sm:pl-12"
          />
        </div>
        <button
          type="submit"
          :disabled="isLoading || (capabilities ? !capabilities.open : false)"
          class="shrink-0 border-t border-[#1c1a17] bg-[#1c1a17] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.24em] text-[#f7f3ec] transition-colors duration-200 hover:bg-[#8b6f47] disabled:cursor-not-allowed disabled:opacity-60 sm:border-l sm:border-t-0 sm:px-7 sm:py-0"
        >
          {{ isLoading ? 'Searching...' : 'Search' }}
        </button>
      </div>
    </form>
    <p class="mt-3 px-1 font-serif text-sm italic leading-snug text-[#8a8278] sm:pl-2">
      {{ capabilities ? (capabilities.open ? `Preview checks up to ${capabilities.maxCandidates} existing listings. Starting the model can take a few minutes.` : 'The search preview is paused. Saved results remain available.') : exampleHint }}
    </p>
  </div>
</template>
