<script setup lang="ts">
import { onUnmounted } from 'vue'

import LoadingAnimation from '../components/LoadingAnimation.vue'
import PropertyList from '../components/PropertyList.vue'
import SearchBar from '../components/SearchBar.vue'
import { createHomeSearchController } from './homeSearchController'

const { properties, isLoading, hasSearched, loadingText, handleSearch, dispose } =
  createHomeSearchController()

onUnmounted(() => {
  dispose()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-12 text-center">
        <img src="/logo.png" alt="MyBnB logo" class="mx-auto mb-4 h-24 w-24" />
        <h1
          class="mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-5xl font-bold text-transparent"
        >
          myBnB
        </h1>
        <p class="mx-auto max-w-2xl text-lg text-slate-300">
          Find your perfect furnished apartment for short-term and long-term stays
        </p>
      </div>

      <SearchBar :isLoading="isLoading" @search="handleSearch" />

      <div v-if="hasSearched" class="mx-auto mt-8 max-w-4xl">
        <h2 class="mb-2 text-center text-2xl font-semibold text-white">
          {{ isLoading ? loadingText : `${properties.length} properties found` }}
        </h2>
        <LoadingAnimation v-if="isLoading" />
        <PropertyList :properties="properties" :isLoading="isLoading" />
      </div>

      <div v-if="!hasSearched" class="py-16 text-center">
        <div class="mb-4 text-lg text-slate-400">
          Start your search to discover amazing properties
        </div>
        <div class="text-sm text-slate-500">Enter your search terms above</div>
      </div>
    </div>
  </div>
</template>
