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

const formatScore = (score?: number): string =>
  typeof score === 'number' ? `${Math.round(score * 100)}%` : 'Pending'
</script>

<template>
  <a
    :href="property.sourceUrl"
    target="_blank"
    rel="noopener noreferrer"
    :data-property-id="property.id"
    class="group block scroll-mt-32 overflow-hidden border-x-0 border-b border-t-0 bg-white transition-all duration-200 hover:border-[#8b6f47] sm:border"
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
    <div class="flex flex-col sm:min-h-[168px] sm:flex-row">
      <div
        class="relative aspect-[16/10] w-full shrink-0 bg-[#efe9de] sm:aspect-auto sm:w-48 md:w-56"
      >
        <img
          v-if="property.imageUrl"
          :src="property.imageUrl"
          :alt="property.title"
          loading="lazy"
          class="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div
          v-else
          class="absolute inset-0 flex items-center justify-center bg-[#f1eadf] text-[#8a8278]"
          aria-hidden="true"
        >
          <Building2 class="h-8 w-8 text-[#c8bba7]" />
        </div>
      </div>

      <div class="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div
          class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.28em] text-[#8a8278]"
        >
          <span class="inline-flex items-center gap-1.5 text-[#1c1a17]">
            <Building2 class="h-3 w-3 text-[#8b6f47]" />
            {{ property.provider }}
          </span>
          <span class="h-3 w-px bg-[#d8cfc0]"></span>
          <span
            class="inline-flex items-center gap-1.5 transition-colors group-hover:text-[#8b6f47]"
          >
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
