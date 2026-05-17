<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

import type { SearchProgress } from '../services/api'
import {
  searchProgressStats,
  searchProgressTargetValues,
  searchReviewProgressPercent,
  type SearchProgressStatKey,
} from './searchProgressStats'

const props = defineProps<{
  isLoading: boolean
  hasSearched: boolean
  progress: SearchProgress
  loadingText: string
  resultsCount: number
}>()

const tweenDurationMs = 450

const targetValues = computed(() => searchProgressTargetValues(props.progress, props.resultsCount))

const displayed = ref<Record<SearchProgressStatKey, number>>({
  found: 0,
  queued: 0,
  analyzed: 0,
  matched: 0,
})

const activeTweens: Record<SearchProgressStatKey, number | null> = {
  found: null,
  queued: null,
  analyzed: null,
  matched: null,
}

const easeOutCubic = (linearProgress: number): number => 1 - Math.pow(1 - linearProgress, 3)

const tweenCounter = (key: SearchProgressStatKey, nextValue: number) => {
  const startValue = displayed.value[key]
  if (startValue === nextValue) return
  if (activeTweens[key] !== null) {
    cancelAnimationFrame(activeTweens[key] as number)
    activeTweens[key] = null
  }
  const startTime = performance.now()
  const step = (now: number) => {
    const elapsedMs = now - startTime
    const linearProgress = Math.min(1, elapsedMs / tweenDurationMs)
    const eased = easeOutCubic(linearProgress)
    const currentValue = Math.round(startValue + (nextValue - startValue) * eased)
    displayed.value = { ...displayed.value, [key]: currentValue }
    if (linearProgress < 1) {
      activeTweens[key] = requestAnimationFrame(step)
    } else {
      activeTweens[key] = null
    }
  }
  activeTweens[key] = requestAnimationFrame(step)
}

watch(
  targetValues,
  (next) => {
    ;(Object.keys(next) as SearchProgressStatKey[]).forEach((key) => tweenCounter(key, next[key]))
  },
  { immediate: true, deep: true },
)

// Crossfade the rotating playful loading text only when the message actually
// changes (not on every numeric tick), to avoid jittery animation.
const displayedLoadingText = ref(props.loadingText)
watch(
  () => props.loadingText,
  (next) => {
    displayedLoadingText.value = next
  },
)

onUnmounted(() => {
  ;(Object.keys(activeTweens) as SearchProgressStatKey[]).forEach((key) => {
    if (activeTweens[key] !== null) cancelAnimationFrame(activeTweens[key] as number)
  })
})

const progressPercent = computed(() => searchReviewProgressPercent(props.progress))

const stats = computed(() =>
  searchProgressStats(displayed.value, targetValues.value, props.isLoading),
)

const showProgressUi = computed(
  () => props.isLoading || targetValues.value.found > 0 || props.hasSearched,
)
</script>

<template>
  <div v-if="showProgressUi" class="flex flex-col gap-2">
    <!-- Stat row -->
    <div class="grid grid-cols-2 items-stretch gap-1.5 sm:grid-cols-4 sm:gap-3">
      <div
        v-for="stat in stats"
        :key="stat.key"
        class="flex min-w-0 flex-col items-start justify-between gap-1 border px-2 py-1.5 transition-colors sm:flex-row sm:items-center sm:gap-2 sm:px-3 sm:py-2"
        :class="stat.accent ? 'border-[#8b6f47]/40 bg-[#8b6f47]/5' : 'border-[#e6e0d6] bg-white/60'"
      >
        <div class="flex min-w-0 max-w-full items-center gap-1.5">
          <span
            v-if="stat.pulse"
            aria-hidden="true"
            class="mybnb-progress-dot h-1.5 w-1.5 shrink-0 rounded-full bg-[#8b6f47]"
          ></span>
          <span
            class="min-w-0 break-words text-[10px] font-medium uppercase leading-tight tracking-[0.18em] sm:truncate sm:leading-none sm:tracking-[0.28em]"
            :class="stat.accent ? 'text-[#6f5836]' : 'text-[#8a8278]'"
          >
            {{ stat.label }}
          </span>
        </div>
        <span
          class="self-end font-serif text-lg font-medium leading-none tabular-nums tracking-tight sm:self-auto sm:text-xl"
          :class="stat.accent ? 'text-[#6f5836]' : 'text-[#1c1a17]'"
        >
          {{ stat.value }}
        </span>
      </div>
    </div>

    <!-- Slim progress bar: analyzed / queued for review -->
    <div
      v-if="isLoading || (hasSearched && targetValues.found > 0)"
      class="relative h-[3px] w-full overflow-hidden bg-[#e6e0d6]"
      aria-hidden="true"
    >
      <div
        class="absolute inset-y-0 left-0 bg-[#8b6f47] transition-[width] duration-500 ease-out"
        :style="{ width: `${progressPercent}%` }"
      ></div>
      <div
        v-if="isLoading"
        class="mybnb-progress-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3"
      ></div>
    </div>

    <!-- Status line: rotating playful text while loading, final count when done -->
    <div class="min-h-[1.25rem]">
      <transition name="loading-fade" mode="out-in">
        <span
          v-if="isLoading"
          :key="displayedLoadingText"
          class="block font-serif text-sm italic text-[#8b6f47]"
        >
          {{ displayedLoadingText }}
        </span>
        <span
          v-else-if="hasSearched"
          key="result-count"
          class="block text-[11px] uppercase tracking-[0.32em] text-[#8a8278]"
        >
          {{ resultsCount }} properties found
        </span>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}
.loading-fade-enter-from {
  opacity: 0;
  transform: translateY(3px);
}
.loading-fade-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

.mybnb-progress-dot {
  animation: mybnb-progress-pulse 1.4s ease-in-out infinite;
}
@keyframes mybnb-progress-pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.85);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.mybnb-progress-sheen {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(139, 111, 71, 0.55) 50%,
    transparent 100%
  );
  animation: mybnb-progress-sheen 1.6s linear infinite;
}
@keyframes mybnb-progress-sheen {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}
</style>
