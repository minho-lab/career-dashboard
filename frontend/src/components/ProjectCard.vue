<script setup>
import { RouterLink } from 'vue-router'
import SkillBadge from './SkillBadge.vue'

const props = defineProps({
  project: Object,
})

const techList = props.project.techStack?.split(',').map(s => s.trim()) || []
</script>

<template>
  <RouterLink :to="`/projects/${project.id}`"
    class="group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg hover:shadow-blue-50 dark:hover:shadow-blue-900/20 transition-all duration-200">
    <div class="flex items-start justify-between mb-2">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{{ project.name }}</h3>
      <span class="text-sm text-gray-400 shrink-0 ml-4 font-mono">{{ project.period }}</span>
    </div>
    <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 leading-relaxed">{{ project.description }}</p>
    <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-4">
      <span>{{ project.role }}</span>
      <span v-if="project.teamSize" class="text-gray-300 dark:text-gray-600">|</span>
      <span v-if="project.teamSize">{{ project.teamSize }}</span>
    </div>
    <div class="flex flex-wrap gap-1.5">
      <SkillBadge v-for="tech in techList" :key="tech" :label="tech" />
    </div>
    <div class="mt-4 flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
      View details
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
    </div>
  </RouterLink>
</template>
