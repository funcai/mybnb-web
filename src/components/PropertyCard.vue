<script setup lang="ts">
import { computed } from 'vue'
import type { Apartment } from '../types/property'
import type { SearchRequest } from '../types/request'

interface PropertyCardProps {
  apartment: Apartment
  request?: SearchRequest | null
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
const numberApartments = asNumber(getAttrValue('number_apartments'))
const roomType = (getAttrValue('room_type') as string) || ''

function providerLabel(p: string): string {
  return p ? p.charAt(0).toUpperCase() + p.slice(1) : 'Provider'
}

const questionMatches = computed(() => {
  const results = props.apartment.nonFilterableQuestionResults ?? []
  const byId = new Map(results.map((r) => [r.nonFilterableQuestionId, r.score]))
  const qs = props.request?.nonFilterableQuestions ?? []
  return qs.map((q) => {
    const score = byId.get(q.id) ?? 0
    return {
      id: q.id,
      question: q.question,
      scoringType: q.scoringType,
      score,
      matched: score >= 0.5,
    }
  })
})
</script>

<template>
  <a
    :href="props.apartment.sourceUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="block bg-slate-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-slate-750 border border-slate-700 hover:border-slate-600"
  >
    <!-- Desktop layout -->
    <div class="hidden md:flex items-start gap-4">
      <!-- Left: OG Image -->
      <div v-if="props.apartment.ogImage" class="flex-shrink-0">
        <img
          :src="props.apartment.ogImage"
          :alt="props.apartment.ogTitle || ''"
          class="w-[200px] h-auto rounded-md object-cover"
        />
      </div>

      <!-- Right: Content -->
      <div class="flex-1">
        <h3 v-if="props.apartment.ogTitle" class="text-white font-semibold text-lg mb-2">
          {{ props.apartment.ogTitle }}
        </h3>

        <div class="flex items-center space-x-4 text-slate-400 text-sm">
          <div v-if="rooms">
            <span>{{ rooms }} room{{ rooms > 1 ? 's' : '' }}</span>
          </div>
          <div v-if="numberApartments">
            <span>{{ numberApartments }} apartment{{ numberApartments > 1 ? 's' : '' }}</span>
          </div>
          <div v-if="roomType">
            <span>{{ roomType.replace('_', ' ') }}</span>
          </div>
          <div>
            <span class="text-slate-300">{{ providerLabel(props.apartment.provider) }}</span>
          </div>
        </div>

        <!-- Non-filterable question matches (desktop) -->
        <div v-if="questionMatches.length" class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="q in questionMatches"
            :key="q.id"
            class="inline-flex items-center gap-1 text-sm px-2 py-1 rounded bg-slate-700/60"
          >
            <span :class="q.matched ? 'text-green-400' : 'text-red-400'">{{ q.matched ? '✔' : '✖' }}</span>
            <span class="text-slate-300">{{ q.question }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Mobile layout -->
    <div class="md:hidden">
      <div v-if="props.apartment.ogImage" class="mb-3">
        <img :src="props.apartment.ogImage" :alt="props.apartment.ogTitle || ''" class="w-full h-auto rounded-md" />
      </div>

      <h3 v-if="props.apartment.ogTitle" class="text-white font-semibold text-lg mb-2">
        {{ props.apartment.ogTitle }}
      </h3>

      <div class="flex flex-wrap items-center gap-3 text-slate-400 text-sm">
        <div v-if="rooms">
          <span>{{ rooms }} room{{ rooms > 1 ? 's' : '' }}</span>
        </div>
        <div v-if="numberApartments">
          <span>{{ numberApartments }} apartment{{ numberApartments > 1 ? 's' : '' }}</span>
        </div>
        <div v-if="roomType">
          <span>{{ roomType.replace('_', ' ') }}</span>
        </div>
        <div>
          <span class="text-slate-300">{{ providerLabel(props.apartment.provider) }}</span>
        </div>
      </div>

      <!-- Non-filterable question matches (mobile) -->
      <div v-if="questionMatches.length" class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="q in questionMatches"
          :key="q.id"
          class="inline-flex items-center gap-1 text-sm px-2 py-1 rounded bg-slate-700/60"
        >
          <span :class="q.matched ? 'text-green-400' : 'text-red-400'">{{ q.matched ? '✔' : '✖' }}</span>
          <span class="text-slate-300">{{ q.question }}</span>
        </span>
      </div>
    </div>
  </a>
</template>
