<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getProfile } from '../api/profile'
import { getProjects } from '../api/project'
import { getAchievements } from '../api/achievement'
import SkillBadge from '../components/SkillBadge.vue'

const profile = ref(null)
const project = ref(null)
const achievements = ref([])

onMounted(async () => {
  const [p, pjs, achs] = await Promise.all([getProfile(), getProjects(), getAchievements()])
  profile.value = p
  project.value = pjs[0] || null
  achievements.value = achs
})

const skillList = computed(() => profile.value?.skills?.split(',').map(s => s.trim()) || [])

// 면접관이 30초 안에 봐야 할 비즈니스 임팩트 — 회사 전용 용어는 한 줄 풀이를 함께 표기
const kpis = [
  {
    metric: 'CS 문의 67% ↓',
    detail: '월 85.7건 → 28.3건',
    note: '반품·교환 처리 중 반복되던 IT 문의를 자동화로 제거',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    metric: '출고후취소 95% ↓',
    detail: '월 632건 → 20~50건',
    note: '이미 출고(배송 시작)된 주문의 취소 — 왕복 택배비가 드는 가장 비싼 취소 유형',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    metric: '연 2,000만원+ 절감',
    detail: '택배 회수비 등 운영비용',
    note: '취소·반품 자동화로 절감한 직접 비용',
    color: 'text-amber-600 dark:text-amber-400',
  },
  {
    metric: '1,384건 처리',
    detail: '3년간 Jira 이슈 (일평균 3.4건)',
    note: '운영을 멈추지 않으며 레거시를 점진적으로 개선',
    color: 'text-purple-600 dark:text-purple-400',
  },
]

// 핵심 성과 Top 3 (재설계 / 클레임 자동화 / 출고후취소)
const topAchievements = computed(() =>
  [1, 8, 9].map(id => achievements.value.find(a => a.id === id)).filter(Boolean)
)

const projectTech = computed(() =>
  project.value?.techStack?.split(',').map(t => t.trim()).slice(0, 8) || []
)
</script>

<template>
  <div v-if="profile" class="space-y-24">
    <!-- Hero -->
    <section class="text-center pt-14 pb-4">
      <div class="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
        <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        Backend Engineer · 10년차
      </div>
      <h1 class="text-5xl font-extrabold tracking-tight mb-3 dark:text-white">{{ profile.name }}</h1>
      <p class="text-lg text-gray-500 dark:text-gray-400 mb-6">
        운영을 멈추지 않고 레거시를 점진적으로 개선하는 백엔드 개발자
      </p>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
        이커머스 · 물류 · 패션 도메인에서 Spring Boot 기반 시스템을 설계하고 운영해왔습니다.
        레거시 프로시저를 헥사고날 아키텍처로 전환하며 측정 가능한 비즈니스 임팩트를 만들어왔고,
        최근에는 Claude Code + MCP로 AI 기반 개발 워크플로우를 실무에 도입하고 있습니다.
      </p>
      <div class="mt-9 flex justify-center gap-3">
        <RouterLink to="/work" class="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
          프로젝트 &amp; 성과 보기
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </RouterLink>
        <RouterLink to="/contact" class="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          Contact
        </RouterLink>
      </div>
    </section>

    <!-- Impact KPIs -->
    <section>
      <h2 class="text-center text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-8">
        한눈에 보는 임팩트
      </h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="k in kpis" :key="k.metric"
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5"
        >
          <p class="text-xl font-bold mb-1" :class="k.color">{{ k.metric }}</p>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">{{ k.detail }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
            {{ k.note }}
          </p>
        </div>
      </div>
    </section>

    <!-- 대표 프로젝트 -->
    <section v-if="project">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold dark:text-white">대표 프로젝트</h2>
        <RouterLink to="/work" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium">상세 보기 &rarr;</RouterLink>
      </div>
      <RouterLink
        to="/work"
        class="group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-7 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all"
      >
        <div class="flex items-start justify-between mb-2">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{{ project.name }}</h3>
          <span class="text-sm text-gray-400 font-mono shrink-0 ml-4">{{ project.period }}</span>
        </div>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{{ project.description }}</p>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span>{{ project.role }}</span>
          <span v-if="project.teamSize" class="text-gray-300 dark:text-gray-600">|</span>
          <span v-if="project.teamSize">{{ project.teamSize }}</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <SkillBadge v-for="t in projectTech" :key="t" :label="t" />
        </div>
      </RouterLink>
    </section>

    <!-- 핵심 성과 Top 3 -->
    <section v-if="topAchievements.length">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold dark:text-white">핵심 성과</h2>
        <RouterLink to="/work" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium">전체 보기 &rarr;</RouterLink>
      </div>
      <div class="grid md:grid-cols-3 gap-4">
        <RouterLink
          v-for="a in topAchievements" :key="a.id"
          to="/work"
          class="group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all"
        >
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{{ a.title }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-4">{{ a.summary }}</p>
          <span class="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            {{ a.metrics }}
          </span>
        </RouterLink>
      </div>
    </section>

    <!-- Skills -->
    <section>
      <h2 class="text-2xl font-bold dark:text-white mb-6">기술 스택</h2>
      <div class="flex flex-wrap gap-2">
        <SkillBadge v-for="skill in skillList" :key="skill" :label="skill" />
      </div>
      <RouterLink to="/approach" class="inline-block mt-5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium">
        기술 선택의 이유와 설계 의사결정 보기 &rarr;
      </RouterLink>
    </section>
  </div>
</template>
