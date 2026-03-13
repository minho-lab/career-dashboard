<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: String,
})

const lines = computed(() => {
  if (!props.content) return []
  return props.content.split('\n').filter(l => l.trim())
})
</script>

<template>
  <ul v-if="lines.length && lines[0].startsWith('-')" class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm">
    <li v-for="(line, i) in lines" :key="i">{{ line.replace(/^-\s*/, '') }}</li>
  </ul>
  <p v-else class="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">{{ content }}</p>
</template>
