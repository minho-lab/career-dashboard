<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProjects } from '../api/project'
import { getAchievements } from '../api/achievement'

const router = useRouter()
const projects = ref([])
const achievements = ref([])
const loading = ref(true)

function parsePeriodToDate(period) {
  if (!period) return null
  const match = period.match(/(\d{4})\.(\d{1,2})/)
  if (!match) return null
  return { year: parseInt(match[1]), month: parseInt(match[2]) }
}

const timelineItems = computed(() => {
  const items = []

  projects.value.forEach(p => {
    const date = parsePeriodToDate(p.period)
    items.push({
      type: 'project',
      id: p.id,
      title: p.name,
      description: p.description,
      date,
      dateLabel: p.period,
      role: p.role,
      techStack: p.techStack,
      sortOrder: p.sortOrder,
    })
  })

  achievements.value.forEach(a => {
    const project = projects.value.find(p => p.id === a.projectId)
    const date = project ? parsePeriodToDate(project.period) : null
    items.push({
      type: 'achievement',
      id: a.id,
      projectId: a.projectId,
      title: a.title,
      description: a.summary,
      date,
      dateLabel: project ? project.period : '',
      sortOrder: a.sortOrder,
    })
  })

  items.sort((a, b) => {
    if (a.date && b.date) {
      if (a.date.year !== b.date.year) return b.date.year - a.date.year
      if (a.date.month !== b.date.month) return b.date.month - a.date.month
    }
    if (a.date && !b.date) return -1
    if (!a.date && b.date) return 1
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  })

  return items
})

const yearMarkers = computed(() => {
  const years = new Set()
  const markers = {}
  timelineItems.value.forEach((item, index) => {
    if (item.date && !years.has(item.date.year)) {
      years.add(item.date.year)
      markers[index] = item.date.year
    }
  })
  return markers
})

function goToProject(id) {
  router.push(`/projects/${id}`)
}

onMounted(async () => {
  const [p, a] = await Promise.all([getProjects(), getAchievements()])
  projects.value = p
  achievements.value = a
  loading.value = false
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-12">
      <h1 class="text-3xl font-bold mb-2 dark:text-white">Timeline</h1>
      <p class="text-gray-500 dark:text-gray-400">프로젝트와 성과를 시간순으로 정리했습니다.</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <!-- Timeline -->
    <div v-else class="relative">
      <!-- Center line -->
      <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2"></div>

      <div v-for="(item, index) in timelineItems" :key="`${item.type}-${item.id}`" class="relative">
        <!-- Year marker -->
        <div v-if="yearMarkers[index]" class="flex justify-center mb-8" :class="index > 0 ? 'mt-12' : ''">
          <span
            class="relative z-10 inline-block px-5 py-1.5 rounded-full text-sm font-semibold
                   bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800 shadow"
          >
            {{ yearMarkers[index] }}
          </span>
        </div>

        <!-- Timeline item -->
        <div
          class="flex items-start mb-8 group"
          :class="[
            'md:w-1/2',
            index % 2 === 0 ? 'md:mr-auto md:pr-10' : 'md:ml-auto md:pl-10',
            'pl-10 md:pl-0'
          ]"
        >
          <!-- Dot on the line -->
          <div
            class="absolute left-4 md:left-1/2 w-4 h-4 rounded-full border-2 -translate-x-1/2 z-10
                   transition-transform group-hover:scale-125"
            :class="item.type === 'project'
              ? 'bg-blue-500 border-blue-300 dark:border-blue-700'
              : 'bg-green-500 border-green-300 dark:border-green-700'"
          ></div>

          <!-- Card -->
          <div
            class="w-full border rounded-xl p-5 transition-all duration-200
                   bg-white border-gray-200 shadow-sm hover:shadow-md
                   dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-lg"
            :class="[
              item.type === 'project' ? 'cursor-pointer hover:-translate-y-0.5' : '',
              item.type === 'project' ? 'border-l-4 border-l-blue-500 dark:border-l-blue-400' : 'border-l-4 border-l-green-500 dark:border-l-green-400'
            ]"
            @click="item.type === 'project' ? goToProject(item.id) : null"
          >
            <!-- Type badge & date -->
            <div class="flex items-center justify-between mb-2">
              <span
                class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="item.type === 'project'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'"
              >
                {{ item.type === 'project' ? 'Project' : 'Achievement' }}
              </span>
              <span v-if="item.dateLabel" class="text-xs text-gray-400 dark:text-gray-500">
                {{ item.dateLabel }}
              </span>
            </div>

            <!-- Title -->
            <h3
              class="font-semibold mb-1 dark:text-white"
              :class="item.type === 'project' ? 'text-lg' : 'text-base'"
            >
              {{ item.title }}
            </h3>

            <!-- Description -->
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {{ item.description }}
            </p>

            <!-- Role for projects -->
            <p v-if="item.type === 'project' && item.role" class="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {{ item.role }}
            </p>

            <!-- Tech stack for projects -->
            <div v-if="item.type === 'project' && item.techStack && item.techStack.length" class="flex flex-wrap gap-1.5 mt-3">
              <span
                v-for="tech in item.techStack.slice(0, 5)"
                :key="tech"
                class="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600
                       dark:bg-gray-700 dark:text-gray-300"
              >
                {{ tech }}
              </span>
              <span v-if="item.techStack.length > 5" class="text-xs text-gray-400 self-center">
                +{{ item.techStack.length - 5 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
