import { fetchJson } from './index'

export const getProjects = () => fetchJson('/projects.json')

export const getProject = (id) =>
  fetchJson('/projects.json').then(projects =>
    projects.find(p => p.id === Number(id))
  )
