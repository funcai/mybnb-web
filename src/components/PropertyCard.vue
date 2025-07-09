<script setup lang="ts">
import { MapPin, Home, Bed } from 'lucide-vue-next';
import type { Property } from '../types/property';

interface PropertyCardProps {
  property: Property;
}

defineProps<PropertyCardProps>();
const emit = defineEmits<{
  click: [];
}>();

const handleClick = () => {
  emit('click');
};
</script>

<template>
  <div 
    @click="handleClick"
    class="bg-slate-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:bg-slate-750 border border-slate-700 hover:border-slate-600"
  >
    <!-- Desktop layout -->
    <div class="hidden md:flex items-center justify-between">
      <!-- Left side - Property info -->
      <div class="flex-1">
        <div class="flex items-center text-slate-300 mb-1">
          <MapPin class="h-4 w-4 mr-1" />
          <span class="text-sm">{{ property.address.city }}, {{ property.address.country }}</span>
        </div>
        
        <h3 class="text-white font-semibold text-lg mb-2">
          {{ property.address.street }}, {{ property.address.postalCode }}
        </h3>
        
        <div class="flex items-center space-x-4 text-slate-400 text-sm">
          <div class="flex items-center">
            <Home class="h-4 w-4 mr-1" />
            <span>{{ property.facts.rooms }} room{{ property.facts.rooms > 1 ? 's' : '' }}</span>
          </div>
          <div class="flex items-center">
            <Bed class="h-4 w-4 mr-1" />
            <span>{{ property.facts.beds }} bed{{ property.facts.beds > 1 ? 's' : '' }}</span>
          </div>
          <div>
            <span>{{ property.facts.area_m2 }} m²</span>
          </div>
          <div v-if="property.facts.furnished" class="inline-flex items-center px-2 py-1 bg-green-600 text-green-100 text-xs font-medium rounded-full">
            Furnished
          </div>
        </div>
      </div>

      <!-- Right side - Price -->
      <div class="text-right ml-6">
        <div class="text-2xl font-bold text-white">€{{ property.facts.rent_monthly.toLocaleString() }}</div>
        <div class="text-slate-400 text-sm">per month</div>
        <div class="text-slate-500 text-xs mt-1">
          Deposit: €{{ property.facts.deposit.toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- Mobile layout -->
    <div class="md:hidden">
      <!-- Location -->
      <div class="flex items-center text-slate-300 mb-2">
        <MapPin class="h-4 w-4 mr-1" />
        <span class="text-sm">{{ property.address.city }}, {{ property.address.country }}</span>
      </div>
      
      <!-- Address -->
      <h3 class="text-white font-semibold text-lg mb-3">
        {{ property.address.street }}, {{ property.address.postalCode }}
      </h3>
      
      <!-- Property details -->
      <div class="flex flex-wrap items-center gap-3 text-slate-400 text-sm mb-3">
        <div class="flex items-center">
          <Home class="h-4 w-4 mr-1" />
          <span>{{ property.facts.rooms }} room{{ property.facts.rooms > 1 ? 's' : '' }}</span>
        </div>
        <div class="flex items-center">
          <Bed class="h-4 w-4 mr-1" />
          <span>{{ property.facts.beds }} bed{{ property.facts.beds > 1 ? 's' : '' }}</span>
        </div>
        <div>
          <span>{{ property.facts.area_m2 }} m²</span>
        </div>
      </div>

      <!-- Furnished badge -->
      <div v-if="property.facts.furnished" class="inline-flex items-center px-2 py-1 bg-green-600 text-green-100 text-xs font-medium rounded-full mb-3">
        Furnished
      </div>
      
      <!-- Price section -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-700">
        <div>
          <div class="text-2xl font-bold text-white">€{{ property.facts.rent_monthly.toLocaleString() }}</div>
          <div class="text-slate-400 text-sm">per month</div>
        </div>
        <div class="text-right">
          <div class="text-slate-500 text-xs">Deposit</div>
          <div class="text-slate-300 text-sm">€{{ property.facts.deposit.toLocaleString() }}</div>
        </div>
      </div>
    </div>
  </div>
</template>