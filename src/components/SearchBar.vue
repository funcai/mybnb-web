<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search } from 'lucide-vue-next'

interface SearchBarProps {
  isLoading?: boolean
  initialQuery?: string
}

const props = withDefaults(defineProps<SearchBarProps>(), {
  isLoading: false,
  initialQuery: '',
})

const emit = defineEmits<{
  search: [query: string]
}>()

const query = ref(props.initialQuery)

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
  emit('search', query.value)
  exampleHint.value = ''
}
</script>

<template>
  <div class="mx-auto mb-3 w-full max-w-2xl sm:mb-8">
    <form @submit="handleSubmit" class="relative">
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
            placeholder="What are you looking for?"
            class="w-full bg-transparent py-4 pl-11 pr-4 text-base text-[#1c1a17] placeholder:text-[#8a8278]/80 focus:outline-none sm:py-5 sm:pl-12"
          />
        </div>
        <button
          type="submit"
          :disabled="isLoading"
          class="shrink-0 border-t border-[#1c1a17] bg-[#1c1a17] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.24em] text-[#f7f3ec] transition-colors duration-200 hover:bg-[#8b6f47] disabled:cursor-not-allowed disabled:opacity-60 sm:border-l sm:border-t-0 sm:px-7 sm:py-0"
        >
          {{ isLoading ? 'Searching...' : 'Search' }}
        </button>
      </div>
    </form>
    <p class="mt-3 px-1 font-serif text-sm italic leading-snug text-[#8a8278] sm:pl-2">
      {{ exampleHint }}
    </p>
  </div>
</template>
