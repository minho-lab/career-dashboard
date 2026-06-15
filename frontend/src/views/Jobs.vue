<script setup>
import { ref, onMounted, watch } from 'vue'

const CATEGORIES = [
  { id: '872', label: '서버/백엔드' },
  { id: '669', label: '웹 개발' },
  { id: '873', label: '프론트엔드' },
  { id: '660', label: '소프트웨어 엔지니어' },
  { id: '674', label: 'DevOps/인프라' },
  { id: '655', label: '데이터 엔지니어' },
  { id: '895', label: 'AI/ML' },
]

const YEARS = [
  { value: '-1', label: '전체 연차' },
  { value: '0', label: '신입' },
  { value: '3', label: '3년+' },
  { value: '5', label: '5년+' },
  { value: '7', label: '7년+' },
  { value: '10', label: '10년+' },
]

const jobs = ref([])
const bookmarks = ref([])
const selectedTag = ref('872')
const selectedYears = ref('-1')
const loading = ref(false)
const available = ref(null)
const offset = ref(0)
const hasMore = ref(true)

// 상세 모달
const detail = ref(null)
const detailLoading = ref(false)

onMounted(async () => {
  try {
    const res = await fetch('/api/jobs/search?limit=1')
    available.value = res.ok
    if (res.ok) {
      await Promise.all([fetchJobs(), fetchBookmarks()])
    }
  } catch {
    available.value = false
  }
})

watch([selectedTag, selectedYears], () => {
  offset.value = 0
  jobs.value = []
  hasMore.value = true
  fetchJobs()
})

async function fetchJobs(append = false) {
  if (loading.value) return
  loading.value = true
  try {
    const res = await fetch(`/api/jobs/search?tag=${selectedTag.value}&years=${selectedYears.value}&offset=${offset.value}&limit=20`)
    const data = await res.json()
    if (append) {
      jobs.value.push(...data.data)
    } else {
      jobs.value = data.data || []
    }
    hasMore.value = !!data.links?.next
  } catch { }
  loading.value = false
}

function loadMore() {
  offset.value += 20
  fetchJobs(true)
}

async function fetchBookmarks() {
  try {
    const res = await fetch('/api/jobs/bookmarks')
    bookmarks.value = await res.json()
  } catch { }
}

function isBookmarked(id) {
  return bookmarks.value.some(b => b.id === id)
}

async function toggleBookmark(job) {
  if (isBookmarked(job.id)) {
    await fetch('/api/jobs/bookmarks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: job.id }),
    })
  } else {
    await fetch('/api/jobs/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: job.id,
        position: job.position,
        company: job.company?.name,
        industry: job.company?.industry_name,
        location: job.address?.full_location || job.address?.location,
        annual_from: job.annual_from,
        annual_to: job.annual_to,
        due_time: job.due_time,
        logo: job.logo_img?.thumb,
      }),
    })
  }
  await fetchBookmarks()
}

async function openDetail(id) {
  detailLoading.value = true
  detail.value = null
  try {
    const res = await fetch(`/api/jobs/detail?id=${id}`)
    const data = await res.json()
    detail.value = data.job
  } catch { }
  detailLoading.value = false
}

function closeDetail() {
  detail.value = null
}

function annualText(from, to) {
  if (!from && !to) return ''
  if (from === 0 && to === 0) return '신입'
  if (from && to) return `${from}~${to}년`
  if (from) return `${from}년+`
  return ''
}

const tab = ref('search') // 'search' | 'bookmarks'
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold dark:text-white">Jobs</h1>
      <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">IT 채용공고를 검색하고 관심 공고를 저장합니다. 로컬에서만 동작합니다.</p>
    </div>

    <!-- Not available -->
    <div v-if="available === false" class="flex items-center justify-center py-20">
      <div class="text-center bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-8 max-w-md">
        <svg class="w-10 h-10 text-amber-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        <h3 class="font-semibold text-amber-800 dark:text-amber-300 mb-2">로컬 개발 환경에서만 사용 가능</h3>
        <p class="text-sm text-amber-600 dark:text-amber-400"><code>npm run dev</code>로 실행하세요.</p>
      </div>
    </div>

    <template v-if="available">
      <!-- Tabs -->
      <div class="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        <button
          @click="tab = 'search'"
          :class="['px-4 py-2 text-sm font-medium rounded-md transition-colors', tab === 'search' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400']"
        >
          공고 검색
        </button>
        <button
          @click="tab = 'bookmarks'"
          :class="['px-4 py-2 text-sm font-medium rounded-md transition-colors', tab === 'bookmarks' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400']"
        >
          저장한 공고
          <span v-if="bookmarks.length" class="ml-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs px-1.5 py-0.5 rounded-full">{{ bookmarks.length }}</span>
        </button>
      </div>

      <!-- Search Tab -->
      <template v-if="tab === 'search'">
        <!-- Filters -->
        <div class="flex flex-wrap gap-3 mb-6">
          <select v-model="selectedTag" class="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option v-for="c in CATEGORIES" :key="c.id" :value="c.id">{{ c.label }}</option>
          </select>
          <select v-model="selectedYears" class="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option v-for="y in YEARS" :key="y.value" :value="y.value">{{ y.label }}</option>
          </select>
        </div>

        <!-- Job List -->
        <div class="grid gap-3">
          <div
            v-for="job in jobs"
            :key="job.id"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
            @click="openDetail(job.id)"
          >
            <div class="flex items-start gap-4">
              <img
                v-if="job.logo_img?.thumb"
                :src="job.logo_img.thumb"
                :alt="job.company?.name"
                class="w-12 h-12 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-gray-700"
              />
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 dark:text-white truncate">{{ job.position }}</h3>
                <div class="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span class="font-medium text-gray-700 dark:text-gray-300">{{ job.company?.name }}</span>
                  <span v-if="job.company?.industry_name" class="text-gray-300 dark:text-gray-600">|</span>
                  <span v-if="job.company?.industry_name">{{ job.company.industry_name }}</span>
                </div>
                <div class="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                  <span v-if="job.address?.location">{{ job.address.location }} {{ job.address.district }}</span>
                  <span v-if="annualText(job.annual_from, job.annual_to)" class="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                    {{ annualText(job.annual_from, job.annual_to) }}
                  </span>
                  <span v-if="job.due_time" class="text-orange-500">~{{ job.due_time }}</span>
                  <span v-if="job.reward?.formatted_total" class="text-green-600 dark:text-green-400">보상금 {{ job.reward.formatted_total }}</span>
                </div>
              </div>
              <button
                @click.stop="toggleBookmark(job)"
                :class="['p-2 rounded-lg transition-colors shrink-0', isBookmarked(job.id) ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400']"
              >
                <svg class="w-5 h-5" :fill="isBookmarked(job.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading / Load More -->
        <div v-if="loading" class="text-center py-8 text-gray-400">불러오는 중...</div>
        <div v-else-if="hasMore && jobs.length" class="text-center py-6">
          <button @click="loadMore" class="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            더 보기
          </button>
        </div>
        <div v-else-if="!loading && !jobs.length" class="text-center py-12 text-gray-400">공고가 없습니다.</div>
      </template>

      <!-- Bookmarks Tab -->
      <template v-if="tab === 'bookmarks'">
        <div v-if="bookmarks.length === 0" class="text-center py-12 text-gray-400 dark:text-gray-500">
          저장한 공고가 없습니다. 공고 검색에서 북마크하세요.
        </div>
        <div class="grid gap-3">
          <div
            v-for="b in bookmarks"
            :key="b.id"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
            @click="openDetail(b.id)"
          >
            <div class="flex items-start gap-4">
              <img
                v-if="b.logo"
                :src="b.logo"
                :alt="b.company"
                class="w-12 h-12 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-gray-700"
              />
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 dark:text-white truncate">{{ b.position }}</h3>
                <div class="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span class="font-medium text-gray-700 dark:text-gray-300">{{ b.company }}</span>
                  <span v-if="b.industry" class="text-gray-300 dark:text-gray-600">|</span>
                  <span v-if="b.industry">{{ b.industry }}</span>
                </div>
                <div class="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                  <span v-if="b.location">{{ b.location }}</span>
                  <span v-if="annualText(b.annual_from, b.annual_to)" class="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                    {{ annualText(b.annual_from, b.annual_to) }}
                  </span>
                  <span v-if="b.due_time" class="text-orange-500">~{{ b.due_time }}</span>
                  <span class="text-gray-300">저장: {{ new Date(b.savedAt).toLocaleDateString('ko-KR') }}</span>
                </div>
              </div>
              <button @click.stop="toggleBookmark(b)" class="p-2 rounded-lg text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shrink-0">
                <svg class="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="detail || detailLoading" class="fixed inset-0 z-[100] flex items-start justify-center pt-10 px-4" @click.self="closeDetail">
        <div class="fixed inset-0 bg-black/50" @click="closeDetail"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto z-10">
          <div v-if="detailLoading" class="p-12 text-center text-gray-400">불러오는 중...</div>
          <template v-else-if="detail">
            <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div class="min-w-0">
                <h2 class="text-lg font-bold dark:text-white truncate">{{ detail.position }}</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ detail.company?.name }}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <a
                  :href="`https://www.wanted.co.kr/wd/${detail.id}`"
                  target="_blank"
                  class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  원티드에서 보기
                </a>
                <button @click="closeDetail" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div class="px-6 py-5 space-y-6 text-sm text-gray-700 dark:text-gray-300">
              <div class="flex flex-wrap gap-2 text-xs">
                <span v-if="detail.address?.full_location" class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ detail.address.full_location }}</span>
                <span v-if="annualText(detail.annual_from, detail.annual_to)" class="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                  {{ annualText(detail.annual_from, detail.annual_to) }}
                </span>
                <span v-if="detail.due_time" class="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">마감 {{ detail.due_time }}</span>
              </div>

              <section v-if="detail.detail?.intro">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">회사/포지션 소개</h3>
                <p class="whitespace-pre-wrap leading-relaxed">{{ detail.detail.intro }}</p>
              </section>
              <section v-if="detail.detail?.main_tasks">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">주요업무</h3>
                <p class="whitespace-pre-wrap leading-relaxed">{{ detail.detail.main_tasks }}</p>
              </section>
              <section v-if="detail.detail?.requirements">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">자격요건</h3>
                <p class="whitespace-pre-wrap leading-relaxed">{{ detail.detail.requirements }}</p>
              </section>
              <section v-if="detail.detail?.preferred_points">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">우대사항</h3>
                <p class="whitespace-pre-wrap leading-relaxed">{{ detail.detail.preferred_points }}</p>
              </section>
              <section v-if="detail.detail?.benefits">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">혜택 및 복지</h3>
                <p class="whitespace-pre-wrap leading-relaxed">{{ detail.detail.benefits }}</p>
              </section>

              <div v-if="detail.company_tags?.length" class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in detail.company_tags"
                  :key="tag.id"
                  class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded"
                >
                  {{ tag.title }}
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>
