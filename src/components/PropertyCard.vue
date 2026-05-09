<script setup lang="ts">
import { Building2, ExternalLink } from 'lucide-vue-next'

import type { Property } from '../types/property'

withDefaults(
  defineProps<{
    property: Property
    isHighlighted?: boolean
  }>(),
  { isHighlighted: false },
)

const emit = defineEmits<{
  hover: [id: string | null]
}>()

const formatScore = (score: number): string => `${Math.round(score * 100)}%`
</script>

<template>
  <a
    :href="property.sourceUrl"
    target="_blank"
    rel="noopener noreferrer"
    :data-property-id="property.id"
    class="group block scroll-mt-32 border-x-0 border-b border-t-0 bg-white p-5 transition-all duration-200 hover:border-[#8b6f47] sm:border"
    :class="
      isHighlighted
        ? 'mybnb-card-pulse border-[#8b6f47] border-l-4 bg-[#faf4ea] sm:border-l sm:bg-white sm:shadow-[0_0_0_1px_#8b6f47] sm:-translate-y-px'
        : 'border-[#e6e0d6]'
    "
    @mouseenter="emit('hover', property.id)"
    @mouseleave="emit('hover', null)"
    @focus="emit('hover', property.id)"
    @blur="emit('hover', null)"
  >
    <div class="flex flex-col gap-3">
      <div
        class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.28em] text-[#8a8278]"
      >
        <span class="inline-flex items-center gap-1.5 text-[#1c1a17]">
          <Building2 class="h-3 w-3 text-[#8b6f47]" />
          {{ property.provider }}
        </span>
        <span class="h-3 w-px bg-[#d8cfc0]"></span>
        <span class="inline-flex items-center gap-1.5 transition-colors group-hover:text-[#8b6f47]">
          <ExternalLink class="h-3 w-3" />
          Open listing
        </span>
      </div>

      <h3
        class="font-serif text-xl font-medium leading-snug tracking-tight text-[#1c1a17] transition-colors group-hover:text-[#6f5836]"
      >
        {{ property.title }}
      </h3>

      <p class="font-serif text-[15px] italic leading-snug text-[#4a4640] line-clamp-3">
        {{ property.description || 'No description available yet.' }}
      </p>

      <div
        v-if="property.attributes.length > 0 || property.questionScores.length > 0"
        class="flex flex-wrap gap-1.5 pt-1"
      >
        <span
          v-for="attribute in property.attributes"
          :key="attribute.key"
          class="border border-[#e6e0d6] bg-[#f7f3ec] px-2 py-0.5 text-[11px] text-[#1c1a17]"
        >
          <span class="text-[#8a8278]">{{ attribute.label }}:</span>
          {{ attribute.value }}
        </span>
        <span
          v-for="questionScore in property.questionScores"
          :key="questionScore.questionId"
          class="border border-[#8b6f47]/30 bg-[#8b6f47]/5 px-2 py-0.5 text-[11px] text-[#6f5836]"
        >
          {{ questionScore.question }}:
          <span class="font-medium">{{ formatScore(questionScore.score) }}</span>
        </span>
      </div>
    </div>
  </a>
</template>

<style scoped>
/* Brief flash when a card becomes the selected/highlighted one — primarily
   useful on mobile where a marker tap auto-scrolls the user to the card. */
@media (max-width: 639px) {
  .mybnb-card-pulse {
    animation: mybnb-card-pulse 1.4s ease-out 1;
  }
}
@keyframes mybnb-card-pulse {
  0% {
    background-color: #f3e6cc;
  }
  100% {
    background-color: #faf4ea;
  }
}
</style>
