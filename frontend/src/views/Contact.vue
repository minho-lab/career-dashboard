<script setup>
import { ref, onMounted } from 'vue'
import { getProfile } from '../api/profile'

const profile = ref(null)

onMounted(async () => {
  profile.value = await getProfile()
})
</script>

<template>
  <div v-if="profile">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2 dark:text-white">Contact</h1>
      <p class="text-gray-500 dark:text-gray-400">연락처 및 채널 정보입니다.</p>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
      <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{{ profile.contact }}</p>
    </div>
  </div>
</template>
