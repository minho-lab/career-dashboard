<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProjects } from '../api/project'
import { getAchievements } from '../api/achievement'

const projects = ref([])
const achievements = ref([])

onMounted(async () => {
  const [pjs, achs] = await Promise.all([getProjects(), getAchievements()])
  projects.value = pjs
  achievements.value = achs
})

// --- Metric parsing helpers ---

function parseTicketCount(metrics) {
  if (!metrics) return 0
  let total = 0
  // Match "외 N건" pattern
  const oiMatches = metrics.matchAll(/외\s+([\d,]+)건/g)
  for (const m of oiMatches) {
    total += parseInt(m[1].replace(/,/g, ''), 10)
  }
  // Match standalone "N건" (not part of 외 or →) for ticket-like references
  const gunMatches = metrics.matchAll(/(?<!외\s)([\d,]+)건(?!.*→)/g)
  for (const m of gunMatches) {
    const num = parseInt(m[1].replace(/,/g, ''), 10)
    if (num > 100) total += num
  }
  // Count individual ECOMS ticket references
  const ticketMatches = metrics.matchAll(/ECOMS-\d+/g)
  const tickets = [...ticketMatches]
  if (tickets.length > 0 && total === 0) {
    total += tickets.length
  }
  return total
}

function extractPercentMetrics(metrics) {
  if (!metrics) return []
  const results = []
  // Match patterns like "CS 문의 67% 감소" or "출고후취소 95% 감소"
  const pctPattern = /([^\s,]+(?:\s[^\s,]+)?)\s+([\d.]+)%\s*(감소|증가|개선|향상)/g
  let m
  while ((m = pctPattern.exec(metrics)) !== null) {
    results.push({
      label: m[1],
      value: parseFloat(m[2]),
      direction: m[3],
    })
  }
  return results
}

function extractBeforeAfterMetrics(metrics) {
  if (!metrics) return []
  const results = []
  // Match "632건→20~50건" or "N건→N건"
  const arrowPattern = /([^\s,]+)\s*([\d,]+)건\s*→\s*([\d,~]+)건/g
  let m
  while ((m = arrowPattern.exec(metrics)) !== null) {
    const before = parseInt(m[2].replace(/,/g, ''), 10)
    const afterStr = m[3].replace(/,/g, '')
    // Handle "20~50" → take average
    let after
    if (afterStr.includes('~')) {
      const parts = afterStr.split('~').map(Number)
      after = Math.round((parts[0] + parts[1]) / 2)
    } else {
      after = parseInt(afterStr, 10)
    }
    results.push({
      label: m[1],
      before,
      after,
      reduction: Math.round((1 - after / before) * 100),
    })
  }
  return results
}

function extractCountMetrics(metrics) {
  if (!metrics) return []
  const results = []
  // Match "커밋 142건" or "기술 문서 8건"
  const countPattern = /([가-힣a-zA-Z\s]+?)\s*([\d,]+)건/g
  let m
  while ((m = countPattern.exec(metrics)) !== null) {
    const label = m[1].trim()
    const value = parseInt(m[2].replace(/,/g, ''), 10)
    // Skip very large numbers (those are ticket aggregates)
    if (value < 10000 && !label.includes('외')) {
      results.push({ label, value })
    }
  }
  return results
}

// --- Computed summaries ---

const totalProjects = computed(() => projects.value.length)
const totalAchievements = computed(() => achievements.value.length)

const totalTickets = computed(() => {
  let sum = 0
  for (const a of achievements.value) {
    sum += parseTicketCount(a.metrics)
  }
  return sum
})

const allPercentMetrics = computed(() => {
  const results = []
  for (const a of achievements.value) {
    for (const pm of extractPercentMetrics(a.metrics)) {
      results.push({ ...pm, achievementTitle: a.title })
    }
  }
  return results
})

const allBeforeAfterMetrics = computed(() => {
  const results = []
  for (const a of achievements.value) {
    for (const ba of extractBeforeAfterMetrics(a.metrics)) {
      results.push({ ...ba, achievementTitle: a.title })
    }
  }
  return results
})

const allCountMetrics = computed(() => {
  const results = []
  for (const a of achievements.value) {
    for (const cm of extractCountMetrics(a.metrics)) {
      results.push({ ...cm, achievementTitle: a.title })
    }
  }
  return results
})

const keyImprovements = computed(() => {
  const pcts = allPercentMetrics.value
  if (pcts.length === 0) return []
  return [...pcts].sort((a, b) => b.value - a.value).slice(0, 3)
})

const achievementsByProject = computed(() => {
  const map = new Map()
  for (const p of projects.value) {
    map.set(p.id, { name: p.title || p.name, count: 0 })
  }
  for (const a of achievements.value) {
    if (map.has(a.projectId)) {
      map.get(a.projectId).count++
    } else {
      map.set(a.projectId, { name: `Project ${a.projectId}`, count: 1 })
    }
  }
  return [...map.values()].filter(v => v.count > 0).sort((a, b) => b.count - a.count)
})

const maxAchievementCount = computed(() => {
  return Math.max(...achievementsByProject.value.map(p => p.count), 1)
})

function directionColor(direction) {
  if (['감소', '개선'].includes(direction)) return 'bg-green-500'
  return 'bg-blue-500'
}

function directionBgColor(direction) {
  if (['감소', '개선'].includes(direction)) return 'bg-green-50 dark:bg-green-900/20'
  return 'bg-blue-50 dark:bg-blue-900/20'
}

function directionTextColor(direction) {
  if (['감소', '개선'].includes(direction)) return 'text-green-700 dark:text-green-400'
  return 'text-blue-700 dark:text-blue-400'
}
</script>

<template>
  <div class="space-y-10">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Dashboard</h1>
      <p class="text-gray-500 dark:text-gray-400">정량적 성과를 시각화합니다.</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Projects -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">프로젝트</p>
        </div>
        <p class="text-3xl font-bold dark:text-gray-200">{{ totalProjects }}</p>
      </div>

      <!-- Total Achievements -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">성과 항목</p>
        </div>
        <p class="text-3xl font-bold dark:text-gray-200">{{ totalAchievements }}</p>
      </div>

      <!-- Total Jira Tickets -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Jira 티켓</p>
        </div>
        <p class="text-3xl font-bold dark:text-gray-200">{{ totalTickets.toLocaleString() }}</p>
      </div>

      <!-- Key Improvement -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">최대 개선율</p>
        </div>
        <p class="text-3xl font-bold dark:text-gray-200">
          {{ keyImprovements.length > 0 ? keyImprovements[0].value + '%' : '-' }}
        </p>
        <p v-if="keyImprovements.length > 0" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ keyImprovements[0].label }} {{ keyImprovements[0].direction }}
        </p>
      </div>
    </div>

    <!-- Percentage Metrics -->
    <div v-if="allPercentMetrics.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-xl font-bold mb-6 dark:text-gray-200">개선율 지표</h2>
      <div class="space-y-5">
        <div v-for="(metric, i) in allPercentMetrics" :key="'pct-' + i">
          <div class="flex items-center justify-between mb-1.5">
            <div>
              <span class="font-medium dark:text-gray-200">{{ metric.label }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">{{ metric.achievementTitle }}</span>
            </div>
            <span
              class="text-sm font-semibold px-2 py-0.5 rounded-full"
              :class="[directionBgColor(metric.direction), directionTextColor(metric.direction)]"
            >
              {{ metric.value }}% {{ metric.direction }}
            </span>
          </div>
          <div class="w-full h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
            <!-- "Before" full bar (100%) -->
            <div class="absolute inset-0 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
            <!-- "After" bar showing remaining (inverted for 감소) -->
            <div
              class="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
              :class="directionColor(metric.direction)"
              :style="{ width: metric.value + '%' }"
            ></div>
            <div class="absolute inset-0 flex items-center px-3">
              <span class="text-xs font-medium text-white drop-shadow">{{ metric.value }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Before/After Metrics -->
    <div v-if="allBeforeAfterMetrics.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-xl font-bold mb-6 dark:text-gray-200">Before / After 비교</h2>
      <div class="space-y-6">
        <div v-for="(metric, i) in allBeforeAfterMetrics" :key="'ba-' + i">
          <div class="flex items-center justify-between mb-2">
            <div>
              <span class="font-medium dark:text-gray-200">{{ metric.label }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">{{ metric.achievementTitle }}</span>
            </div>
            <span class="text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
              {{ metric.reduction }}% 감소
            </span>
          </div>
          <!-- Before bar -->
          <div class="flex items-center gap-3 mb-1.5">
            <span class="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">Before</span>
            <div class="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-red-400 dark:bg-red-500 rounded-full transition-all duration-700 ease-out"
                :style="{ width: '100%' }"
              ></div>
            </div>
            <span class="text-sm font-medium dark:text-gray-300 w-16">{{ metric.before.toLocaleString() }}건</span>
          </div>
          <!-- After bar -->
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">After</span>
            <div class="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-green-500 rounded-full transition-all duration-700 ease-out"
                :style="{ width: Math.max((metric.after / metric.before) * 100, 2) + '%' }"
              ></div>
            </div>
            <span class="text-sm font-medium dark:text-gray-300 w-16">{{ metric.after.toLocaleString() }}건</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Count Metrics -->
    <div v-if="allCountMetrics.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-xl font-bold mb-6 dark:text-gray-200">정량 지표</h2>
      <div class="space-y-4">
        <div v-for="(metric, i) in allCountMetrics" :key="'cnt-' + i">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-medium dark:text-gray-200">{{ metric.label }}</span>
            <span class="text-sm font-semibold text-blue-700 dark:text-blue-400">{{ metric.value.toLocaleString() }}건</span>
          </div>
          <div class="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
              :style="{ width: Math.min((metric.value / Math.max(...allCountMetrics.map(m => m.value))) * 100, 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievements by Project -->
    <div v-if="achievementsByProject.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-xl font-bold mb-6 dark:text-gray-200">프로젝트별 성과</h2>
      <div class="space-y-4">
        <div v-for="(proj, i) in achievementsByProject" :key="'proj-' + i">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-medium text-sm dark:text-gray-200">{{ proj.name }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ proj.count }}건</span>
          </div>
          <div class="w-full h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-purple-500 rounded-full transition-all duration-700 ease-out"
              :style="{ width: (proj.count / maxAchievementCount) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
