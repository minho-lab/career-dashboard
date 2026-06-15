<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProjects } from '../api/project'
import { getAchievements } from '../api/achievement'
import SkillBadge from '../components/SkillBadge.vue'
import MarkdownContent from '../components/MarkdownContent.vue'
import AchievementCard from '../components/AchievementCard.vue'

const project = ref(null)
const achievements = ref([])
const search = ref('')
const viewMode = ref('cards') // 'cards' | 'timeline'

onMounted(async () => {
  const [pjs, achs] = await Promise.all([getProjects(), getAchievements()])
  project.value = pjs[0] || null
  achievements.value = achs
})

const techList = computed(() => project.value?.techStack?.split(',').map(s => s.trim()) || [])

// 다른 회사 면접관도 바로 이해할 수 있도록 도메인/사내 용어를 풀이
const glossary = [
  { term: '클레임 (Claim)', desc: '주문 이후 발생하는 반품·교환·취소 요청 처리 전반을 가리키는 도메인 용어' },
  { term: '출고후취소', desc: '고객이 취소했지만 상품이 이미 출고(배송 시작)된 상태. 왕복 택배비가 발생해 가장 비용이 큰 취소 유형' },
  { term: '회수지시', desc: '택배사 API로 "이 주소로 가서 반품 물건을 수거하라"고 보내는 요청' },
  { term: '사방넷', desc: '여러 쇼핑몰의 주문·클레임을 한 곳으로 모아주는 외부 주문통합 솔루션' },
  { term: '3PL / WMS', desc: '외부 물류대행사(3PL)와 그 창고관리시스템(WMS). 입고·검수·반송 등 물류 처리를 담당' },
  { term: '재고대사', desc: '여러 시스템(OMS·ERP·창고)에 흩어진 재고 수치를 맞춰보고 차이의 원인을 찾는 작업' },
]

function startDate(period) {
  const m = period?.match(/(\d{4})\.(\d{1,2})/)
  return m ? Number(m[1]) * 100 + Number(m[2]) : 0
}

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  const list = achievements.value.filter(a =>
    !q ||
    a.title.toLowerCase().includes(q) ||
    a.summary?.toLowerCase().includes(q) ||
    a.problem?.toLowerCase().includes(q) ||
    a.solution?.toLowerCase().includes(q) ||
    a.result?.toLowerCase().includes(q)
  )
  return [...list].sort((x, y) => startDate(y.period) - startDate(x.period))
})
</script>

<template>
  <div v-if="project" class="space-y-12">
    <!-- Page header -->
    <header>
      <h1 class="text-3xl font-bold mb-2 dark:text-white">Work</h1>
      <p class="text-gray-500 dark:text-gray-400">대표 프로젝트와 그 안에서 만든 성과를 문제→해결→결과 흐름으로 정리했습니다.</p>
    </header>

    <!-- Project overview -->
    <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-7">
      <div class="flex items-start justify-between mb-3">
        <h2 class="text-2xl font-bold dark:text-white">{{ project.name }}</h2>
        <span class="text-sm text-gray-400 font-mono shrink-0 ml-4">{{ project.period }}</span>
      </div>
      <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{{ project.description }}</p>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-5">
        <span>{{ project.role }}</span>
        <span v-if="project.teamSize" class="text-gray-300 dark:text-gray-600">|</span>
        <span v-if="project.teamSize">{{ project.teamSize }}</span>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <SkillBadge v-for="t in techList" :key="t" :label="t" />
      </div>
    </section>

    <!-- 기여 / 도전 / 성과 -->
    <div class="grid md:grid-cols-2 gap-6">
      <section v-if="project.highlights" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
          <span class="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm">✓</span>
          주요 기여
        </h3>
        <MarkdownContent :content="project.highlights" />
      </section>
      <section v-if="project.challenges" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
          <span class="w-6 h-6 bg-amber-100 dark:bg-amber-900/50 rounded flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm">⚡</span>
          기술적 도전
        </h3>
        <MarkdownContent :content="project.challenges" />
      </section>
    </div>

    <section v-if="project.impact" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
        <span class="w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded flex items-center justify-center text-green-600 dark:text-green-400 text-sm">★</span>
        비즈니스 성과
      </h3>
      <MarkdownContent :content="project.impact" />
    </section>

    <!-- Glossary -->
    <section class="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">도메인 용어 (Glossary)</h3>
      <dl class="grid sm:grid-cols-2 gap-x-8 gap-y-3">
        <div v-for="g in glossary" :key="g.term">
          <dt class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ g.term }}</dt>
          <dd class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ g.desc }}</dd>
        </div>
      </dl>
    </section>

    <!-- Achievements -->
    <section>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 class="text-2xl font-bold dark:text-white">성과 상세 <span class="text-base font-normal text-gray-400">{{ achievements.length }}건</span></h2>
        <div class="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            @click="viewMode = 'cards'"
            :class="['px-3 py-1 rounded-md text-sm font-medium transition-colors', viewMode === 'cards' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400']"
          >카드</button>
          <button
            @click="viewMode = 'timeline'"
            :class="['px-3 py-1 rounded-md text-sm font-medium transition-colors', viewMode === 'timeline' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400']"
          >타임라인</button>
        </div>
      </div>

      <input
        v-model="search"
        placeholder="성과 검색 (예: CQRS, 정산, 재시도)..."
        class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 mb-6"
      />

      <!-- Cards view -->
      <div v-if="viewMode === 'cards'" class="grid gap-4">
        <AchievementCard v-for="a in filtered" :key="a.id" :achievement="a" />
      </div>

      <!-- Timeline view -->
      <div v-else class="relative pl-8">
        <div class="absolute left-2 top-1 bottom-1 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        <div v-for="a in filtered" :key="a.id" class="relative mb-6">
          <div class="absolute -left-[26px] top-1.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900"></div>
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-gray-400 font-mono">{{ a.period }}</span>
              <span v-if="a.duration" class="text-xs text-gray-400">{{ a.duration }}</span>
            </div>
            <h3 class="font-semibold dark:text-white mb-1 leading-snug">{{ a.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{{ a.summary }}</p>
            <span v-if="a.metrics" class="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
              {{ a.metrics }}
            </span>
          </div>
        </div>
      </div>

      <p v-if="filtered.length === 0" class="text-center text-gray-400 py-12 dark:text-gray-500">검색 결과가 없습니다.</p>
    </section>
  </div>
</template>
