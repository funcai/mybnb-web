<script setup lang="ts">
import type { Property } from '../types/property'
import PropertyCard from './PropertyCard.vue'

withDefaults(
  defineProps<{
    properties: Property[]
    isLoading?: boolean
  }>(),
  {
    isLoading: false,
  },
)
</script>

<template>
  <div v-if="isLoading && properties.length === 0" class="space-y-4">
    <div v-for="i in 6" :key="i" class="animate-pulse rounded-lg bg-slate-800 p-4">
      <div class="space-y-3">
        <div class="h-4 w-32 rounded bg-slate-700"></div>
        <div class="h-6 w-3/4 rounded bg-slate-700"></div>
        <div class="h-16 rounded bg-slate-700"></div>
      </div>
    </div>
  </div>

  <div v-else-if="properties.length === 0" class="py-12 text-center">
    <div class="text-lg text-slate-400">No properties found</div>
    <div class="mt-2 text-sm text-slate-500">Try a different search term</div>
  </div>

  <div v-else class="space-y-4">
    <PropertyCard v-for="property in properties" :key="property.id" :property="property" />
  </div>
</template>
