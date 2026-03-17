<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ref } from 'vue'
import { useDarkMode } from './composables/useDarkMode'

const route = useRoute()
const mobileOpen = ref(false)
const { isDark, toggle: toggleDark } = useDarkMode()

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/tech', label: 'Tech' },
  { to: '/architecture', label: 'Architecture' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/contact', label: 'Contact' },
  { to: '/admin', label: 'Sync' },
  { to: '/ai-editor', label: 'AI Editor' },
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function exportPdf() {
  window.print()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
    <nav class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 dark:bg-gray-900/80 dark:shadow-gray-800 no-print">
      <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <RouterLink to="/" class="text-xl font-bold tracking-tight text-gray-900 hover:text-blue-600 transition-colors dark:text-white dark:hover:text-blue-400">
          MH.dev
        </RouterLink>

        <!-- Desktop nav -->
        <div class="hidden lg:flex items-center gap-1">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            :class="[
              'px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors',
              isActive(link.to)
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
            ]"
          >
            {{ link.label }}
          </RouterLink>

          <!-- Dark mode toggle -->
          <button @click="toggleDark" class="ml-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="다크모드 전환">
            <svg v-if="isDark" class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" /></svg>
            <svg v-else class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
          </button>

          <!-- PDF export -->
          <button @click="exportPdf" class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="PDF 내보내기">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </button>
        </div>

        <!-- Mobile hamburger -->
        <div class="lg:hidden flex items-center gap-2">
          <button @click="toggleDark" class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg v-if="isDark" class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" /></svg>
            <svg v-else class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
          </button>
          <button @click="mobileOpen = !mobileOpen" class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg class="w-5 h-5 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileOpen" class="lg:hidden border-t border-gray-100 dark:border-gray-800 px-4 py-2">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          @click="mobileOpen = false"
          :class="[
            'block px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
            isActive(link.to)
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          ]"
        >
          {{ link.label }}
        </RouterLink>
        <button @click="exportPdf(); mobileOpen = false" class="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
          PDF 내보내기
        </button>
      </div>
    </nav>

    <main class="max-w-5xl mx-auto px-6 py-10">
      <RouterView />
    </main>

    <footer class="border-t border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 no-print">
      <div class="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-gray-400 dark:text-gray-600">
        &copy; 2025 MH.dev. Built with Vue 3 + Tailwind CSS.
      </div>
    </footer>
  </div>
</template>
