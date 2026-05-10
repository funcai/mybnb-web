<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface SocialLink {
  label: string
  handle: string
  url: string
}

interface TeamMember {
  name: string
  role: string
  avatar: string
  bio: string
  socials: SocialLink[]
}

const team: TeamMember[] = [
  {
    name: 'Kilian Freitag',
    role: 'Co-founder',
    avatar:
      'https://api.dicebear.com/9.x/initials/svg?seed=Kilian%20Freitag&backgroundColor=1c1a17&textColor=f7f3ec',
    bio: 'Dummy text for now.',
    socials: [],
  },
  {
    name: 'Paul Mohr',
    role: 'Co-founder · Engineering & ML',
    avatar:
      'https://api.dicebear.com/9.x/initials/svg?seed=Paul%20Mohr&backgroundColor=8b6f47&textColor=f7f3ec',
    bio: '15 years of experience in building high performance distributed software in the web that serve hundreds of thousands of users. Researching custom machine learning models and applications for the last 5 years.',
    socials: [
      { label: 'X', handle: '@sopamo', url: 'https://x.com/sopamo' },
      { label: 'GitHub', handle: 'Sopamo', url: 'https://github.com/Sopamo' },
    ],
  },
]
</script>

<template>
  <div class="relative min-h-screen bg-[#f7f3ec] text-[#1c1a17]">
    <!-- Header -->
    <header class="border-b border-[#e6e0d6]">
      <div class="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-6 sm:px-12">
        <RouterLink :to="{ name: 'home' }" class="flex items-center gap-3">
          <img src="/logo.png" alt="42 eyes logo" class="h-8 w-8 opacity-90" />
          <span class="font-serif text-lg font-medium tracking-tight text-[#1c1a17]">
            42 eyes
          </span>
        </RouterLink>
        <RouterLink
          :to="{ name: 'home' }"
          class="text-[10px] uppercase tracking-[0.32em] text-[#8a8278] transition-colors hover:text-[#8b6f47]"
        >
          Back to home
        </RouterLink>
      </div>
    </header>

    <!-- Content -->
    <section class="px-5 py-16 sm:px-12 sm:py-24">
      <div class="mx-auto max-w-5xl">
        <div class="text-center">
          <div class="mb-4 text-[11px] font-medium uppercase tracking-[0.32em] text-[#8b6f47]">
            Contact us
          </div>
          <h1
            class="mx-auto max-w-3xl font-serif text-4xl font-medium leading-tight tracking-tight text-[#1c1a17] sm:text-5xl"
          >
            The people behind <em class="text-[#8b6f47]">42 eyes</em>.
          </h1>
        </div>

        <div class="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <article
            v-for="member in team"
            :key="member.name"
            class="flex flex-col border border-[#e6e0d6] bg-white p-8"
          >
            <div class="flex items-center gap-5">
              <img
                :src="member.avatar"
                :alt="`${member.name} profile picture`"
                class="h-24 w-24 shrink-0 rounded-full border border-[#e6e0d6] object-cover"
              />
              <div class="flex flex-col">
                <h2 class="font-serif text-2xl font-medium tracking-tight text-[#1c1a17]">
                  {{ member.name }}
                </h2>
                <div
                  class="mt-1 text-[10px] font-medium uppercase tracking-[0.32em] text-[#8a8278]"
                >
                  {{ member.role }}
                </div>
              </div>
            </div>
            <p class="mt-6 font-serif text-base leading-relaxed text-[#4a4640]">
              {{ member.bio }}
            </p>

            <div v-if="member.socials.length" class="mt-6 flex flex-wrap gap-3">
              <a
                v-for="social in member.socials"
                :key="social.label"
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 border border-[#e6e0d6] px-3 py-1.5 text-xs text-[#1c1a17] transition-colors hover:border-[#8b6f47] hover:text-[#8b6f47]"
              >
                <span class="text-[10px] font-medium uppercase tracking-[0.28em] text-[#8a8278]">
                  {{ social.label }}
                </span>
                <span class="font-medium">{{ social.handle }}</span>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-[#e6e0d6]">
      <div
        class="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-6 py-8 text-[10px] uppercase tracking-[0.32em] text-[#8a8278] sm:flex-row"
      >
        <span>42 eyes</span>
        <RouterLink :to="{ name: 'contact' }" class="transition-colors hover:text-[#8b6f47]">
          Contact us
        </RouterLink>
        <span>Powered by FlashJudge</span>
      </div>
    </footer>
  </div>
</template>
