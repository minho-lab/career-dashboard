<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAchievements } from '../api/achievement'
import { getProjects } from '../api/project'
import AchievementCard from '../components/AchievementCard.vue'

const achievements = ref([])
const projects = ref([])
const search = ref('')
const selectedProject = ref('')

onMounted(async () => {
  const [a, p] = await Promise.all([getAchievements(), getProjects()])
  achievements.value = a
  projects.value = p
})

const filtered = computed(() => {
  return achievements.value.filter(a => {
    const matchSearch = !search.value ||
      a.title.toLowerCase().includes(search.value.toLowerCase()) ||
      a.summary?.toLowerCase().includes(search.value.toLowerCase()) ||
      a.problem?.toLowerCase().includes(search.value.toLowerCase()) ||
      a.solution?.toLowerCase().includes(search.value.toLowerCase()) ||
      a.result?.toLowerCase().includes(search.value.toLowerCase())
    const matchProject = !selectedProject.value ||
      a.projectId === Number(selectedProject.value)
    return matchSearch && matchProject
  })
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2 dark:text-white">Achievements</h1>
      <p class="text-gray-500 dark:text-gray-400">문제 해결 과정과 정량적 성과를 정리했습니다.</p>
    </div>

    <!-- 검색/필터 -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        v-model="search"
        placeholder="성과 검색..."
        class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
      />
      <select
        v-model="selectedProject"
        class="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      >
        <option value="">전체 프로젝트</option>
        <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </div>

    <p v-if="filtered.length !== achievements.length" class="text-sm text-gray-400 mb-4 dark:text-gray-500">
      {{ filtered.length }} / {{ achievements.length }}건 표시
    </p>

    <div class="grid gap-4">
      <AchievementCard v-for="a in filtered" :key="a.id" :achievement="a" />
    </div>

    <p v-if="filtered.length === 0 && achievements.length > 0" class="text-center text-gray-400 py-12 dark:text-gray-500">
      검색 결과가 없습니다.
    </p>
  </div>
</template>
