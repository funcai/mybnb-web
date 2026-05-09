<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

import SearchBar from '../components/SearchBar.vue'

const router = useRouter()
const route = useRoute()

const handleSearch = (query: string) => {
  const trimmed = query.trim()
  if (!trimmed) return
  // Preserve `mock` (and any other) query params from the home URL.
  const passthrough: Record<string, string> = {}
  for (const [key, value] of Object.entries(route.query)) {
    if (typeof value === 'string') passthrough[key] = value
  }
  router.push({ name: 'search', query: { ...passthrough, q: trimmed } })
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-[#f7f3ec] text-[#1c1a17]">
    <!-- ============================== HERO ============================== -->
    <section class="relative grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      <!-- LEFT: editorial content + search -->
      <div class="relative flex flex-col px-5 py-8 sm:px-12 sm:py-10 lg:px-16 lg:py-12">
        <!-- Wordmark / brand row -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img src="/logo.png" alt="MyBnB logo" class="h-8 w-8 opacity-90" />
            <span class="font-serif text-lg font-medium tracking-tight text-[#1c1a17]">
              myBnB
            </span>
          </div>
          <a
            href="#technology"
            class="text-[10px] uppercase tracking-[0.32em] text-[#8a8278] transition-colors hover:text-[#8b6f47]"
          >
            Technology
          </a>
        </div>

        <!-- Centered hero block -->
        <div class="flex flex-1 flex-col justify-center py-12 sm:py-16">
          <div class="max-w-xl">
            <div
              class="mb-5 text-[10px] font-medium uppercase tracking-[0.28em] text-[#8b6f47] sm:text-[11px] sm:tracking-[0.32em]"
            >
              — A window into the world of apartments —
            </div>
            <h1
              class="font-serif text-[2.75rem] font-medium leading-[0.98] tracking-tight text-[#1c1a17] sm:text-7xl xl:text-[5.75rem]"
            >
              Find an apartment
              <span class="block italic text-[#4a4640]">that feels like yours.</span>
            </h1>
            <p
              class="mt-6 max-w-lg font-serif text-base italic leading-relaxed text-[#4a4640] sm:mt-8 sm:text-xl"
            >
              Curated furnished homes for short-term and long-term stays — judged image-by-image by
              our own vision-language engine, FlashJudge.
            </p>

            <div class="mt-8 sm:mt-10">
              <SearchBar @search="handleSearch" />
            </div>
          </div>
        </div>

        <!-- Footer-style index line -->
        <div
          class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-[#e6e0d6] pt-5 text-[9px] uppercase tracking-[0.28em] text-[#8a8278] sm:text-[10px] sm:tracking-[0.32em]"
        >
          <span>Vienna · Berlin · Munich · Augsburg · Hamburg</span>
          <span class="hidden sm:inline">Est. Apartments · Worldwide</span>
        </div>
      </div>

      <!-- RIGHT: full-bleed editorial image -->
      <div class="relative min-h-[40vh] overflow-hidden sm:min-h-[55vh] lg:min-h-screen">
        <img
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=75"
          alt="A curated apartment interior"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <!-- Subtle paper-tinted overlay for cohesion with the cream background -->
        <div
          aria-hidden="true"
          class="absolute inset-0 bg-gradient-to-tr from-[#1c1a17]/30 via-transparent to-[#8b6f47]/15"
        ></div>

        <!-- Plate caption -->
        <figcaption
          class="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-[10px] uppercase tracking-[0.32em] text-[#f7f3ec] sm:left-10 sm:right-10"
        >
          <div class="flex items-center gap-3">
            <span class="h-px w-10 bg-[#f7f3ec]/80"></span>
            <span>Plate I — A Vienna Altbau, restored.</span>
          </div>
          <span class="hidden sm:inline">No. 001</span>
        </figcaption>
      </div>
    </section>

    <!-- =========================== DETECTION GALLERY =========================== -->
    <section class="border-y border-[#e6e0d6] bg-[#efe9de]/40">
      <div class="mx-auto max-w-[1400px] px-6 pt-12 sm:px-10">
        <div class="flex flex-col items-baseline justify-between gap-2 sm:flex-row">
          <h2 class="font-serif text-2xl font-medium tracking-tight text-[#1c1a17] sm:text-3xl">
            What FlashJudge sees.
          </h2>
          <span class="text-[10px] uppercase tracking-[0.32em] text-[#8a8278]">
            A glimpse · Three of thousands of features
          </span>
        </div>
      </div>

      <div class="mx-auto mt-8 grid max-w-[1400px] grid-cols-1 sm:grid-cols-3">
        <figure class="group relative aspect-[4/3] overflow-hidden border-[#e6e0d6] sm:border-r">
          <img
            src="https://images.unsplash.com/photo-1659114657225-e4e5a2b9449c?auto=format&fit=crop&w=1200&q=75"
            alt="Corridor with a large arched doorway"
            class="h-full w-full object-cover"
          />
          <!-- Detection tag -->
          <div
            class="absolute left-4 top-4 flex items-center gap-2 border border-[#f7f3ec]/80 bg-[#1c1a17]/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.28em] text-[#f7f3ec] backdrop-blur-sm"
          >
            <span class="h-1.5 w-1.5 rotate-45 bg-[#8b6f47]"></span>
            Detected · Wide doorframe
            <span class="ml-1 text-[#d8cfc0]">98%</span>
          </div>
          <figcaption
            class="absolute bottom-0 left-0 right-0 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-[#1c1a17]/85 px-3 py-2 text-[9px] uppercase tracking-[0.24em] text-[#f7f3ec] sm:px-4 sm:text-[10px] sm:tracking-[0.32em]"
          >
            <span>Plate · Doorframe</span>
            <span class="text-[#d8cfc0] normal-case tracking-normal"
              >"Step-free entry, wide doorway"</span
            >
          </figcaption>
        </figure>

        <figure class="group relative aspect-[4/3] overflow-hidden border-[#e6e0d6] sm:border-r">
          <img
            src="https://images.unsplash.com/photo-1528914137830-c85ee162f588?auto=format&fit=crop&w=1200&q=75"
            alt="Home office with a black leather swivel chair next to a desk"
            class="h-full w-full object-cover"
          />
          <div
            class="absolute left-4 top-4 flex items-center gap-2 border border-[#f7f3ec]/80 bg-[#1c1a17]/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.28em] text-[#f7f3ec] backdrop-blur-sm"
          >
            <span class="h-1.5 w-1.5 rotate-45 bg-[#8b6f47]"></span>
            Detected · Office chair
            <span class="ml-1 text-[#d8cfc0]">94%</span>
          </div>
          <figcaption
            class="absolute bottom-0 left-0 right-0 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-[#1c1a17]/85 px-3 py-2 text-[9px] uppercase tracking-[0.24em] text-[#f7f3ec] sm:px-4 sm:text-[10px] sm:tracking-[0.32em]"
          >
            <span>Plate · Workspace</span>
            <span class="text-[#d8cfc0] normal-case tracking-normal"
              >"A proper desk to work from"</span
            >
          </figcaption>
        </figure>

        <figure class="group relative aspect-[4/3] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1758240689297-d8613ca753f3?auto=format&fit=crop&w=1200&q=75"
            alt="Modern kitchen with a central kitchen island"
            class="h-full w-full object-cover"
          />
          <div
            class="absolute left-4 top-4 flex items-center gap-2 border border-[#f7f3ec]/80 bg-[#1c1a17]/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.28em] text-[#f7f3ec] backdrop-blur-sm"
          >
            <span class="h-1.5 w-1.5 rotate-45 bg-[#8b6f47]"></span>
            Detected · Kitchen island
            <span class="ml-1 text-[#d8cfc0]">96%</span>
          </div>
          <figcaption
            class="absolute bottom-0 left-0 right-0 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-[#1c1a17]/85 px-3 py-2 text-[9px] uppercase tracking-[0.24em] text-[#f7f3ec] sm:px-4 sm:text-[10px] sm:tracking-[0.32em]"
          >
            <span>Plate · Kitchen</span>
            <span class="text-[#d8cfc0] normal-case tracking-normal"
              >"An open kitchen with an island"</span
            >
          </figcaption>
        </figure>
      </div>

      <div class="mx-auto max-w-[1400px] px-6 pb-12 pt-6 sm:px-10">
        <p class="font-serif text-base italic text-[#4a4640]">
          Wide doorframes. Office chairs. Kitchen islands. High beds, walk-in showers, herringbone
          parquet — ask for any of it, and FlashJudge will read each photo for you.
        </p>
      </div>
    </section>

    <!-- =========================== TECHNOLOGY =========================== -->
    <section id="technology" class="px-5 py-20 sm:px-6 sm:py-28">
      <div class="mx-auto max-w-5xl">
        <div class="text-center">
          <div class="mb-4 text-[11px] font-medium uppercase tracking-[0.32em] text-[#8b6f47]">
            The Technology
          </div>
          <h2
            class="mx-auto max-w-3xl font-serif text-4xl font-medium leading-tight tracking-tight text-[#1c1a17] sm:text-5xl"
          >
            Meet <em class="text-[#8b6f47]">FlashJudge</em> — a vision-language model engine, tuned
            for apartments.
          </h2>
          <p
            class="mx-auto mt-6 max-w-2xl font-serif text-lg italic leading-relaxed text-[#4a4640]"
          >
            Our custom-trained models, running on a bespoke architecture we call FlashJudge,
            evaluate your prompt against thousands of apartment images per second — with the
            judgment of a real VLM, not a keyword filter.
          </p>
        </div>

        <!-- Stats grid -->
        <div class="mt-16 grid grid-cols-1 border border-[#e6e0d6] bg-white sm:grid-cols-3">
          <div class="border-[#e6e0d6] p-8 sm:border-r">
            <div class="text-[10px] font-medium uppercase tracking-[0.32em] text-[#8a8278]">
              Throughput
            </div>
            <div
              class="mt-3 font-serif text-4xl font-medium tracking-tight text-[#1c1a17] sm:text-5xl"
            >
              1,000<span class="text-[#8b6f47]">+</span>
            </div>
            <div class="mt-1 text-xs text-[#4a4640]">images judged per second</div>
          </div>
          <div class="border-t border-[#e6e0d6] p-8 sm:border-l-0 sm:border-r sm:border-t-0">
            <div class="text-[10px] font-medium uppercase tracking-[0.32em] text-[#8a8278]">
              Architecture
            </div>
            <div
              class="mt-3 font-serif text-4xl font-medium tracking-tight text-[#1c1a17] sm:text-5xl"
            >
              FlashJudge
            </div>
            <div class="mt-1 text-xs text-[#4a4640]">custom-built, end-to-end</div>
          </div>
          <div class="border-t border-[#e6e0d6] p-8 sm:border-t-0">
            <div class="text-[10px] font-medium uppercase tracking-[0.32em] text-[#8a8278]">
              Prompts
            </div>
            <div
              class="mt-3 font-serif text-4xl font-medium tracking-tight text-[#1c1a17] sm:text-5xl"
            >
              Your words<span class="text-[#8b6f47]">.</span>
            </div>
            <div class="mt-1 text-xs text-[#4a4640]">free-form, evaluated by a real VLM</div>
          </div>
        </div>

        <!-- Detail row -->
        <div class="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <div class="text-[10px] font-medium uppercase tracking-[0.32em] text-[#8b6f47]">I.</div>
            <h3 class="mt-2 font-serif text-xl font-medium text-[#1c1a17]">
              Custom-trained models
            </h3>
            <p class="mt-2 text-sm leading-6 text-[#4a4640]">
              Trained specifically on furnished apartment photography, our models recognise the
              subtleties — herringbone parquet, walk-in showers, dining seating, balcony orientation
              — that off-the-shelf VLMs miss.
            </p>
          </div>
          <div>
            <div class="text-[10px] font-medium uppercase tracking-[0.32em] text-[#8b6f47]">
              II.
            </div>
            <h3 class="mt-2 font-serif text-xl font-medium text-[#1c1a17]">A new architecture</h3>
            <p class="mt-2 text-sm leading-6 text-[#4a4640]">
              FlashJudge is our in-house architecture for ultra-fast visual judgment, processing
              thousands of listings simultaneously without sacrificing the depth of a real
              vision-language model.
            </p>
          </div>
          <div>
            <div class="text-[10px] font-medium uppercase tracking-[0.32em] text-[#8b6f47]">
              III.
            </div>
            <h3 class="mt-2 font-serif text-xl font-medium text-[#1c1a17]">
              Your prompt, faithfully
            </h3>
            <p class="mt-2 text-sm leading-6 text-[#4a4640]">
              Ask in plain language — "a high bed in Vienna under €1,200", "a dining table for six
              in Augsburg" — and FlashJudge interprets it visually, the way a person would.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================== FOOTER ============================== -->
    <footer class="border-t border-[#e6e0d6]">
      <div
        class="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-6 py-8 text-[10px] uppercase tracking-[0.32em] text-[#8a8278] sm:flex-row"
      >
        <span>myBnB · Curated Apartment Living</span>
        <span>Powered by FlashJudge</span>
      </div>
    </footer>
  </div>
</template>
