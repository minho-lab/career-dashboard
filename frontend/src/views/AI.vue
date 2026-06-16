<script setup>
import { ref, onMounted } from 'vue'
import { getAi } from '../api/ai'
import SkillBadge from '../components/SkillBadge.vue'

const data = ref(null)

onMounted(async () => {
  data.value = await getAi()
})

const statusStyle = (s) => {
  if (s.includes('운영')) return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
  if (s.includes('진행')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
}
</script>

<template>
  <div v-if="data" class="space-y-12">
    <header>
      <div class="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium px-3 py-1 rounded-full mb-4">
        <span class="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
        AI / Agent Engineering
      </div>
      <h1 class="text-3xl font-bold mb-3 dark:text-white">AI 에이전트 · 도구 플랫폼</h1>
      <p class="text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">{{ data.intro }}</p>
    </header>

    <!-- Pipeline diagram -->
    <section>
      <h2 class="text-2xl font-bold dark:text-white mb-1">이상 감지 → AI 자동 원인분석 파이프라인</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">감지·알림에서 끝내지 않고, 에이전트가 "왜 그런지"까지 자동으로 조사합니다.</p>
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 overflow-x-auto">
        <svg viewBox="0 0 980 340" role="img" class="w-full min-w-[760px]" xmlns="http://www.w3.org/2000/svg">
          <title>AI 자동 원인분석 파이프라인</title>
          <desc>OpenSearch와 Datadog가 이상을 감지하면 Slack으로 알리고, AI 에이전트가 알림을 읽어 내부 데이터와 웹을 검색해 원인을 규명한 뒤 Slack 스레드로 보고한다.</desc>
          <defs>
            <marker id="ahd" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M0,0 L7,3 L0,6 Z" class="fill-gray-400 dark:fill-gray-500" />
            </marker>
          </defs>

          <text x="26" y="40" font-size="11" letter-spacing="1" class="font-mono fill-gray-400 dark:fill-gray-500">① 이상 감지</text>
          <text x="300" y="40" font-size="11" letter-spacing="1" class="font-mono fill-gray-400 dark:fill-gray-500">② 알림</text>
          <text x="540" y="40" font-size="11" letter-spacing="1" class="font-mono fill-indigo-500 dark:fill-indigo-400">③ AI 원인분석</text>
          <text x="812" y="40" font-size="11" letter-spacing="1" class="font-mono fill-gray-400 dark:fill-gray-500">④ 보고</text>

          <g class="stroke-gray-400 dark:stroke-gray-500" fill="none" stroke-width="1.5">
            <path d="M222,100 C262,100 262,146 300,146" marker-end="url(#ahd)" />
            <path d="M222,202 C262,202 262,172 300,172" marker-end="url(#ahd)" />
            <path d="M462,159 C500,159 504,172 540,172" marker-end="url(#ahd)" />
            <path d="M742,172 C780,172 776,159 812,159" marker-end="url(#ahd)" />
            <path d="M887,245 L887,282" marker-end="url(#ahd)" />
          </g>

          <g class="fill-white dark:fill-gray-800 stroke-gray-200 dark:stroke-gray-700" stroke-width="1.5">
            <rect x="24" y="58" width="198" height="84" rx="12" />
            <rect x="24" y="160" width="198" height="84" rx="12" />
            <rect x="300" y="117" width="162" height="84" rx="12" />
            <rect x="812" y="117" width="150" height="84" rx="12" />
          </g>

          <text x="40" y="94" font-size="15" font-weight="700" class="font-mono fill-gray-900 dark:fill-white">OpenSearch</text>
          <text x="40" y="118" font-size="12.5" class="fill-gray-500 dark:fill-gray-400">데이터 수집 · 이상 감지</text>
          <text x="40" y="196" font-size="15" font-weight="700" class="font-mono fill-gray-900 dark:fill-white">Datadog</text>
          <text x="40" y="220" font-size="12.5" class="fill-gray-500 dark:fill-gray-400">시스템 에러 · 로그 감지</text>

          <text x="316" y="153" font-size="15" font-weight="700" class="fill-gray-900 dark:fill-white">Slack 알림</text>
          <text x="316" y="177" font-size="12.5" class="fill-gray-500 dark:fill-gray-400">이상 발생 시 자동</text>

          <rect x="540" y="74" width="202" height="190" rx="14" class="fill-white dark:fill-gray-800 stroke-indigo-400 dark:stroke-indigo-500" stroke-width="2" />
          <text x="558" y="108" font-size="16" font-weight="700" class="fill-indigo-600 dark:fill-indigo-400">AI 에이전트</text>
          <text x="558" y="131" font-size="12.5" class="fill-gray-500 dark:fill-gray-400">알림 읽고 원인 조사</text>
          <rect x="558" y="146" width="166" height="44" rx="9" class="fill-gray-50 dark:fill-gray-900 stroke-gray-200 dark:stroke-gray-700" stroke-width="1.2" />
          <text x="572" y="173" font-size="12.5" class="fill-gray-700 dark:fill-gray-200">🔎 내부 데이터 검색</text>
          <rect x="558" y="200" width="166" height="44" rx="9" class="fill-gray-50 dark:fill-gray-900 stroke-gray-200 dark:stroke-gray-700" stroke-width="1.2" />
          <text x="572" y="227" font-size="12.5" class="fill-gray-700 dark:fill-gray-200">🌐 웹 검색</text>

          <text x="828" y="153" font-size="15" font-weight="700" class="fill-gray-900 dark:fill-white">Slack 리포트</text>
          <text x="828" y="177" font-size="12.5" class="fill-gray-500 dark:fill-gray-400">무엇이 · 왜</text>

          <text x="887" y="304" font-size="13" font-weight="600" text-anchor="middle" class="fill-gray-700 dark:fill-gray-200">운영 · MD에 보고</text>
        </svg>
      </div>
    </section>

    <!-- Agents / Platform -->
    <section class="space-y-5">
      <article
        v-for="item in data.items" :key="item.id"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
          <h2 class="text-xl font-semibold dark:text-white">{{ item.name }}</h2>
          <span class="text-xs font-medium px-2.5 py-0.5 rounded-full" :class="statusStyle(item.status)">{{ item.status }}</span>
          <span class="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900">{{ item.role }}</span>
        </div>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">{{ item.summary }}</p>

        <!-- Metrics -->
        <div v-if="item.metrics?.length" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div v-for="m in item.metrics" :key="m.label" class="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3 text-center">
            <p class="text-lg font-bold text-gray-900 dark:text-white">{{ m.value }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-1">{{ m.label }}</p>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-5">
          <div>
            <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">핵심 내용</h3>
            <ul class="space-y-1.5">
              <li v-for="(h, i) in item.highlights" :key="i" class="flex gap-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <span class="text-blue-500 shrink-0 mt-0.5">▹</span><span>{{ h }}</span>
              </li>
            </ul>
          </div>
          <div v-if="item.guardrails?.length">
            <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">가드레일 · 거버넌스</h3>
            <ul class="space-y-1.5">
              <li v-for="(g, i) in item.guardrails" :key="i" class="flex gap-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <span class="text-amber-500 shrink-0 mt-0.5">▹</span><span>{{ g }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div v-if="item.tech?.length" class="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <SkillBadge v-for="t in item.tech" :key="t" :label="t" />
        </div>
      </article>
    </section>

    <!-- Principles -->
    <section v-if="data.principles?.length">
      <h2 class="text-2xl font-bold dark:text-white mb-5">에이전트를 만드는 원칙</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <div v-for="p in data.principles" :key="p.title" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-1.5">{{ p.title }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ p.desc }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
