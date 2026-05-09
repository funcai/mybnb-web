<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from 'vue'

const props = defineProps<{
  /** Source URL of the image this detection box is anchored to. */
  imageSrc: string
  /** Box position/size as percentages of the image's natural dimensions. */
  left: number
  top: number
  width: number
  height: number
}>()

const naturalWidth = ref<number | null>(null)
const naturalHeight = ref<number | null>(null)

const loadImage = (src: string) => {
  const img = new Image()
  img.onload = () => {
    naturalWidth.value = img.naturalWidth
    naturalHeight.value = img.naturalHeight
  }
  img.src = src
}

onMounted(() => loadImage(props.imageSrc))
watch(
  () => props.imageSrc,
  (next) => loadImage(next),
)

const viewBoxWidth = computed(() => naturalWidth.value ?? 1000)
const viewBoxHeight = computed(() => naturalHeight.value ?? 1000)

const rectX = computed(() => (props.left / 100) * viewBoxWidth.value)
const rectY = computed(() => (props.top / 100) * viewBoxHeight.value)
const rectWidth = computed(() => (props.width / 100) * viewBoxWidth.value)
const rectHeight = computed(() => (props.height / 100) * viewBoxHeight.value)

// Outer rectangle followed by a reverse-wound inner rectangle so fill-rule
// "evenodd" punches a hole at the detection region.
const outsidePath = computed(() => {
  const w = viewBoxWidth.value
  const h = viewBoxHeight.value
  const x = rectX.value
  const y = rectY.value
  const rw = rectWidth.value
  const rh = rectHeight.value
  return `M0,0 H${w} V${h} H0 Z M${x},${y} V${y + rh} H${x + rw} V${y} Z`
})

const gradientId = `detection-sweep-${useId()}`

const isReady = computed(() => naturalWidth.value !== null && naturalHeight.value !== null)
</script>

<template>
  <svg
    aria-hidden="true"
    class="detection-svg"
    :class="{ 'detection-svg--ready': isReady }"
    :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient
        :id="gradientId"
        gradientUnits="userSpaceOnUse"
        :x1="0"
        :y1="viewBoxHeight"
        :x2="viewBoxWidth"
        :y2="0"
      >
        <stop offset="0" stop-color="rgba(247, 243, 236, 0.4)" />
        <stop offset="0.42" stop-color="rgba(247, 243, 236, 0.4)" />
        <stop offset="0.5" stop-color="rgb(255, 255, 255)" />
        <stop offset="0.58" stop-color="rgba(247, 243, 236, 0.4)" />
        <stop offset="1" stop-color="rgba(247, 243, 236, 0.4)" />
        <animateTransform
          attributeName="gradientTransform"
          type="translate"
          :values="`${-viewBoxWidth},${viewBoxHeight}; ${viewBoxWidth},${-viewBoxHeight}`"
          dur="2.6s"
          repeatCount="indefinite"
        />
      </linearGradient>
    </defs>

    <!-- Darken everything outside the detected rectangle. -->
    <path :d="outsidePath" fill="rgba(0, 0, 0, 0.38)" fill-rule="evenodd" />

    <!-- Shimmering 1px border around the detected region. -->
    <rect
      :x="rectX"
      :y="rectY"
      :width="rectWidth"
      :height="rectHeight"
      fill="none"
      :stroke="`url(#${gradientId})`"
      stroke-width="1"
      vector-effect="non-scaling-stroke"
    />
  </svg>
</template>

<style scoped>
.detection-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 200ms ease-out;
}

.detection-svg--ready {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .detection-svg animateTransform {
    display: none;
  }
}
</style>
