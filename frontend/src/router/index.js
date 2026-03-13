import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: () => import('../views/About.vue') },
  { path: '/projects', name: 'Projects', component: () => import('../views/Projects.vue') },
  { path: '/projects/:id', name: 'ProjectDetail', component: () => import('../views/ProjectDetail.vue') },
  { path: '/achievements', name: 'Achievements', component: () => import('../views/Achievements.vue') },
  { path: '/timeline', name: 'Timeline', component: () => import('../views/Timeline.vue') },
  { path: '/tech', name: 'TechStack', component: () => import('../views/TechStack.vue') },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
  { path: '/contact', name: 'Contact', component: () => import('../views/Contact.vue') },
  { path: '/admin', name: 'Admin', component: () => import('../views/Admin.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
