<script setup>
import { ref, onMounted } from 'vue'
import { getDomains } from '../api/domain'
import SkillBadge from '../components/SkillBadge.vue'

const data = ref(null)

onMounted(async () => {
  data.value = await getDomains()
})
</script>

<template>
  <div v-if="data" class="space-y-10">
    <!-- Page Header -->
    <section>
      <h1 class="text-3xl font-bold mb-2 dark:text-white">Architecture</h1>
      <p class="text-gray-600 dark:text-gray-400">이 시스템을 만들면서 내린 기술적 의사결정과 그 이유, 트레이드오프를 정리했습니다.</p>
    </section>

    <!-- System Overview -->
    <section v-if="data.systemOverview">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
        </div>
        <h2 class="text-2xl font-bold dark:text-white">System Overview</h2>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{{ data.systemOverview.description }}</p>

        <!-- External Systems -->
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">External Systems</h3>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div
            v-for="sys in data.systemOverview.externalSystems"
            :key="sys.name"
            class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <svg class="w-4 h-4 text-purple-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <div>
              <span class="text-sm font-medium dark:text-white">{{ sys.name }}</span>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ sys.role }}</p>
            </div>
          </div>
        </div>

        <!-- Key Patterns -->
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Key Patterns</h3>
        <div class="space-y-2">
          <div
            v-for="pattern in data.systemOverview.keyPatterns"
            :key="pattern.name"
            class="flex items-center gap-3"
          >
            <SkillBadge :label="pattern.name" />
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ pattern.usage }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Architecture Decisions -->
    <section v-if="data.architectureDecisions">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        </div>
        <h2 class="text-2xl font-bold dark:text-white">Architecture Decision Records</h2>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">각 결정의 맥락, 이유, 트레이드오프, 결과를 기록합니다.</p>

      <div class="space-y-4">
        <div
          v-for="(adr, idx) in data.architectureDecisions"
          :key="idx"
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 class="text-lg font-semibold dark:text-white mb-4">{{ adr.title }}</h3>

          <div class="space-y-3 text-sm">
            <div class="flex gap-3">
              <div class="shrink-0 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div>
                <h4 class="font-semibold text-gray-600 dark:text-gray-300 mb-1">Context</h4>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ adr.context }}</p>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="shrink-0 w-1 rounded-full bg-blue-400"></div>
              <div>
                <h4 class="font-semibold text-blue-600 dark:text-blue-400 mb-1">Decision</h4>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ adr.decision }}</p>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="shrink-0 w-1 rounded-full bg-amber-400"></div>
              <div>
                <h4 class="font-semibold text-amber-600 dark:text-amber-400 mb-1">Trade-off</h4>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ adr.tradeoff }}</p>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="shrink-0 w-1 rounded-full bg-green-400"></div>
              <div>
                <h4 class="font-semibold text-green-600 dark:text-green-400 mb-1">Result</h4>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ adr.result }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
