<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getProfile } from '../api/profile'
import { getProjects } from '../api/project'
import { getAchievements } from '../api/achievement'
import { getAi } from '../api/ai'
import SkillBadge from '../components/SkillBadge.vue'

const profile = ref(null)
const project = ref(null)
const achievements = ref([])
const aiItems = ref([])

onMounted(async () => {
  const [p, pjs, achs, ai] = await Promise.all([getProfile(), getProjects(), getAchievements(), getAi()])
  profile.value = p
  project.value = pjs[0] || null
  achievements.value = achs
  aiItems.value = ai.items || []
})

const skillList = computed(() => profile.value?.skills?.split(',').map(s => s.trim()) || [])
const career = computed(() => profile.value?.career || [])

// 입사연도(2017) 기준으로 연차 자동 계산 — 매년 수동 수정 불필요
const careerYears = computed(() => {
  const start = profile.value?.careerStartYear || 2017
  return new Date().getFullYear() - start + 1
})

// 면접관이 30초 안에 봐야 할 비즈니스 임팩트 — 회사 전용 용어는 한 줄 풀이를 함께 표기
const kpis = [
  {
    metric: '19채널 → 단일 도메인',
    detail: '89개 스토어 · 헥사고날 Port/Adapter로 채널별 API 격리',
    note: '자사몰·무신사·네이버·제휴몰 등 외부 데이터 형식이 제각각이어도 도메인 로직은 일관되게 유지',
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    metric: '상시 서버 → 온디맨드 배치',
    detail: 'Spring Cloud Data Flow 컨테이너 기동/종료',
    note: '스케줄에 맞춰 Docker를 띄우고 잡이 끝나면 내려 — 인프라도 필요할 때만 존재하게 설계',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    metric: '이상 감지 → AI 자동 원인분석',
    detail: 'OpenSearch·Datadog 이상 감지 → Slack → 에이전트가 웹·데이터 검색으로 원인 규명',
    note: '알림에서 끝나지 않고 “왜 이런 변화가 생겼는지”까지 에이전트가 자동으로 조사·설명',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    metric: 'AI 에이전트 4종 실운영·구축',
    detail: '클레임 자동화 · CS · 비즈니스 분석 + 팀 플러그인 플랫폼',
    note: 'Mac mini 셀프호스팅·Slack 연동으로 실제 운영 중, 팀 AI 도구 플랫폼까지 직접 구축',
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
      <p class="text-xs text-gray-400 dark:text-gray-500 mb-4">📱 이 문구는 휴대폰을 통해 수정했습니다.</p>
      <div class="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
        <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        Backend &amp; AI Agent Engineer · {{ careerYears }}년차
      </div>
      <h1 class="text-5xl font-extrabold tracking-tight mb-3 dark:text-white">{{ profile.name }}</h1>
      <p class="text-lg text-gray-500 dark:text-gray-400 mb-6">
        시스템을 운영하며 개선하고, 그 도메인 지식을 AI 에이전트로 옮기는 백엔드 개발자
      </p>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
        이커머스 · 물류 · 패션 도메인에서 Spring Boot 기반 시스템을 설계하고 운영해왔습니다.
        채널마다 다른 외부 시스템을 헥사고날 아키텍처로 통합해 일관된 도메인을 만들며 측정 가능한 비즈니스 임팩트를 내왔고,
        지금은 클레임 자동화 에이전트와 팀 AI 도구 플랫폼을 직접 설계·구축하며
        자동화의 가드레일과 거버넌스를 함께 만들고 있습니다.
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

    <!-- AI / Agent -->
    <section v-if="aiItems.length">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold dark:text-white">AI / Agent Engineering</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">도메인 지식을 에이전트와 팀 도구로 옮기는 작업</p>
        </div>
        <RouterLink to="/ai" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium shrink-0">자세히 &rarr;</RouterLink>
      </div>
      <div class="grid md:grid-cols-3 gap-4">
        <RouterLink
          v-for="item in aiItems" :key="item.id"
          to="/ai"
          class="group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">{{ item.role }}</span>
            <span class="text-xs text-gray-400">{{ item.status }}</span>
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">{{ item.name }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">{{ item.summary }}</p>
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

    <!-- Career -->
    <section v-if="career.length">
      <h2 class="text-2xl font-bold dark:text-white mb-6">경력</h2>
      <div class="relative pl-8">
        <div class="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        <div v-for="(c, i) in career" :key="i" class="relative mb-6 last:mb-0">
          <div
            class="absolute -left-[26px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900"
            :class="i === 0 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'"
          ></div>
          <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ c.company }}</h3>
            <span v-if="c.companyDescription" class="text-xs text-gray-400">{{ c.companyDescription }}</span>
            <span v-if="c.period" class="text-xs text-gray-400 font-mono ml-auto">{{ c.period }}</span>
          </div>
          <p v-if="c.role || c.description" class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-0.5">
            <span v-if="c.role" class="text-gray-500 dark:text-gray-300">{{ c.role }}</span>
            <span v-if="c.role && c.description"> — </span>{{ c.description }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
