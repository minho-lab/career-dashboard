import { fetchJson } from './index'

export const getAchievements = (projectId) =>
  fetchJson('/achievements.json').then(achievements =>
    projectId
      ? achievements.filter(a => a.projectId === Number(projectId))
      : achievements
  )
