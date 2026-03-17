<script setup>
import { ref, nextTick, onMounted } from 'vue'

const input = ref('')
const messages = ref([])
const loading = ref(false)
const available = ref(null)
const chatArea = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('/api/ai/data')
    if (res.ok) {
      available.value = true
    } else {
      available.value = false
    }
  } catch {
    available.value = false
  }
})

async function send() {
  const text = input.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  loading.value = true

  await scrollToBottom()

  try {
    // 대화 이력 구성 (최근 10턴)
    const history = messages.value
      .slice(-20)
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(0, -1) // 방금 추가한 user 메시지 제외 (서버에서 message로 별도 전송)
      .map(m => ({ role: m.role, content: m.content }))

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history }),
    })

    const data = await res.json()

    if (data.error) {
      messages.value.push({ role: 'error', content: data.error })
    } else {
      const appliedText = data.applied?.length
        ? `\n\n---\n파일 수정 완료: ${data.applied.join(', ')}`
        : ''
      messages.value.push({
        role: 'assistant',
        content: data.reply + appliedText,
        applied: data.applied || [],
      })
    }
  } catch (err) {
    messages.value.push({ role: 'error', content: `요청 실패: ${err.message}` })
  }

  loading.value = false
  await scrollToBottom()
}

async function scrollToBottom() {
  await nextTick()
  if (chatArea.value) {
    chatArea.value.scrollTop = chatArea.value.scrollHeight
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}
</script>

<template>
  <div class="flex flex-col" style="height: calc(100vh - 180px)">
    <div class="mb-4">
      <h1 class="text-3xl font-bold dark:text-white">AI Editor</h1>
      <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">포트폴리오 데이터를 자연어로 수정합니다. 로컬 개발 환경에서만 동작합니다.</p>
    </div>

    <!-- Not available -->
    <div v-if="available === false" class="flex-1 flex items-center justify-center">
      <div class="text-center bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-8 max-w-md">
        <svg class="w-10 h-10 text-amber-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        <h3 class="font-semibold text-amber-800 dark:text-amber-300 mb-2">로컬 개발 환경에서만 사용 가능</h3>
        <p class="text-sm text-amber-600 dark:text-amber-400">
          <code>ANTHROPIC_API_KEY=sk-... npm run dev</code> 로 실행하세요.
        </p>
      </div>
    </div>

    <!-- Chat area -->
    <template v-if="available">
      <div ref="chatArea" class="flex-1 overflow-y-auto space-y-4 pb-4">
        <!-- Empty state -->
        <div v-if="messages.length === 0" class="flex items-center justify-center h-full">
          <div class="text-center text-gray-400 dark:text-gray-500 max-w-md">
            <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <p class="text-sm mb-3">포트폴리오 데이터를 수정해보세요</p>
            <div class="space-y-2 text-xs">
              <button @click="input = '클레임 자동화 성과의 CS 감소율을 70%로 수정해줘'" class="block w-full text-left px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                "클레임 자동화 성과의 CS 감소율을 70%로 수정해줘"
              </button>
              <button @click="input = '프로필 요약을 좀 더 간결하게 다듬어줘'" class="block w-full text-left px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                "프로필 요약을 좀 더 간결하게 다듬어줘"
              </button>
              <button @click="input = '새로운 성과를 추가해줘: 배포 파이프라인 개선으로 배포 시간 50% 단축'" class="block w-full text-left px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                "새로운 성과를 추가해줘: 배포 파이프라인 개선으로 배포 시간 50% 단축"
              </button>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="[
            'rounded-xl px-4 py-3 text-sm leading-relaxed max-w-[85%]',
            msg.role === 'user'
              ? 'ml-auto bg-blue-600 text-white'
              : msg.role === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
          ]"
        >
          <div class="whitespace-pre-wrap">{{ msg.content }}</div>
          <div v-if="msg.applied?.length" class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="file in msg.applied"
              :key="file"
              class="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium px-2 py-0.5 rounded-full"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              {{ file }}
            </span>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 max-w-[85%]">
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            Claude가 생각하는 중...
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div class="flex gap-2">
          <textarea
            v-model="input"
            @keydown="handleKeydown"
            placeholder="포트폴리오 수정 요청을 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
            rows="2"
            class="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            :disabled="loading"
          />
          <button
            @click="send"
            :disabled="!input.trim() || loading"
            :class="[
              'px-4 rounded-xl font-medium text-sm transition-colors shrink-0',
              input.trim() && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
            ]"
          >
            전송
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
