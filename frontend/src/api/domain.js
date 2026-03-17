import { fetchJson } from './index'

export async function getDomains() {
  return fetchJson('/domains.json')
}
