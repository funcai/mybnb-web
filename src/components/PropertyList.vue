<script setup lang="ts">
import type { Property } from '../types/property'
import PropertyCard from './PropertyCard.vue'

withDefaults(
  defineProps<{
    properties: Property[]
    isLoading?: boolean
    highlightedId?: string | null
  }>(),
  {
    isLoading: false,
    highlightedId: null,
  },
)

const emit = defineEmits<{
  hover: [id: string | null]
}>()
</script>

<template>
  <div v-if="isLoading && properties.length === 0" class="sm:space-y-3">
    <div
      v-for="i in 6"
      :key="i"
      class="border-x-0 border-b border-t-0 border-[#e6e0d6] bg-white p-5 sm:border"
      :style="{ animationDelay: `${i * 120}ms` }"
    >
      <div class="mybnb-skeleton flex flex-col gap-3">
        <!-- Provider / open listing row -->
        <div class="flex items-center gap-3">
          <div class="h-2.5 w-20 bg-[#efe9de]"></div>
          <div class="h-3 w-px bg-[#e6e0d6]"></div>
          <div class="h-2.5 w-24 bg-[#efe9de]"></div>
        </div>
        <!-- Title -->
        <div class="h-5 w-4/5 bg-[#efe9de]"></div>
        <!-- Description (3 lines) -->
        <div class="space-y-1.5">
          <div class="h-3 w-full bg-[#efe9de]"></div>
          <div class="h-3 w-[92%] bg-[#efe9de]"></div>
          <div class="h-3 w-2/3 bg-[#efe9de]"></div>
        </div>
        <!-- Tag row -->
        <div class="flex flex-wrap gap-1.5 pt-1">
          <div class="h-5 w-20 border border-[#e6e0d6] bg-[#f7f3ec]"></div>
          <div class="h-5 w-28 border border-[#e6e0d6] bg-[#f7f3ec]"></div>
          <div class="h-5 w-16 border border-[#e6e0d6] bg-[#f7f3ec]"></div>
          <div class="h-5 w-24 border border-[#8b6f47]/30 bg-[#8b6f47]/5"></div>
          <div class="h-5 w-20 border border-[#8b6f47]/30 bg-[#8b6f47]/5"></div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-else-if="properties.length === 0"
    class="border border-dashed border-[#d8cfc0] bg-white/40 py-16 text-center"
  >
    <div class="font-serif text-2xl italic text-[#4a4640]">No properties found</div>
    <div class="mt-3 text-xs uppercase tracking-[0.28em] text-[#8a8278]">
      Try a different search term
    </div>
  </div>

  <div v-else class="sm:space-y-3">
    <PropertyCard
      v-for="property in properties"
      :key="property.id"
      :property="property"
      :isHighlighted="property.id === highlightedId"
      @hover="(id) => emit('hover', id)"
    />
  </div>
</template>

<style scoped>
.mybnb-skeleton > * > *,
.mybnb-skeleton > * {
  animation: skeleton-shimmer 1.6s ease-in-out infinite;
}
@keyframes skeleton-shimmer {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}
</style>
