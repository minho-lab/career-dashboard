<script setup>
defineProps({
  achievement: Object,
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{{ achievement.title }}</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">{{ achievement.summary }}</p>

    <!-- Period & Duration -->
    <div v-if="achievement.period || achievement.duration" class="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-5">
      <span v-if="achievement.period" class="inline-flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        {{ achievement.period }}
      </span>
      <span v-if="achievement.duration" class="inline-flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {{ achievement.duration }}
      </span>
    </div>

    <div class="space-y-4 text-sm">
      <!-- Background -->
      <div v-if="achievement.background" class="flex gap-3">
        <div class="shrink-0 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div>
          <h4 class="font-semibold text-gray-600 dark:text-gray-300 mb-1">Background</h4>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ achievement.background }}</p>
        </div>
      </div>

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

      <!-- Lessons Learned -->
      <div v-if="achievement.lessonsLearned" class="flex gap-3">
        <div class="shrink-0 w-1 rounded-full bg-purple-400"></div>
        <div>
          <h4 class="font-semibold text-purple-600 dark:text-purple-400 mb-1">Lessons Learned</h4>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ achievement.lessonsLearned }}</p>
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
