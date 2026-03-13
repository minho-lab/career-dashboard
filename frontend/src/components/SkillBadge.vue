<script setup>
defineProps({
  label: String,
})
</script>

<template>
  <span class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2.5 py-1 rounded-md">
    {{ label }}
  </span>
</template>
