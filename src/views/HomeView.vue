<script setup lang="ts">
import { ref } from 'vue';
import SearchBar from '../components/SearchBar.vue';
import PropertyList from '../components/PropertyList.vue';
import type { Property } from '../types/property';
import { searchProperties } from '../services/api';

const properties = ref<Property[]>([]);
const isLoading = ref(false);
const hasSearched = ref(false);

const handleSearch = async (query: string) => {
  isLoading.value = true;
  try {
    const results = await searchProperties(query);
    properties.value = results;
    hasSearched.value = true;
  } catch (error) {
    console.error('Search failed:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          mybnb
        </h1>
        <p class="text-slate-300 text-lg max-w-2xl mx-auto">
          Find your perfect furnished apartment for short-term and long-term stays
        </p>
      </div>

      <!-- Search Bar -->
      <SearchBar @search="handleSearch" :isLoading="isLoading" />

      <!-- Results -->
      <div v-if="hasSearched" class="mt-8 max-w-4xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-semibold text-white mb-2">
            {{ isLoading ? 'Searching...' : `${properties.length} properties found` }}
          </h2>
          <p class="text-slate-400">
            Discover amazing places to stay in Germany
          </p>
        </div>
        <PropertyList :properties="properties" :isLoading="isLoading" />
      </div>

      <!-- Welcome message when no search has been performed -->
      <div v-if="!hasSearched" class="text-center py-16">
        <div class="text-slate-400 text-lg mb-4">
          Start your search to discover amazing properties
        </div>
        <div class="text-slate-500 text-sm">
          Enter your search terms above
        </div>
      </div>
    </div>
  </div>
</template>
