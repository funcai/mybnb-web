<script setup lang="ts">
import type { Property } from '../types/property';
import PropertyCard from './PropertyCard.vue';

interface PropertyListProps {
  properties: Property[];
  isLoading?: boolean;
}

withDefaults(defineProps<PropertyListProps>(), {
  isLoading: false
});

const handleCardClick = (property: Property) => {
  window.open(property.url, '_blank');
};
</script>

<template>
  <div v-if="isLoading" class="space-y-4">
    <div 
      v-for="i in 6" 
      :key="i" 
      class="bg-slate-800 rounded-lg p-4 animate-pulse"
    >
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

  <div v-else-if="properties.length === 0" class="text-center py-12">
    <div class="text-slate-400 text-lg">No properties found</div>
    <div class="text-slate-500 text-sm mt-2">Try a different search term</div>
  </div>

  <div v-else class="space-y-4">
    <PropertyCard
      v-for="property in properties"
      :key="property.id"
      :property="property"
      @click="handleCardClick(property)"
    />
  </div>
</template>