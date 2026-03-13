<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProfile } from '../api/profile'
import { getProjects } from '../api/project'

const profile = ref(null)
const projects = ref([])

onMounted(async () => {
  const [profileData, projectData] = await Promise.all([getProfile(), getProjects()])
  profile.value = profileData
  projects.value = projectData
})

const categoryMap = {
  'Java': 'Backend',
  'Spring Boot': 'Backend',
  'JPA/Hibernate': 'Backend',
  'MyBatis': 'Backend',
  'Spring Batch': 'Backend',
  'Feign Client': 'Backend',
  'PostgreSQL': 'Database',
  'Oracle': 'Database',
  'AWS (SQS, S3, ECS)': 'Cloud/Infra',
  'Docker': 'Cloud/Infra',
  'CQRS': 'Architecture',
  '헥사고날 아키텍처': 'Architecture',
  '이벤트 기반 설계': 'Architecture',
  'Claude Code/MCP': 'AI/Tools',
}

const categoryOrder = ['Backend', 'Database', 'Cloud/Infra', 'Architecture', 'AI/Tools']

const categoryIcons = {
  'Backend': '{ }',
  'Database': 'DB',
  'Cloud/Infra': '☁',
  'Architecture': '△',
  'AI/Tools': '⚡',
}

function guessCategory(skill) {
  if (categoryMap[skill]) return categoryMap[skill]
  const s = skill.toLowerCase()
  if (['java', 'spring', 'jpa', 'mybatis', 'batch', 'feign', 'kotlin', 'node', 'express', 'nest', 'graphql', 'rest', 'api', 'grpc'].some(k => s.includes(k))) return 'Backend'
  if (['sql', 'postgres', 'oracle', 'mysql', 'mongo', 'redis', 'database', 'db', 'dynamo', 'elastic'].some(k => s.includes(k))) return 'Database'
  if (['aws', 'docker', 'k8s', 'kubernetes', 'cloud', 'ecs', 'sqs', 's3', 'ci', 'cd', 'jenkins', 'terraform', 'infra', 'nginx'].some(k => s.includes(k))) return 'Cloud/Infra'
  if (['아키텍처', 'architecture', 'cqrs', 'event', 'ddd', 'hexagonal', '설계', 'pattern', 'msa', 'microservice', 'saga'].some(k => s.includes(k))) return 'Architecture'
  if (['ai', 'claude', 'gpt', 'ml', 'mcp', 'tool', 'copilot', 'llm'].some(k => s.includes(k))) return 'AI/Tools'
  return 'Backend'
}

const skillAnalysis = computed(() => {
  if (!profile.value) return []

  const skills = profile.value.skills?.split(',').map(s => s.trim()).filter(Boolean) || []

  return skills.map(skill => {
    const relatedProjects = projects.value.filter(p => {
      const techs = p.techStack?.split(',').map(t => t.trim()) || []
      return techs.some(t => t.toLowerCase() === skill.toLowerCase())
    })
    return {
      name: skill,
      category: guessCategory(skill),
      projectCount: relatedProjects.length,
      projectNames: relatedProjects.map(p => p.name),
    }
  })
})

const totalProjects = computed(() => projects.value.length)

const groupedByCategory = computed(() => {
  const groups = {}
  for (const skill of skillAnalysis.value) {
    if (!groups[skill.category]) groups[skill.category] = []
    groups[skill.category].push(skill)
  }
  return categoryOrder
    .filter(cat => groups[cat]?.length)
    .map(cat => ({
      name: cat,
      icon: categoryIcons[cat],
      skills: groups[cat].sort((a, b) => b.projectCount - a.projectCount),
    }))
})
</script>

<template>
  <div v-if="profile" class="space-y-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2 dark:text-white">Tech Stack</h1>
      <p class="text-gray-500">기술 스택별 사용 경험과 프로젝트 연관성을 정리했습니다.</p>
    </div>

    <!-- Category Sections -->
    <section v-for="group in groupedByCategory" :key="group.name" class="space-y-4">
      <div class="flex items-center gap-2 mb-4">
        <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-sm font-mono text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {{ group.icon }}
        </span>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ group.name }}</h2>
        <span class="text-sm text-gray-400">({{ group.skills.length }})</span>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="skill in group.skills"
          :key="skill.name"
          class="bg-white rounded-xl border border-gray-200 p-5 dark:bg-gray-800 dark:border-gray-700"
        >
          <!-- Skill Name & Count -->
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ skill.name }}</h3>
            <span class="text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-2"
              :class="skill.projectCount > 0
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'"
            >
              {{ skill.projectCount }}개 프로젝트
            </span>
          </div>

          <!-- Usage Bar -->
          <div class="mb-3">
            <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700">
              <div
                class="h-full bg-blue-500 rounded-full transition-all duration-500"
                :style="{ width: totalProjects > 0 ? `${(skill.projectCount / totalProjects) * 100}%` : '0%' }"
              />
            </div>
          </div>

          <!-- Project Names -->
          <div v-if="skill.projectNames.length" class="space-y-1">
            <p
              v-for="name in skill.projectNames"
              :key="name"
              class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5"
            >
              <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
              {{ name }}
            </p>
          </div>
          <p v-else class="text-xs text-gray-400 dark:text-gray-500 italic">연관 프로젝트 없음</p>
        </div>
      </div>
    </section>
  </div>
</template>
