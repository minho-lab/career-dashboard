<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProject } from '../api/project'
import { getAchievements } from '../api/achievement'
import SkillBadge from '../components/SkillBadge.vue'
import MarkdownContent from '../components/MarkdownContent.vue'
import AchievementCard from '../components/AchievementCard.vue'

const route = useRoute()
const project = ref(null)
const achievements = ref([])

onMounted(async () => {
  const id = route.params.id
  const [p, a] = await Promise.all([getProject(id), getAchievements(id)])
  project.value = p
  achievements.value = a
})

const techList = (stack) => stack?.split(',').map(s => s.trim()) || []
</script>

<template>
  <div v-if="project" class="space-y-8">
    <!-- Back + Header -->
    <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
      <RouterLink to="/projects" class="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium mb-6">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        Projects
      </RouterLink>
      <h1 class="text-3xl font-bold mb-3 dark:text-white">{{ project.name }}</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{{ project.description }}</p>
      <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-5">
        <span class="inline-flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {{ project.period }}
        </span>
        <span class="text-gray-300 dark:text-gray-600">|</span>
        <span>{{ project.role }}</span>
        <template v-if="project.teamSize">
          <span class="text-gray-300 dark:text-gray-600">|</span>
          <span>{{ project.teamSize }}</span>
        </template>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <SkillBadge v-for="tech in techList(project.techStack)" :key="tech" :label="tech" />
      </div>
    </section>

    <!-- Content sections -->
    <div class="grid md:grid-cols-2 gap-6">
      <section v-if="project.highlights" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 class="text-lg font-semibold dark:text-white">주요 기여</h2>
        </div>
        <MarkdownContent :content="project.highlights" />
      </section>

      <section v-if="project.challenges" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-6 h-6 bg-amber-100 dark:bg-amber-900/50 rounded flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h2 class="text-lg font-semibold dark:text-white">기술적 도전</h2>
        </div>
        <MarkdownContent :content="project.challenges" />
      </section>
    </div>

    <section v-if="project.impact" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded flex items-center justify-center">
          <svg class="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </div>
        <h2 class="text-lg font-semibold dark:text-white">성과</h2>
      </div>
      <MarkdownContent :content="project.impact" />
    </section>

    <!-- Related Achievements -->
    <section v-if="achievements.length">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
        </div>
        <h2 class="text-2xl font-bold dark:text-white">관련 성과</h2>
      </div>
      <div class="grid gap-4">
        <AchievementCard v-for="a in achievements" :key="a.id" :achievement="a" />
      </div>
    </section>
  </div>
</template>
