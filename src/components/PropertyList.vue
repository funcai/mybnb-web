<script setup lang="ts">
import { computed } from 'vue'
import type { Apartment } from '../types/property'
import type { SearchRequest } from '../types/request'
import PropertyCard from './PropertyCard.vue'

interface PropertyListProps {
  apartments: Apartment[]
  isLoading?: boolean
  request?: SearchRequest | null
}

const props = withDefaults(defineProps<PropertyListProps>(), {
  isLoading: false,
})

const sortedApartments = computed(() => {
  const arr = [...props.apartments]
  arr.sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0))
  return arr
})
</script>

<template>
  <!-- Loading skeleton - always show when loading -->
  <div v-if="isLoading" class="space-y-4">
    <div v-for="i in 6" :key="i" class="bg-slate-800 rounded-lg p-4 animate-pulse">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <div class="h-4 bg-slate-700 rounded mb-2 w-32"></div>
          <div class="h-6 bg-slate-700 rounded mb-2 w-64"></div>
          <div class="h-4 bg-slate-700 rounded w-48"></div>
        </div>
        <div class="text-right ml-6">
          <div class="h-8 bg-slate-700 rounded w-24 mb-1"></div>
          <div class="h-4 bg-slate-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- No results message - only show when not loading and no properties -->
  <div v-else-if="!isLoading && apartments.length === 0" class="text-center py-12">
    <div class="text-slate-400 text-lg">No properties found</div>
    <div class="text-slate-500 text-sm mt-2">Try a different search term</div>
  </div>

  <!-- Properties list - only show when not loading and have properties -->
  <div v-else-if="!isLoading && apartments.length > 0" class="space-y-4">
    <PropertyCard
      v-for="apartment in sortedApartments"
      :key="apartment.id"
      :apartment="apartment"
      :request="request"
    />
  </div>
</template>
