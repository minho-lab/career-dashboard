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
