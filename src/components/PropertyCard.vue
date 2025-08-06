<script setup lang="ts">
import { MapPin, Home, Bed, Check, X } from 'lucide-vue-next'
import type { Property } from '../types/property'

interface PropertyCardProps {
  property: Property
}

const props = defineProps<PropertyCardProps>()
</script>

<template>
  <a
    :href="props.property.url"
    target="_blank"
    rel="noopener noreferrer"
    class="block bg-slate-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-slate-750 border border-slate-700 hover:border-slate-600"
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
          <!-- Score detail badges -->
          <div
            v-if="property.score_details && property.score_details.length > 0"
            class="flex flex-wrap gap-2"
          >
            <template v-for="detail in property.score_details" :key="detail.keyword">
              <div
                v-if="detail.description_matches || detail.vision_matches"
                class="inline-flex items-center px-2 py-1 bg-blue-600 text-blue-100 text-xs font-medium rounded-full"
              >
                <span class="font-semibold">{{ detail.keyword }}:</span>
                <template v-if="detail.description_matches">
                  <Check class="h-3 w-3 mx-1 text-green-300" />
                  <span class="text-xs">Description</span>
                </template>
                <template v-if="detail.vision_matches">
                  <Check class="h-3 w-3 mx-1 text-green-300" />
                  <span class="text-xs">Images</span>
                </template>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Right side - Price -->
      <div class="text-right ml-6">
        <div class="text-2xl font-bold text-white">
          €{{ property.facts.rent_monthly.toLocaleString() }}
        </div>
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

      <!-- Score detail badges -->
      <div
        v-if="property.score_details && property.score_details.length > 0"
        class="flex flex-wrap gap-2 mb-3"
      >
        <template v-for="detail in property.score_details" :key="detail.keyword">
          <div
            v-if="detail.score > 0"
            class="inline-flex items-center px-2 py-1 bg-blue-600 text-blue-100 text-xs font-medium rounded-full"
          >
            <span class="font-semibold">{{ detail.keyword }}:</span>
            <Check v-if="detail.description_matches" class="h-3 w-3 mx-1 text-green-300" />
            <X v-else class="h-3 w-3 mx-1 text-red-300" />
            <span class="text-xs">Description</span>
            <Check v-if="detail.vision_matches" class="h-3 w-3 mx-1 text-green-300" />
            <X v-else class="h-3 w-3 mx-1 text-red-300" />
            <span class="text-xs">Images</span>
          </div>
        </template>
      </div>

      <!-- Price section -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-700">
        <div>
          <div class="text-2xl font-bold text-white">
            €{{ property.facts.rent_monthly.toLocaleString() }}
          </div>
          <div class="text-slate-400 text-sm">per month</div>
        </div>
        <div class="text-right">
          <div class="text-slate-500 text-xs">Deposit</div>
          <div class="text-slate-300 text-sm">€{{ property.facts.deposit.toLocaleString() }}</div>
        </div>
      </div>
    </div>
  </a>
</template>
