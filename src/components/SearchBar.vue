<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from 'lucide-vue-next'

interface SearchBarProps {
  isLoading?: boolean
}

withDefaults(defineProps<SearchBarProps>(), {
  isLoading: false,
})

const emit = defineEmits<{
  search: [query: string]
}>()

const query = ref('')

const examples = [
  'Try: Apartment in Zürich with a comfortable office chair for < 80€ per day',
  'Try: Apartment in New York with a coffee machine, king size bed and 2 bathrooms',
  'Try: Apartment in San Francisco with a desk with at least 2 monitors that is close to the beach',
]

const exampleHint = ref('')

exampleHint.value = examples[Math.floor(Math.random() * examples.length)]

const handleSubmit = (e: Event) => {
  e.preventDefault()
  emit('search', query.value)
  exampleHint.value = ''
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto mb-8">
    <form @submit="handleSubmit" class="relative">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          v-model="query"
          type="text"
          placeholder="What are you looking for?"
          class="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
      </div>
      <button
        type="submit"
        :disabled="isLoading"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
      >
        {{ isLoading ? 'Searching...' : 'Search' }}
      </button>
    </form>
    <p class="mt-2 pl-12 text-slate-400 text-sm">{{ exampleHint }}</p>
  </div>
</template>
