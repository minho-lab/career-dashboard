<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDomains } from '../api/domain'
import { getProfile } from '../api/profile'
import { getProjects } from '../api/project'
import SkillBadge from '../components/SkillBadge.vue'

const data = ref(null)
const profile = ref(null)
const projects = ref([])

onMounted(async () => {
  const [d, p, pjs] = await Promise.all([getDomains(), getProfile(), getProjects()])
  data.value = d
  profile.value = p
  projects.value = pjs
})

const categoryMap = {
  'Java': 'Backend', 'Spring Boot': 'Backend', 'JPA/Hibernate': 'Backend', 'MyBatis': 'Backend',
  'Spring Batch': 'Backend', 'Spring Cloud Dataflow': 'Backend', 'Feign Client': 'Backend',
  'PostgreSQL': 'Database', 'Oracle': 'Database',
  'AWS (SQS, S3, ECS)': 'Cloud/Infra', 'Docker': 'Cloud/Infra', 'Datadog': 'Cloud/Infra', '관측성(Observability)': 'Cloud/Infra',
  'CQRS': 'Architecture', '헥사고날 아키텍처': 'Architecture', '이벤트 기반 설계': 'Architecture',
  'Claude Code/MCP': 'AI/Tools',
}
const categoryOrder = ['Backend', 'Database', 'Cloud/Infra', 'Architecture', 'AI/Tools']
const categoryIcons = { 'Backend': '{ }', 'Database': 'DB', 'Cloud/Infra': '☁', 'Architecture': '△', 'AI/Tools': '⚡' }

function guessCategory(skill) {
  if (categoryMap[skill]) return categoryMap[skill]
  const s = skill.toLowerCase()
  if (['java', 'spring', 'jpa', 'mybatis', 'batch', 'feign', 'dataflow'].some(k => s.includes(k))) return 'Backend'
  if (['sql', 'postgres', 'oracle', 'redis', 'db'].some(k => s.includes(k))) return 'Database'
  if (['aws', 'docker', 'ecs', 'sqs', 's3', 'cloud', 'infra'].some(k => s.includes(k))) return 'Cloud/Infra'
  if (['아키텍처', 'cqrs', 'event', '이벤트', '설계', 'ddd', 'hexagonal'].some(k => s.includes(k))) return 'Architecture'
  if (['ai', 'claude', 'mcp', 'llm'].some(k => s.includes(k))) return 'AI/Tools'
  return 'Backend'
}

const groupedSkills = computed(() => {
  const skills = profile.value?.skills?.split(',').map(s => s.trim()).filter(Boolean) || []
  const groups = {}
  for (const skill of skills) {
    const cat = guessCategory(skill)
    ;(groups[cat] ||= []).push(skill)
  }
  return categoryOrder.filter(c => groups[c]?.length).map(c => ({ name: c, icon: categoryIcons[c], skills: groups[c] }))
})
</script>

<template>
  <div v-if="data" class="space-y-12">
    <header>
      <h1 class="text-3xl font-bold mb-2 dark:text-white">Approach</h1>
      <p class="text-gray-600 dark:text-gray-400">무엇을 만들었는가보다 "왜 그렇게 설계했는가"를 정리했습니다. 맥락 · 결정 · 트레이드오프 · 결과.</p>
    </header>

    <!-- System Overview -->
    <section v-if="data.systemOverview">
      <h2 class="text-2xl font-bold dark:text-white mb-5">시스템 개요</h2>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{{ data.systemOverview.description }}</p>

        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">External Systems</h3>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div v-for="sys in data.systemOverview.externalSystems" :key="sys.name" class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span class="text-sm font-medium dark:text-white">{{ sys.name }}</span>
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">{{ sys.role }}</p>
          </div>
        </div>

        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Key Patterns</h3>
        <div class="space-y-2">
          <div v-for="p in data.systemOverview.keyPatterns" :key="p.name" class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <SkillBadge :label="p.name" />
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ p.usage }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Architecture Decision Records -->
    <section v-if="data.architectureDecisions">
      <h2 class="text-2xl font-bold dark:text-white mb-2">아키텍처 의사결정</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">각 결정의 맥락, 이유, 트레이드오프, 결과를 기록합니다.</p>
      <div class="space-y-4">
        <div v-for="(adr, idx) in data.architectureDecisions" :key="idx" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold dark:text-white mb-4">{{ adr.title }}</h3>
          <div class="space-y-3 text-sm">
            <div class="flex gap-3">
              <div class="shrink-0 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div><h4 class="font-semibold text-gray-600 dark:text-gray-300 mb-1">Context</h4><p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ adr.context }}</p></div>
            </div>
            <div class="flex gap-3">
              <div class="shrink-0 w-1 rounded-full bg-blue-400"></div>
              <div><h4 class="font-semibold text-blue-600 dark:text-blue-400 mb-1">Decision</h4><p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ adr.decision }}</p></div>
            </div>
            <div class="flex gap-3">
              <div class="shrink-0 w-1 rounded-full bg-amber-400"></div>
              <div><h4 class="font-semibold text-amber-600 dark:text-amber-400 mb-1">Trade-off</h4><p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ adr.tradeoff }}</p></div>
            </div>
            <div class="flex gap-3">
              <div class="shrink-0 w-1 rounded-full bg-green-400"></div>
              <div><h4 class="font-semibold text-green-600 dark:text-green-400 mb-1">Result</h4><p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ adr.result }}</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Stack -->
    <section v-if="profile">
      <h2 class="text-2xl font-bold dark:text-white mb-5">기술 스택</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="group in groupedSkills" :key="group.name" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div class="flex items-center gap-2 mb-3">
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-xs font-mono text-gray-600 dark:bg-gray-700 dark:text-gray-300">{{ group.icon }}</span>
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ group.name }}</h3>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <SkillBadge v-for="s in group.skills" :key="s" :label="s" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
