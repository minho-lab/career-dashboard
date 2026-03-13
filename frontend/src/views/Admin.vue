<script setup>
import { ref, onMounted } from 'vue'

// 상태
const activeTab = ref('git')
const loading = ref(false)
const gitData = ref(null)
const jiraData = ref(null)
const saveMessage = ref('')
const projects = ref([])

// 저장 대상: 'achievement' 또는 'project'
const saveTarget = ref('achievement')

// Achievement 폼
const achievementForm = ref({
  projectId: 1,
  title: '',
  summary: '',
  problem: '',
  solution: '',
  result: '',
  metrics: '',
})

// Project 폼
const projectForm = ref({
  id: null, // null이면 새 프로젝트, 값이 있으면 업데이트
  name: '',
  description: '',
  period: '',
  role: '',
  teamSize: '',
  techStack: '',
  highlights: '',
  challenges: '',
  impact: '',
})

const showForm = ref(false)

// 프로젝트 목록 로드
async function loadProjects() {
  try {
    const res = await fetch('/api/projects')
    projects.value = await res.json()
  } catch { /* ignore */ }
}

onMounted(loadProjects)

// Git 동기화
async function fetchGit() {
  loading.value = true
  try {
    const res = await fetch('/api/sync/git')
    gitData.value = await res.json()
  } catch (err) {
    gitData.value = { error: err.message }
  }
  loading.value = false
}

// Jira 동기화
async function fetchJira() {
  loading.value = true
  try {
    const res = await fetch('/api/sync/jira')
    jiraData.value = await res.json()
  } catch (err) {
    jiraData.value = { error: err.message }
  }
  loading.value = false
}

// Git 데이터로 Achievement 폼 채우기
function fillAchievementFromGit(repo) {
  saveTarget.value = 'achievement'
  const commitSummary = repo.commits.slice(0, 10).map(c => `- ${c.subject}`).join('\n')
  achievementForm.value = {
    projectId: 1,
    title: `${repo.label} 최근 작업`,
    summary: `${repo.label}에서 ${repo.commitCount}건의 커밋 수행`,
    problem: '',
    solution: commitSummary,
    result: `${repo.stats.totalInsertions}줄 추가, ${repo.stats.totalDeletions}줄 삭제, ${repo.stats.totalFiles}개 파일 변경`,
    metrics: `커밋 ${repo.commitCount}건, +${repo.stats.totalInsertions}/-${repo.stats.totalDeletions}`,
  }
  showForm.value = true
}

// Git 데이터로 Project 폼 채우기
function fillProjectFromGit(repo) {
  saveTarget.value = 'project'
  const existing = projects.value.find(p => p.name.includes('EC-OMS') || p.name.includes('OMS'))
  const featCommits = (repo.categories?.feat || []).map(c => `- ${c.subject}`).join('\n')
  const fixCommits = (repo.categories?.fix || []).map(c => `- ${c.subject}`).join('\n')
  const refactorCommits = (repo.categories?.refactor || []).map(c => `- ${c.subject}`).join('\n')

  if (existing) {
    // 기존 프로젝트 업데이트
    projectForm.value = {
      ...existing,
      highlights: existing.highlights + (featCommits ? '\n\n[최근 추가]\n' + featCommits : ''),
      challenges: existing.challenges + (refactorCommits ? '\n\n[최근 리팩토링]\n' + refactorCommits : ''),
      impact: existing.impact + `\n- 최근 3개월: 커밋 ${repo.commitCount}건, +${repo.stats.totalInsertions}/-${repo.stats.totalDeletions}`,
    }
  } else {
    projectForm.value = {
      id: null,
      name: repo.label,
      description: `${repo.label} 프로젝트`,
      period: '',
      role: '백엔드 개발',
      teamSize: '',
      techStack: '',
      highlights: featCommits || '',
      challenges: fixCommits || refactorCommits || '',
      impact: `커밋 ${repo.commitCount}건, +${repo.stats.totalInsertions}/-${repo.stats.totalDeletions}`,
    }
  }
  showForm.value = true
}

// Jira 데이터로 Achievement 폼 채우기
function fillAchievementFromJira(category, issues) {
  saveTarget.value = 'achievement'
  const issueSummary = issues.slice(0, 10).map(i => `- [${i.key}] ${i.summary}`).join('\n')
  const doneCount = issues.filter(i => i.status === '완료' || i.status === 'Done').length
  achievementForm.value = {
    projectId: 1,
    title: `${category} 관련 작업`,
    summary: `${category} 카테고리 ${issues.length}건의 이슈 처리`,
    problem: '',
    solution: issueSummary,
    result: `총 ${issues.length}건 중 ${doneCount}건 완료`,
    metrics: `${issues.map(i => i.key).slice(0, 5).join(', ')} 외 ${Math.max(0, issues.length - 5)}건`,
  }
  showForm.value = true
}

// Jira 데이터로 Project 폼 채우기
function fillProjectFromJira(issues) {
  saveTarget.value = 'project'
  const existing = projects.value.find(p => p.name.includes('EC-OMS') || p.name.includes('OMS'))
  const issueSummary = issues.slice(0, 10).map(i => `- [${i.key}] ${i.summary}`).join('\n')
  const doneCount = issues.filter(i => i.status === '완료' || i.status === 'Done').length

  if (existing) {
    projectForm.value = {
      ...existing,
      highlights: existing.highlights + '\n\n[Jira 최근 작업]\n' + issueSummary,
      impact: existing.impact + `\n- Jira 최근 30일: ${issues.length}건 처리 (${doneCount}건 완료)`,
    }
  } else {
    projectForm.value = {
      id: null,
      name: 'EC-OMS',
      description: '',
      period: '',
      role: '백엔드 개발',
      teamSize: '',
      techStack: '',
      highlights: issueSummary,
      challenges: '',
      impact: `${issues.length}건 처리 (${doneCount}건 완료)`,
    }
  }
  showForm.value = true
}

// 저장
async function save() {
  loading.value = true
  try {
    const isAchievement = saveTarget.value === 'achievement'
    const url = isAchievement ? '/api/save/achievement' : '/api/save/project'
    const body = isAchievement ? achievementForm.value : projectForm.value

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (data.error) {
      saveMessage.value = `오류: ${data.error}`
    } else {
      const label = isAchievement ? 'Achievement' : 'Project'
      saveMessage.value = `${label} #${data.id} ${projectForm.value?.id ? '업데이트' : '저장'} 완료!`
      showForm.value = false
      resetForms()
      loadProjects()
    }
  } catch (err) {
    saveMessage.value = `오류: ${err.message}`
  }
  loading.value = false
  setTimeout(() => saveMessage.value = '', 4000)
}

function resetForms() {
  achievementForm.value = { projectId: 1, title: '', summary: '', problem: '', solution: '', result: '', metrics: '' }
  projectForm.value = { id: null, name: '', description: '', period: '', role: '', teamSize: '', techStack: '', highlights: '', challenges: '', impact: '' }
}

function cancelForm() {
  showForm.value = false
  resetForms()
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-2">Content Sync</h1>
    <p class="text-gray-500 mb-8">Git / Jira에서 데이터를 가져와 프로젝트 및 성과에 추가합니다.</p>

    <!-- 저장 메시지 -->
    <div v-if="saveMessage" :class="[
      'mb-4 px-4 py-3 rounded-lg text-sm font-medium',
      saveMessage.includes('오류') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
    ]">
      {{ saveMessage }}
    </div>

    <!-- 탭 -->
    <div class="flex gap-2 mb-6">
      <button
        @click="activeTab = 'git'"
        :class="[
          'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
          activeTab === 'git' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        Git 동기화
      </button>
      <button
        @click="activeTab = 'jira'"
        :class="[
          'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
          activeTab === 'jira' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        Jira 동기화
      </button>
    </div>

    <!-- ========== Git 탭 ========== -->
    <div v-if="activeTab === 'git'">
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Git 커밋 가져오기</h2>
          <button
            @click="fetchGit"
            :disabled="loading"
            class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {{ loading ? '로딩...' : 'Git 데이터 가져오기' }}
          </button>
        </div>
        <p class="text-sm text-gray-500">ec-oms-internal-api, ec-oms-batch-app-v2, ec-oms-admin 레포에서 최근 3개월 커밋을 조회합니다.</p>
      </div>

      <!-- Git 결과 -->
      <div v-if="gitData" class="space-y-4">
        <div v-for="repo in gitData" :key="repo.repo" class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="font-semibold">{{ repo.label }}</h3>
              <p class="text-sm text-gray-500">
                {{ repo.commitCount }}건의 커밋 |
                +{{ repo.stats.totalInsertions }} / -{{ repo.stats.totalDeletions }} |
                {{ repo.stats.totalFiles }}개 파일
              </p>
            </div>
            <div v-if="repo.commitCount > 0" class="flex gap-2">
              <button
                @click="fillProjectFromGit(repo)"
                class="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
              >
                프로젝트에 반영
              </button>
              <button
                @click="fillAchievementFromGit(repo)"
                class="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                Achievement 추가
              </button>
            </div>
          </div>

          <!-- 카테고리별 요약 -->
          <div v-if="repo.categories && Object.keys(repo.categories).length > 0" class="flex flex-wrap gap-2 mb-3">
            <span
              v-for="(commits, type) in repo.categories" :key="type"
              :class="[
                'px-2 py-0.5 rounded text-xs font-medium',
                type === 'feat' ? 'bg-blue-50 text-blue-700' :
                type === 'fix' ? 'bg-red-50 text-red-700' :
                type === 'refactor' ? 'bg-yellow-50 text-yellow-700' :
                'bg-gray-100 text-gray-600'
              ]"
            >
              {{ type }}: {{ commits.length }}건
            </span>
          </div>

          <div v-if="repo.commits.length > 0" class="mt-3 max-h-48 overflow-y-auto">
            <div
              v-for="commit in repo.commits.slice(0, 20)"
              :key="commit.hash"
              class="flex items-start gap-2 py-1.5 text-sm border-b border-gray-50 last:border-0"
            >
              <span class="text-gray-400 shrink-0 font-mono text-xs mt-0.5">{{ commit.date }}</span>
              <span class="text-gray-700">{{ commit.subject }}</span>
              <span class="text-gray-300 shrink-0 text-xs">{{ commit.author }}</span>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 mt-2">최근 3개월간 커밋이 없습니다.</p>
        </div>
      </div>
    </div>

    <!-- ========== Jira 탭 ========== -->
    <div v-if="activeTab === 'jira'">
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Jira 이슈 가져오기</h2>
          <button
            @click="fetchJira"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {{ loading ? '로딩...' : 'Jira 데이터 가져오기' }}
          </button>
        </div>
        <p class="text-sm text-gray-500">ECOMS 프로젝트에서 최근 30일간 업데이트된 이슈를 조회합니다.</p>
      </div>

      <!-- Jira 미설정 -->
      <div v-if="jiraData && !jiraData.configured" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 class="font-semibold text-yellow-800 mb-2">Jira 설정 필요</h3>
        <p class="text-sm text-yellow-700 mb-3">{{ jiraData.error }}</p>
        <div class="bg-white rounded-lg p-4 text-sm font-mono text-gray-700">
          <p class="mb-1"># frontend/.env 파일 수정</p>
          <p>JIRA_BASE_URL=https://your-domain.atlassian.net</p>
          <p>JIRA_EMAIL=your-email@company.com</p>
          <p>JIRA_API_TOKEN=your-api-token</p>
          <p>JIRA_PROJECT=ECOMS</p>
        </div>
      </div>

      <!-- Jira 에러 -->
      <div v-else-if="jiraData && jiraData.error" class="bg-red-50 border border-red-200 rounded-xl p-6">
        <p class="text-sm text-red-700">{{ jiraData.error }}</p>
      </div>

      <!-- Jira 결과 -->
      <div v-else-if="jiraData && jiraData.grouped" class="space-y-4">
        <div class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
          <span class="text-sm text-gray-600">총 {{ jiraData.total }}건 조회됨</span>
          <button
            @click="fillProjectFromJira(jiraData.issues)"
            class="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
          >
            전체를 프로젝트에 반영
          </button>
        </div>

        <div
          v-for="(issues, category) in jiraData.grouped"
          :key="category"
          class="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="font-semibold">{{ category }}</h3>
              <p class="text-sm text-gray-500">{{ issues.length }}건의 이슈</p>
            </div>
            <button
              @click="fillAchievementFromJira(category, issues)"
              class="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Achievement 추가
            </button>
          </div>

          <div class="mt-3 max-h-48 overflow-y-auto">
            <div
              v-for="issue in issues.slice(0, 15)"
              :key="issue.key"
              class="flex items-start gap-2 py-1.5 text-sm border-b border-gray-50 last:border-0"
            >
              <span class="text-blue-600 shrink-0 font-mono text-xs mt-0.5">{{ issue.key }}</span>
              <span class="text-gray-700 flex-1">{{ issue.summary }}</span>
              <span
                :class="[
                  'shrink-0 px-2 py-0.5 rounded text-xs font-medium',
                  issue.status === '완료' || issue.status === 'Done' ? 'bg-green-50 text-green-700' :
                  issue.status === '진행 중' || issue.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                ]"
              >
                {{ issue.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 편집 폼 ========== -->
    <div v-if="showForm" class="mt-8 bg-white rounded-xl border-2 border-blue-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">
          {{ saveTarget === 'achievement' ? 'Achievement 추가' : (projectForm.id ? '프로젝트 업데이트' : '프로젝트 추가') }}
        </h2>
        <div class="flex gap-2">
          <button
            @click="saveTarget = 'achievement'"
            :class="[
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              saveTarget === 'achievement' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            ]"
          >
            Achievement
          </button>
          <button
            @click="saveTarget = 'project'"
            :class="[
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              saveTarget === 'project' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
            ]"
          >
            Project
          </button>
        </div>
      </div>

      <!-- Achievement 폼 -->
      <div v-if="saveTarget === 'achievement'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">연관 프로젝트</label>
          <select v-model="achievementForm.projectId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <input v-model="achievementForm.title" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">요약</label>
          <input v-model="achievementForm.summary" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Problem</label>
          <textarea v-model="achievementForm.problem" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Solution</label>
          <textarea v-model="achievementForm.solution" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Result</label>
          <textarea v-model="achievementForm.result" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Metrics</label>
          <input v-model="achievementForm.metrics" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <!-- Project 폼 -->
      <div v-else class="space-y-4">
        <div v-if="projectForm.id" class="bg-green-50 px-3 py-2 rounded-lg text-sm text-green-700">
          기존 프로젝트 #{{ projectForm.id }} 업데이트 모드
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">프로젝트명</label>
            <input v-model="projectForm.name" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">기간</label>
            <input v-model="projectForm.period" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">역할</label>
            <input v-model="projectForm.role" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">팀 규모</label>
            <input v-model="projectForm.teamSize" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <input v-model="projectForm.description" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">기술 스택</label>
          <input v-model="projectForm.techStack" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">주요 기여 (Highlights)</label>
          <textarea v-model="projectForm.highlights" rows="5" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">기술적 도전 (Challenges)</label>
          <textarea v-model="projectForm.challenges" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">성과 (Impact)</label>
          <textarea v-model="projectForm.impact" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
        </div>
      </div>

      <!-- 저장/취소 버튼 -->
      <div class="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          @click="save"
          :disabled="loading"
          :class="[
            'px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors text-white',
            saveTarget === 'achievement' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
          ]"
        >
          {{ loading ? '저장 중...' : '저장' }}
        </button>
        <button
          @click="cancelForm"
          class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  </div>
</template>
