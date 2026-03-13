import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const DATA_DIR = resolve(import.meta.dirname, '../public/data')

// .env 파일에서 환경변수 로드 (dotenv 없이)
function loadEnv() {
  const envPath = resolve(import.meta.dirname, '../.env')
  const config = {
    baseUrl: process.env.JIRA_BASE_URL || '',
    email: process.env.JIRA_EMAIL || '',
    apiToken: process.env.JIRA_API_TOKEN || '',
    project: process.env.JIRA_PROJECT || 'ECOMS',
  }

  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n')
    lines.forEach(line => {
      const match = line.match(/^(\w+)=(.+)$/)
      if (!match) return
      const [, key, value] = match
      if (key === 'JIRA_BASE_URL' && value) config.baseUrl = value.trim()
      if (key === 'JIRA_EMAIL' && value) config.email = value.trim()
      if (key === 'JIRA_API_TOKEN' && value) config.apiToken = value.trim()
      if (key === 'JIRA_PROJECT' && value) config.project = value.trim()
    })
  }

  return config
}

function getAuthHeader(config) {
  const credentials = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64')
  return `Basic ${credentials}`
}

export async function fetchJiraData(jql = null, maxResults = 50) {
  const config = loadEnv()

  if (!config.email || !config.apiToken || config.baseUrl.includes('your-domain')) {
    return {
      error: 'Jira 인증 정보가 설정되지 않았습니다. frontend/.env 파일에 JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN을 설정하세요.',
      configured: false,
    }
  }

  const defaultJql = jql || `project = ${config.project} AND assignee = currentUser() AND updated >= -30d ORDER BY updated DESC`

  try {
    const url = `${config.baseUrl}/rest/api/3/search?jql=${encodeURIComponent(defaultJql)}&maxResults=${maxResults}&fields=summary,status,issuetype,priority,created,updated,labels,components,description`
    const response = await fetch(url, {
      headers: {
        'Authorization': getAuthHeader(config),
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const text = await response.text()
      return { error: `Jira API 오류: ${response.status} ${text}`, configured: true }
    }

    const data = await response.json()
    const issues = data.issues.map(issue => ({
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status?.name,
      type: issue.fields.issuetype?.name,
      priority: issue.fields.priority?.name,
      created: issue.fields.created?.slice(0, 10),
      updated: issue.fields.updated?.slice(0, 10),
      labels: issue.fields.labels || [],
      components: (issue.fields.components || []).map(c => c.name),
    }))

    // 카테고리별 그룹핑 (이슈 타입 기준)
    const grouped = {}
    issues.forEach(issue => {
      const category = issue.components[0] || issue.labels[0] || issue.type || '미분류'
      if (!grouped[category]) grouped[category] = []
      grouped[category].push(issue)
    })

    return {
      configured: true,
      total: data.total,
      issues,
      grouped,
      jql: defaultJql,
    }
  } catch (err) {
    return { error: `Jira 연결 실패: ${err.message}`, configured: true }
  }
}

export function saveAsAchievement(data) {
  const filePath = resolve(DATA_DIR, 'achievements.json')
  const achievements = JSON.parse(readFileSync(filePath, 'utf-8'))
  const maxId = Math.max(...achievements.map(a => a.id), 0)
  const maxOrder = Math.max(...achievements.map(a => a.sortOrder), 0)

  const newAchievement = {
    id: maxId + 1,
    projectId: data.projectId || 1,
    title: data.title,
    summary: data.summary,
    problem: data.problem || '',
    solution: data.solution || '',
    result: data.result || '',
    metrics: data.metrics || '',
    sortOrder: maxOrder + 1,
  }

  achievements.push(newAchievement)
  writeFileSync(filePath, JSON.stringify(achievements, null, 2), 'utf-8')
  return newAchievement
}

export function updateProject(data) {
  const filePath = resolve(DATA_DIR, 'projects.json')
  const projects = JSON.parse(readFileSync(filePath, 'utf-8'))

  if (data.id) {
    const idx = projects.findIndex(p => p.id === data.id)
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], ...data }
      writeFileSync(filePath, JSON.stringify(projects, null, 2), 'utf-8')
      return projects[idx]
    }
  }

  const maxId = Math.max(...projects.map(p => p.id), 0)
  const maxOrder = Math.max(...projects.map(p => p.sortOrder), 0)
  const newProject = {
    id: maxId + 1,
    name: data.name || '',
    description: data.description || '',
    period: data.period || '',
    role: data.role || '',
    teamSize: data.teamSize || '',
    techStack: data.techStack || '',
    highlights: data.highlights || '',
    challenges: data.challenges || '',
    impact: data.impact || '',
    sortOrder: maxOrder + 1,
  }
  projects.push(newProject)
  writeFileSync(filePath, JSON.stringify(projects, null, 2), 'utf-8')
  return newProject
}
