<script setup>
import { ref, onMounted } from 'vue'
import { getProfile } from '../api/profile'
import { getProjects } from '../api/project'
import ProjectCard from '../components/ProjectCard.vue'
import SkillBadge from '../components/SkillBadge.vue'

const profile = ref(null)
const projects = ref([])

onMounted(async () => {
  const [p, pjs] = await Promise.all([getProfile(), getProjects()])
  profile.value = p
  projects.value = pjs
})

const skillList = (skills) => skills?.split(',').map(s => s.trim()) || []
</script>

<template>
  <div v-if="profile" class="space-y-20">
    <!-- Hero -->
    <section class="text-center py-20">
      <div class="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
        <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        Backend Engineer
      </div>
      <h1 class="text-5xl font-extrabold tracking-tight mb-4 dark:text-white">{{ profile.name }}</h1>
      <p class="text-xl text-gray-500 dark:text-gray-400 mb-8">{{ profile.title }}</p>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed text-lg">{{ profile.summary }}</p>
      <div class="mt-10 flex justify-center gap-4">
        <RouterLink to="/projects" class="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
          Projects
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </RouterLink>
        <RouterLink to="/contact" class="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          Contact
        </RouterLink>
      </div>
    </section>

    <!-- Skills -->
    <section>
      <div class="flex items-center gap-3 mb-6">
        <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        </div>
        <h2 class="text-2xl font-bold dark:text-white">Skills</h2>
      </div>
      <div class="flex flex-wrap gap-2">
        <SkillBadge v-for="skill in skillList(profile.skills)" :key="skill" :label="skill" />
      </div>
    </section>

    <!-- Projects -->
    <section v-if="projects.length">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h2 class="text-2xl font-bold dark:text-white">Projects</h2>
        </div>
        <RouterLink to="/projects" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium">
          View all &rarr;
        </RouterLink>
      </div>
      <div class="grid gap-4">
        <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
      </div>
    </section>
  </div>
</template>
