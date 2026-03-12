<script setup lang="ts">
import { Building2, ExternalLink, ListChecks, Tag } from 'lucide-vue-next'

import type { Property } from '../types/property'

defineProps<{
  property: Property
}>()

const formatScore = (score: number): string => `${Math.round(score * 100)}%`
</script>

<template>
  <a
    :href="property.sourceUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="block rounded-lg border border-slate-700 bg-slate-800 p-5 shadow-lg transition-all duration-200 hover:border-slate-600 hover:bg-slate-750 hover:shadow-xl"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div class="min-w-0 flex-1">
          <div class="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <span
              class="inline-flex items-center gap-1 rounded-full bg-slate-700 px-3 py-1 font-medium text-slate-100"
            >
              <Building2 class="h-4 w-4" />
              {{ property.provider }}
            </span>
            <span class="inline-flex items-center gap-1 text-slate-400">
              <ExternalLink class="h-4 w-4" />
              Open listing
            </span>
          </div>

          <h3 class="mb-2 text-xl font-semibold text-white">
            {{ property.title }}
          </h3>

          <p class="text-sm leading-6 text-slate-300">
            {{ property.description || 'No description available yet.' }}
          </p>
        </div>

        <div class="text-sm text-slate-400 md:text-right">
          <div class="font-medium text-slate-200">Source</div>
          <div class="max-w-xs truncate">{{ property.sourceUrl }}</div>
        </div>
      </div>

      <div v-if="property.attributes.length > 0" class="flex flex-col gap-2">
        <div class="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Tag class="h-4 w-4" />
          Attributes
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="attribute in property.attributes"
            :key="attribute.key"
            class="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-200"
          >
            {{ attribute.label }}: {{ attribute.value }}
          </span>
        </div>
      </div>

      <div v-if="property.questionScores.length > 0" class="flex flex-col gap-2">
        <div class="flex items-center gap-2 text-sm font-medium text-slate-200">
          <ListChecks class="h-4 w-4" />
          Question scores
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="questionScore in property.questionScores"
            :key="questionScore.questionId"
            class="rounded-full bg-blue-600/20 px-3 py-1 text-xs text-blue-100"
          >
            {{ questionScore.question }}: {{ formatScore(questionScore.score) }}
          </span>
        </div>
      </div>
    </div>
  </a>
</template>
