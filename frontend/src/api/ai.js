import { fetchJson } from './index'

export const getAi = () => fetchJson('/ai.json')
