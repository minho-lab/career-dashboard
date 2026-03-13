const BASE_PATH = '/data'

export const fetchJson = (path) =>
  fetch(`${BASE_PATH}${path}`).then(res => {
    if (!res.ok) throw new Error(`Failed to fetch ${path}`)
    return res.json()
  })
