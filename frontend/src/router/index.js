import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/work', name: 'Work', component: () => import('../views/Work.vue') },
  { path: '/approach', name: 'Approach', component: () => import('../views/Approach.vue') },
  { path: '/contact', name: 'Contact', component: () => import('../views/Contact.vue') },

  // Local-only tools (hidden from nav)
  { path: '/admin', name: 'Admin', component: () => import('../views/Admin.vue') },
  { path: '/jobs', name: 'Jobs', component: () => import('../views/Jobs.vue') },

  // Legacy paths → consolidated pages
  { path: '/about', redirect: '/' },
  { path: '/projects', redirect: '/work' },
  { path: '/projects/:id', redirect: '/work' },
  { path: '/achievements', redirect: '/work' },
  { path: '/timeline', redirect: '/work' },
  { path: '/tech', redirect: '/approach' },
  { path: '/architecture', redirect: '/approach' },
  { path: '/dashboard', redirect: '/work' },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
