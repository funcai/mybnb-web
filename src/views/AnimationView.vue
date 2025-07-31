<template>
  <div class="animation-container">
    <div class="image-grid" :class="{ 'zoomed-out': isZoomedOut }">
      <div v-for="index in 81" :key="index" class="image-item">
        <video
          v-if="index === 41"
          src="/rooms/room-video.mp4"
          class="grid-image"
          autoplay
          muted
        ></video>
        <img v-else :src="`/rooms/${index + 1}.jpg`" :alt="`Image ${index}`" class="grid-image" />
        <!-- Overlay for all items including video -->
        <div
          v-if="overlayStates[index]"
          class="overlay"
          :class="{
            'overlay-green': overlayStates[index] === 'green',
            'overlay-red': overlayStates[index] === 'red',
          }"
        >
          <div class="overlay-icon">
            <span v-if="overlayStates[index] === 'green'" class="checkmark">✓</span>
            <span v-if="overlayStates[index] === 'red'" class="x-mark">✕</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const zoomOutTimeOffset = 5000
const baseOffset = 6000

const isZoomedOut = ref(false)
const overlayStates = ref<{ [key: number]: 'green' | 'red' | null }>({})

// Audio context for blip sounds
const audioContext: AudioContext | null = null

function playBlipSound() {
  return
}

onMounted(() => {
  setTimeout(() => {
    isZoomedOut.value = true
  }, zoomOutTimeOffset)

  // Start overlay animations after 15 second base offset
  startOverlayAnimations()
})

function startOverlayAnimations() {
  let currentDelay = 0

  // Get all image indices (excluding video at index 41) and shuffle them
  const imageIndices = Array.from({ length: 81 }, (_, i) => i + 1).filter((i) => i !== 41)

  // Shuffle the array to randomize order
  for (let i = imageIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[imageIndices[i], imageIndices[j]] = [imageIndices[j], imageIndices[i]]
  }

  // Animate all images first
  imageIndices.forEach((index, sequenceIndex) => {
    // Calculate accelerating delay: starts at 1000ms, decreases by 5% each time
    const delayDecrement = Math.pow(0.95, sequenceIndex)
    const delay = Math.max(50, 400 * delayDecrement) // minimum 50ms delay
    currentDelay += delay

    setTimeout(() => {
      // Randomly assign green (checkmark) or red (X)
      overlayStates.value[index] = Math.random() > 0.5 ? 'green' : 'red'
      playBlipSound()
    }, baseOffset + currentDelay)
  })

  // Add video (index 41) at the very end with green checkmark
  const finalDelay = Math.max(100, 500 * Math.pow(0.95, imageIndices.length))
  currentDelay += finalDelay

  setTimeout(
    () => {
      overlayStates.value[41] = 'green' // Always green for the video
      playBlipSound()
    },
    baseOffset + currentDelay + 800,
  )
}
</script>

<style scoped>
.animation-container {
  padding: 20px;
  width: 100%;
  height: 100vh;
  overflow: auto;
  background-color: #111111;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 10px;
  width: 100%;
  place-items: center;
  transform-style: preserve-3d;
  transform: scale(11) translateX(0) translateY(0);
  transform-origin: center center;
  transition: transform 3s ease-out;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: transform;
}

.image-grid.zoomed-out {
  transform: scale(1) translateX(0) translateY(0);
}

.image-item {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  width: 200px;
  height: 107px;
  position: relative;
}

.grid-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  animation: fadeInOverlay 0.3s ease-in-out forwards;
}

.overlay-green {
  background-color: rgba(34, 197, 94, 0.8);
}

.overlay-red {
  background-color: rgba(239, 68, 68, 0.8);
}

.overlay-icon {
  font-size: 48px;
  font-weight: bold;
  color: white;
  animation: scaleInIcon 0.4s ease-out 0.1s both;
}

.checkmark {
  display: inline-block;
}

.x-mark {
  display: inline-block;
}

@keyframes fadeInOverlay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleInIcon {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
