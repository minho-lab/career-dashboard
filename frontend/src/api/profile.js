import { fetchJson } from './index'

export const getProfile = () => fetchJson('/profile.json')
