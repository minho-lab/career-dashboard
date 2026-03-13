import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const REPOS_BASE = '/Users/ad1116/IdeaProjects'
const DATA_DIR = resolve(import.meta.dirname, '../public/data')

const REPOS = [
  { name: 'ec-oms-internal-api', label: 'EC-OMS Internal API' },
  { name: 'ec-oms-batch-app-v2', label: 'EC-OMS Batch App V2' },
  { name: 'ec-oms-admin', label: 'EC-OMS Admin' },
]

function getGitLog(repoPath, since = '3 months ago') {
  try {
    const SEP = '§§§'
    const log = execSync(
      `git log --since="${since}" --pretty=format:"%H${SEP}%s${SEP}%an${SEP}%ad" --date=short`,
      { cwd: repoPath, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    )
    return log.split('\n').filter(Boolean).map(line => {
      const parts = line.split(SEP)
      return { hash: parts[0], subject: parts[1] || '', author: parts[2] || '', date: parts[3] || '' }
    })
  } catch {
    return []
  }
}

function getGitStats(repoPath, since = '3 months ago') {
  try {
    const stat = execSync(
      `git log --since="${since}" --shortstat --pretty=format:""`,
      { cwd: repoPath, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    )
    let totalInsertions = 0, totalDeletions = 0, totalFiles = 0
    stat.split('\n').filter(Boolean).forEach(line => {
      const files = line.match(/(\d+) files? changed/)
      const ins = line.match(/(\d+) insertions?/)
      const del = line.match(/(\d+) deletions?/)
      if (files) totalFiles += parseInt(files[1])
      if (ins) totalInsertions += parseInt(ins[1])
      if (del) totalDeletions += parseInt(del[1])
    })
    return { totalFiles, totalInsertions, totalDeletions }
  } catch {
    return { totalFiles: 0, totalInsertions: 0, totalDeletions: 0 }
  }
}

function getBranches(repoPath) {
  try {
    const branches = execSync(
      'git branch -r --sort=-committerdate --format="%(refname:short)|%(committerdate:short)|%(subject)"',
      { cwd: repoPath, encoding: 'utf-8' }
    )
    return branches.split('\n').filter(Boolean).slice(0, 20).map(line => {
      const [name, date, ...subjectParts] = line.split('|')
      return { name, date, subject: subjectParts.join('|') }
    })
  } catch {
    return []
  }
}

// 커밋을 카테고리별로 분류
function categorizeCommits(commits) {
  const categories = {}
  commits.forEach(c => {
    const prefix = c.subject.match(/^(feat|fix|refactor|chore|docs|test|perf|style):/i)
    const type = prefix ? prefix[1].toLowerCase() : 'other'
    if (!categories[type]) categories[type] = []
    categories[type].push(c)
  })
  return categories
}

export function fetchGitData(since = '3 months ago') {
  const results = []

  for (const repo of REPOS) {
    const repoPath = resolve(REPOS_BASE, repo.name)
    const commits = getGitLog(repoPath, since)
    const stats = getGitStats(repoPath, since)
    const branches = getBranches(repoPath)
    const categories = categorizeCommits(commits)

    results.push({
      repo: repo.name,
      label: repo.label,
      commitCount: commits.length,
      commits: commits.slice(0, 50),
      stats,
      branches: branches.slice(0, 10),
      categories,
    })
  }

  return results
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
    // 기존 프로젝트 업데이트
    const idx = projects.findIndex(p => p.id === data.id)
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], ...data }
      writeFileSync(filePath, JSON.stringify(projects, null, 2), 'utf-8')
      return projects[idx]
    }
  }

  // 새 프로젝트 추가
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
