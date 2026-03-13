<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProjects } from '../api/project'
import ProjectCard from '../components/ProjectCard.vue'

const projects = ref([])
const search = ref('')
const selectedTech = ref('')

onMounted(async () => {
  projects.value = await getProjects()
})

// 모든 기술 스택 추출
const allTechs = computed(() => {
  const techs = new Set()
  projects.value.forEach(p => {
    p.techStack?.split(',').forEach(t => techs.add(t.trim()))
  })
  return [...techs].sort()
})

// 필터링
const filtered = computed(() => {
  return projects.value.filter(p => {
    const matchSearch = !search.value ||
      p.name.toLowerCase().includes(search.value.toLowerCase()) ||
      p.description.toLowerCase().includes(search.value.toLowerCase()) ||
      p.highlights?.toLowerCase().includes(search.value.toLowerCase())
    const matchTech = !selectedTech.value ||
      p.techStack?.split(',').map(t => t.trim()).includes(selectedTech.value)
    return matchSearch && matchTech
  })
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2 dark:text-white">Projects</h1>
      <p class="text-gray-500 dark:text-gray-400">주요 프로젝트와 기여 내용을 정리했습니다.</p>
    </div>

    <!-- 검색/필터 -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        v-model="search"
        placeholder="프로젝트 검색..."
        class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
      />
      <select
        v-model="selectedTech"
        class="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      >
        <option value="">전체 기술</option>
        <option v-for="tech in allTechs" :key="tech" :value="tech">{{ tech }}</option>
      </select>
    </div>

    <p v-if="filtered.length !== projects.length" class="text-sm text-gray-400 mb-4 dark:text-gray-500">
      {{ filtered.length }} / {{ projects.length }}건 표시
    </p>

    <div class="grid gap-4">
      <ProjectCard v-for="project in filtered" :key="project.id" :project="project" />
    </div>

    <p v-if="filtered.length === 0 && projects.length > 0" class="text-center text-gray-400 py-12 dark:text-gray-500">
      검색 결과가 없습니다.
    </p>
  </div>
</template>
