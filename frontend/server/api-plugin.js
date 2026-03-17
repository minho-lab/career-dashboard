import { fetchGitData, saveAsAchievement as saveGitAchievement, updateProject as updateGitProject } from './git-sync.js'
import { fetchJiraData, saveAsAchievement as saveJiraAchievement, updateProject as updateJiraProject } from './jira-sync.js'
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { resolve } from 'path'

const DATA_DIR = resolve(import.meta.dirname, '../public/data')
const REPOS_BASE = '/Users/ad1116/IdeaProjects'
const GIT_REPOS = ['ec-oms-internal-api', 'ec-oms-batch-app-v2', 'ec-oms-admin']

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      try { resolve(JSON.parse(body)) }
      catch { resolve({}) }
    })
    req.on('error', reject)
  })
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

export default function apiPlugin() {
  return {
    name: 'portfolio-api',
    configureServer(server) {
      // Git 데이터 조회
      server.middlewares.use('/api/sync/git', async (req, res) => {
        if (req.method === 'GET') {
          try {
            const url = new URL(req.url, 'http://localhost')
            const since = url.searchParams.get('since') || '3 months ago'
            const data = fetchGitData(since)
            sendJson(res, data)
          } catch (err) {
            sendJson(res, { error: err.message }, 500)
          }
        }
      })

      // Jira 데이터 조회
      server.middlewares.use('/api/sync/jira', async (req, res) => {
        if (req.method === 'GET') {
          try {
            const url = new URL(req.url, 'http://localhost')
            const jql = url.searchParams.get('jql')
            const maxResults = parseInt(url.searchParams.get('maxResults') || '50')
            const data = await fetchJiraData(jql, maxResults)
            sendJson(res, data)
          } catch (err) {
            sendJson(res, { error: err.message }, 500)
          }
        }
      })

      // Achievement 저장 (source: git 또는 jira)
      server.middlewares.use('/api/save/achievement', async (req, res) => {
        if (req.method === 'POST') {
          try {
            const body = await parseBody(req)
            const result = saveGitAchievement(body)
            sendJson(res, result)
          } catch (err) {
            sendJson(res, { error: err.message }, 500)
          }
        }
      })

      // Project 저장/업데이트
      server.middlewares.use('/api/save/project', async (req, res) => {
        if (req.method === 'POST') {
          try {
            const body = await parseBody(req)
            const result = updateGitProject(body)
            sendJson(res, result)
          } catch (err) {
            sendJson(res, { error: err.message }, 500)
          }
        }
      })

      // Achievement 삭제
      server.middlewares.use('/api/delete/achievement', async (req, res) => {
        if (req.method === 'POST') {
          try {
            const { id } = await parseBody(req)
            const filePath = resolve(DATA_DIR, 'achievements.json')
            const achievements = JSON.parse(readFileSync(filePath, 'utf-8'))
            const filtered = achievements.filter(a => a.id !== id)
            writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf-8')
            sendJson(res, { success: true })
          } catch (err) {
            sendJson(res, { error: err.message }, 500)
          }
        }
      })

      // Project 삭제
      server.middlewares.use('/api/delete/project', async (req, res) => {
        if (req.method === 'POST') {
          try {
            const { id } = await parseBody(req)
            const filePath = resolve(DATA_DIR, 'projects.json')
            const projects = JSON.parse(readFileSync(filePath, 'utf-8'))
            const filtered = projects.filter(p => p.id !== id)
            writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf-8')
            sendJson(res, { success: true })
          } catch (err) {
            sendJson(res, { error: err.message }, 500)
          }
        }
      })

      // 현재 프로젝트 목록 조회 (폼에서 선택용)
      server.middlewares.use('/api/projects', async (req, res) => {
        if (req.method === 'GET') {
          try {
            const filePath = resolve(DATA_DIR, 'projects.json')
            const projects = JSON.parse(readFileSync(filePath, 'utf-8'))
            sendJson(res, projects)
          } catch (err) {
            sendJson(res, { error: err.message }, 500)
          }
        }
      })

      // GitHub 스타일 잔디 (로컬 git 기반)
      server.middlewares.use('/api/github/contributions', async (req, res) => {
        if (req.method === 'GET') {
          try {
            const contributions = {}
            for (const repoName of GIT_REPOS) {
              const repoPath = resolve(REPOS_BASE, repoName)
              try {
                const log = execSync(
                  'git log --since="1 year ago" --pretty=format:"%ad" --date=short',
                  { cwd: repoPath, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
                )
                log.split('\n').filter(Boolean).forEach(date => {
                  contributions[date] = (contributions[date] || 0) + 1
                })
              } catch { /* repo not found */ }
            }

            // 최근 1년 날짜별 정리
            const today = new Date()
            const oneYearAgo = new Date(today)
            oneYearAgo.setFullYear(today.getFullYear() - 1)
            const days = []
            for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
              const dateStr = d.toISOString().slice(0, 10)
              days.push({ date: dateStr, count: contributions[dateStr] || 0 })
            }

            const totalCommits = days.reduce((sum, d) => sum + d.count, 0)
            const activeDays = days.filter(d => d.count > 0).length
            const maxCount = Math.max(...days.map(d => d.count), 1)

            sendJson(res, { days, totalCommits, activeDays, maxCount })
          } catch (err) {
            sendJson(res, { error: err.message }, 500)
          }
        }
      })
    },
  }
}
