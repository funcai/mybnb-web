<template>
  <div class="animation-container">
    <div class="container">
      <div class="grid" ref="gridRef">
        <div
          v-for="(card, index) in cards"
          :key="index"
          class="card"
          :class="{
            appear: card.isVisible,
            'fade-out': card.isFadingOut,
          }"
        >
          <div class="card-content">
            <div class="overlay" :class="{ show: card.showOverlay }">
              <CheckIcon v-if="card.overlayType === 'success'" class="checkmark" />
              <XMarkIcon v-else-if="card.overlayType === 'error'" class="x-mark" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/solid'

interface Card {
  isVisible: boolean
  isFadingOut: boolean
  showOverlay: boolean
  overlayType: 'success' | 'error' | null
}

const gridRef = ref<HTMLElement>()
const cards = ref<Card[]>([])
const animationRunning = ref(false)
const cardCount = 12

// Initialize cards
const initCards = () => {
  cards.value = Array.from({ length: cardCount }, () => ({
    isVisible: false,
    isFadingOut: false,
    showOverlay: false,
    overlayType: null,
  }))
}

// Utility function to wait
const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Shuffle array utility
const shuffleArray = (array: number[]): void => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

// Reset all cards to initial state
const resetCards = () => {
  cards.value.forEach((card) => {
    card.isVisible = false
    card.isFadingOut = false
    card.showOverlay = false
    card.overlayType = null
  })
}

// Animate cards appearing one by one
const animateAppear = async () => {
  resetCards()

  for (let i = 0; i < cards.value.length; i++) {
    cards.value[i].isVisible = true
    await wait(150) // Stagger the animations
  }

  await wait(300) // Wait for all animations to complete
}

// Show overlays in random order
const showOverlays = async () => {
  // Create array of indices and shuffle for random order
  const indices = Array.from({ length: cards.value.length }, (_, i) => i)
  shuffleArray(indices)

  // Show overlays in random order
  for (const index of indices) {
    const card = cards.value[index]
    const isSuccess = Math.random() > 0.5

    card.overlayType = isSuccess ? 'success' : 'error'
    card.showOverlay = true

    await wait(200) // Stagger overlay appearances
  }

  await wait(1000) // Display final state
}

// Animate cards disappearing
const animateDisappear = async () => {
  // Fade out all cards simultaneously
  cards.value.forEach((card) => {
    card.isFadingOut = true
  })

  await wait(600) // Wait for fade out animation
}

// Main animation loop
const startAnimation = async () => {
  animationRunning.value = true

  while (animationRunning.value) {
    await animateAppear()
    await showOverlays()
    await animateDisappear()
    await wait(500) // Brief pause before loop
  }
}

// Stop animation
const stopAnimation = () => {
  animationRunning.value = false
}

// Lifecycle hooks
onMounted(() => {
  initCards()
  startAnimation()
})

onUnmounted(() => {
  stopAnimation()
})
</script>

<style scoped>
.animation-container {
  margin: 0;
  padding: 40px;
  padding-top: 20px;
  font-family: 'Arial', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  max-width: 800px;
  width: 100%;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  padding: 20px;
}

.card {
  border-radius: 12px;
  aspect-ratio: 4/3;
  position: relative;
  opacity: 0;
  transform: translateY(-20px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card.appear {
  opacity: 1;
  transform: translateY(0);
}

.card.fade-out {
  opacity: 0;
  transform: translateY(20px);
}

.card-content {
  width: 100%;
  height: 100%;
  background: #d5d5d536;
  position: relative;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.overlay.show {
  opacity: 1;
  transform: scale(1);
}

.checkmark {
  color: #8fbc8f;
  width: 35px;
  height: 35px;
  opacity: 0.7;
}

.x-mark {
  color: #f5b2b2;
  width: 35px;
  height: 35px;
  opacity: 0.7;
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    padding: 15px;
  }

  .animation-container {
    padding: 20px;
  }
}
</style>
