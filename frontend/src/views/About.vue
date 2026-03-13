<script setup>
import { ref, onMounted } from 'vue'
import { getProfile } from '../api/profile'
import SkillBadge from '../components/SkillBadge.vue'
import ContributionGraph from '../components/ContributionGraph.vue'

const profile = ref(null)

onMounted(async () => {
  profile.value = await getProfile()
})

const skillList = (skills) => skills?.split(',').map(s => s.trim()) || []
</script>

<template>
  <div v-if="profile" class="space-y-8">
    <!-- Header -->
    <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
      <h1 class="text-3xl font-bold mb-1 dark:text-white">{{ profile.name }}</h1>
      <p class="text-lg text-gray-500 dark:text-gray-400">{{ profile.title }}</p>
    </section>

    <div class="grid md:grid-cols-3 gap-6">
      <!-- Left: Career + Education -->
      <div class="md:col-span-1 space-y-6">
        <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Career</h2>
          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-sm">{{ profile.career }}</p>
        </section>

        <section v-if="profile.education" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Education</h2>
          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-sm">{{ profile.education }}</p>
        </section>
      </div>

      <!-- Right: Summary + Skills -->
      <div class="md:col-span-2 space-y-6">
        <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">About</h2>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ profile.summary }}</p>
        </section>

        <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Skills</h2>
          <div class="flex flex-wrap gap-2">
            <SkillBadge v-for="skill in skillList(profile.skills)" :key="skill" :label="skill" />
          </div>
        </section>

        <!-- GitHub Contribution Graph -->
        <ContributionGraph />
      </div>
    </div>
  </div>
</template>
