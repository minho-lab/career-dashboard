<script setup>
defineProps({
  achievement: Object,
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{{ achievement.title }}</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">{{ achievement.summary }}</p>

    <div class="space-y-4 text-sm">
      <div v-if="achievement.problem" class="flex gap-3">
        <div class="shrink-0 w-1 rounded-full bg-red-400"></div>
        <div>
          <h4 class="font-semibold text-red-600 dark:text-red-400 mb-1">Problem</h4>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ achievement.problem }}</p>
        </div>
      </div>
      <div v-if="achievement.solution" class="flex gap-3">
        <div class="shrink-0 w-1 rounded-full bg-blue-400"></div>
        <div>
          <h4 class="font-semibold text-blue-600 dark:text-blue-400 mb-1">Solution</h4>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ achievement.solution }}</p>
        </div>
      </div>
      <div v-if="achievement.result" class="flex gap-3">
        <div class="shrink-0 w-1 rounded-full bg-green-400"></div>
        <div>
          <h4 class="font-semibold text-green-600 dark:text-green-400 mb-1">Result</h4>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ achievement.result }}</p>
        </div>
      </div>
    </div>

    <div v-if="achievement.metrics" class="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
      <span class="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        {{ achievement.metrics }}
      </span>
    </div>
  </div>
</template>
