<script setup lang="ts">
import { Home, Bed, Check } from 'lucide-vue-next'
import type { Apartment } from '../types/property'

interface PropertyCardProps {
  apartment: Apartment
}

const props = defineProps<PropertyCardProps>()

function getAttrValue(key: string): string | number | boolean | undefined {
  const found = props.apartment.attributes?.find((a) => a.key === key)
  return found?.value as string | number | boolean | undefined
}

function asNumber(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : fallback
}

const rooms = asNumber(getAttrValue('number_rooms'))
const baths = asNumber(getAttrValue('number_baths'))
const roomType = (getAttrValue('room_type') as string) || ''
const hasWifi = Boolean(getAttrValue('has_wifi'))
const hasKitchen = Boolean(getAttrValue('has_kitchen'))

function providerLabel(p: string): string {
  return p ? p.charAt(0).toUpperCase() + p.slice(1) : 'Provider'
}

function descriptionSnippet(desc: string, max = 160): string {
  if (!desc) return ''
  return desc.length > max ? desc.slice(0, max - 1) + '…' : desc
}
</script>

<template>
  <a
    :href="props.apartment.sourceUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="block bg-slate-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-slate-750 border border-slate-700 hover:border-slate-600"
  >
    <!-- Desktop layout -->
    <div class="hidden md:flex items-center justify-between">
      <!-- Left side - Apartment info -->
      <div class="flex-1">
        <div class="flex items-center text-slate-300 mb-1">
          <span class="text-sm">{{ providerLabel(props.apartment.provider) }}</span>
        </div>

        <h3 class="text-white font-semibold text-lg mb-2">
          {{ descriptionSnippet(props.apartment.description) }}
        </h3>

        <div class="flex items-center space-x-4 text-slate-400 text-sm">
          <div class="flex items-center" v-if="rooms">
            <Home class="h-4 w-4 mr-1" />
            <span>{{ rooms }} room{{ rooms > 1 ? 's' : '' }}</span>
          </div>
          <div class="flex items-center" v-if="baths">
            <Bed class="h-4 w-4 mr-1" />
            <span>{{ baths }} bath{{ baths > 1 ? 's' : '' }}</span>
          </div>
          <div v-if="roomType">
            <span>{{ roomType.replace('_', ' ') }}</span>
          </div>
          <div
            v-if="hasWifi"
            class="inline-flex items-center px-2 py-0.5 bg-blue-600/20 text-blue-200 text-xs font-medium rounded-full"
          >
            <Check class="h-3 w-3 mr-1 text-green-300" /> Wi‑Fi
          </div>
          <div
            v-if="hasKitchen"
            class="inline-flex items-center px-2 py-0.5 bg-blue-600/20 text-blue-200 text-xs font-medium rounded-full"
          >
            <Check class="h-3 w-3 mr-1 text-green-300" /> Kitchen
          </div>
        </div>
      </div>

      <!-- Right side - Action -->
      <div class="text-right ml-6">
        <div class="text-slate-400 text-sm">
          Open on {{ providerLabel(props.apartment.provider) }}
        </div>
        <div class="text-white font-semibold">View listing →</div>
      </div>
    </div>

    <!-- Mobile layout -->
    <div class="md:hidden">
      <div class="text-slate-300 mb-2 text-sm">{{ providerLabel(props.apartment.provider) }}</div>

      <h3 class="text-white font-semibold text-lg mb-3">
        {{ descriptionSnippet(props.apartment.description) }}
      </h3>

      <!-- Apartment details -->
      <div class="flex flex-wrap items-center gap-3 text-slate-400 text-sm mb-3">
        <div class="flex items-center" v-if="rooms">
          <Home class="h-4 w-4 mr-1" />
          <span>{{ rooms }} room{{ rooms > 1 ? 's' : '' }}</span>
        </div>
        <div class="flex items-center" v-if="baths">
          <Bed class="h-4 w-4 mr-1" />
          <span>{{ baths }} bath{{ baths > 1 ? 's' : '' }}</span>
        </div>
        <div v-if="roomType">
          <span>{{ roomType.replace('_', ' ') }}</span>
        </div>
        <div
          v-if="hasWifi"
          class="inline-flex items-center px-2 py-0.5 bg-blue-600/20 text-blue-200 text-xs font-medium rounded-full"
        >
          <Check class="h-3 w-3 mr-1 text-green-300" /> Wi‑Fi
        </div>
        <div
          v-if="hasKitchen"
          class="inline-flex items-center px-2 py-0.5 bg-blue-600/20 text-blue-200 text-xs font-medium rounded-full"
        >
          <Check class="h-3 w-3 mr-1 text-green-300" /> Kitchen
        </div>
      </div>

      <div class="pt-2 border-t border-slate-700 text-right">
        <span class="text-white font-semibold">View listing →</span>
      </div>
    </div>
  </a>
</template>
