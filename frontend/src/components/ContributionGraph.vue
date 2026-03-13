<script setup>
import { ref, computed, onMounted } from 'vue'

const data = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/api/github/contributions')
    data.value = await res.json()
  } catch { /* ignore */ }
  loading.value = false
})

// 주 단위로 그룹핑 (일→토 기준)
const weeks = computed(() => {
  if (!data.value?.days) return []
  const result = []
  let week = []
  data.value.days.forEach((day, i) => {
    const dow = new Date(day.date).getDay()
    if (i === 0) {
      // 첫 주는 빈 칸으로 패딩
      for (let j = 0; j < dow; j++) week.push(null)
    }
    week.push(day)
    if (dow === 6 || i === data.value.days.length - 1) {
      result.push(week)
      week = []
    }
  })
  return result
})

function getColor(count) {
  if (!count) return 'bg-gray-100 dark:bg-gray-800'
  const max = data.value?.maxCount || 1
  const ratio = count / max
  if (ratio > 0.75) return 'bg-green-600'
  if (ratio > 0.5) return 'bg-green-500'
  if (ratio > 0.25) return 'bg-green-400'
  return 'bg-green-200 dark:bg-green-800'
}

const months = computed(() => {
  if (!data.value?.days) return []
  const result = []
  let lastMonth = ''
  let weekIdx = 0
  weeks.value.forEach((week, i) => {
    const firstDay = week.find(d => d)
    if (firstDay) {
      const month = firstDay.date.slice(0, 7)
      if (month !== lastMonth) {
        const label = new Date(firstDay.date).toLocaleDateString('ko-KR', { month: 'short' })
        result.push({ label, weekIdx: i })
        lastMonth = month
      }
    }
  })
  return result
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold dark:text-white">Contribution Graph</h3>
      <div v-if="data" class="text-sm text-gray-500 dark:text-gray-400">
        {{ data.totalCommits }}건 커밋 / {{ data.activeDays }}일 활동
      </div>
    </div>

    <div v-if="loading" class="text-sm text-gray-400 py-8 text-center">로딩 중...</div>

    <div v-else-if="data && !data.error" class="overflow-x-auto">
      <!-- Month labels -->
      <div class="flex mb-1 ml-0" style="gap: 0;">
        <div
          v-for="m in months" :key="m.label + m.weekIdx"
          class="text-xs text-gray-400 dark:text-gray-500"
          :style="{ position: 'relative', left: (m.weekIdx * 13) + 'px' }"
        >
          {{ m.label }}
        </div>
      </div>

      <!-- Grid -->
      <div class="flex gap-[2px]">
        <div v-for="(week, wi) in weeks" :key="wi" class="flex flex-col gap-[2px]">
          <div
            v-for="(day, di) in week"
            :key="di"
            :class="[
              'w-[11px] h-[11px] rounded-sm',
              day ? getColor(day.count) : 'bg-transparent'
            ]"
            :title="day ? `${day.date}: ${day.count}건` : ''"
          ></div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center justify-end gap-1 mt-3 text-xs text-gray-400 dark:text-gray-500">
        <span>Less</span>
        <div class="w-[11px] h-[11px] rounded-sm bg-gray-100 dark:bg-gray-800"></div>
        <div class="w-[11px] h-[11px] rounded-sm bg-green-200 dark:bg-green-800"></div>
        <div class="w-[11px] h-[11px] rounded-sm bg-green-400"></div>
        <div class="w-[11px] h-[11px] rounded-sm bg-green-500"></div>
        <div class="w-[11px] h-[11px] rounded-sm bg-green-600"></div>
        <span>More</span>
      </div>
    </div>

    <div v-else class="text-sm text-gray-400 py-8 text-center">데이터를 불러올 수 없습니다.</div>
  </div>
</template>
