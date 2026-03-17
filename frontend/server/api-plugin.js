import { fetchGitData, saveAsAchievement as saveGitAchievement, updateProject as updateGitProject } from './git-sync.js'
import { fetchJiraData, saveAsAchievement as saveJiraAchievement, updateProject as updateJiraProject } from './jira-sync.js'
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { resolve } from 'path'

const DATA_DIR = resolve(import.meta.dirname, '../public/data')
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
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

      // AI 에디터: 현재 데이터 조회
      server.middlewares.use('/api/ai/data', async (req, res) => {
        if (req.method === 'GET') {
          try {
            const achievements = JSON.parse(readFileSync(resolve(DATA_DIR, 'achievements.json'), 'utf-8'))
            const projects = JSON.parse(readFileSync(resolve(DATA_DIR, 'projects.json'), 'utf-8'))
            const profile = JSON.parse(readFileSync(resolve(DATA_DIR, 'profile.json'), 'utf-8'))
            const domains = JSON.parse(readFileSync(resolve(DATA_DIR, 'domains.json'), 'utf-8'))
            sendJson(res, { achievements, projects, profile, domains })
          } catch (err) {
            sendJson(res, { error: err.message }, 500)
          }
        }
      })

      // AI 에디터: Claude API 호출 + 데이터 수정
      server.middlewares.use('/api/ai/chat', async (req, res) => {
        if (req.method === 'POST') {
          if (!ANTHROPIC_API_KEY) {
            return sendJson(res, { error: 'ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.' }, 400)
          }
          try {
            const { message, history } = await parseBody(req)

            // 현재 데이터 로드
            const achievements = JSON.parse(readFileSync(resolve(DATA_DIR, 'achievements.json'), 'utf-8'))
            const projects = JSON.parse(readFileSync(resolve(DATA_DIR, 'projects.json'), 'utf-8'))
            const profile = JSON.parse(readFileSync(resolve(DATA_DIR, 'profile.json'), 'utf-8'))
            const domains = JSON.parse(readFileSync(resolve(DATA_DIR, 'domains.json'), 'utf-8'))

            const systemPrompt = `당신은 포트폴리오 데이터를 수정하는 AI 어시스턴트입니다.

현재 포트폴리오 데이터:
=== profile.json ===
${JSON.stringify(profile, null, 2)}

=== projects.json ===
${JSON.stringify(projects, null, 2)}

=== achievements.json ===
${JSON.stringify(achievements, null, 2)}

=== domains.json (아키텍처 결정 등) ===
${JSON.stringify(domains, null, 2)}

사용자가 요청하면 데이터를 수정하세요.

중요 규칙:
- 면접관 관점에서 임팩트 있게 작성 (문제→해결→결과→교훈 구조)
- 내부 조직 정보, R&R, 문서 개수 나열 등은 지양
- 수치와 비용 환산을 포함하여 구체적으로
- 수정이 필요하면 반드시 아래 JSON 형식으로 응답의 마지막에 포함하세요:

\`\`\`json:changes
{
  "files": {
    "achievements.json": [...전체 배열...],
    "projects.json": [...전체 배열...],
    "profile.json": {...전체 객체...},
    "domains.json": {...전체 객체...}
  }
}
\`\`\`

수정할 파일만 files에 포함하세요. 변경 없는 파일은 생략하세요.
수정 없이 대화만 할 때는 json:changes 블록 없이 텍스트만 응답하세요.`

            const messages = [
              ...(history || []),
              { role: 'user', content: message }
            ]

            const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 8192,
                system: systemPrompt,
                messages,
              }),
            })

            if (!apiRes.ok) {
              const err = await apiRes.text()
              return sendJson(res, { error: `Anthropic API error: ${err}` }, apiRes.status)
            }

            const apiData = await apiRes.json()
            const reply = apiData.content?.[0]?.text || ''

            // json:changes 블록 파싱 및 파일 저장
            const changesMatch = reply.match(/```json:changes\s*\n([\s\S]*?)\n```/)
            let applied = []
            if (changesMatch) {
              try {
                const changes = JSON.parse(changesMatch[1])
                if (changes.files) {
                  for (const [filename, data] of Object.entries(changes.files)) {
                    const filePath = resolve(DATA_DIR, filename)
                    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
                    applied.push(filename)
                  }
                }
              } catch (parseErr) {
                // JSON 파싱 실패 시 무시하고 텍스트 응답만 전달
              }
            }

            // json:changes 블록을 제거한 텍스트 응답
            const cleanReply = reply.replace(/```json:changes\s*\n[\s\S]*?\n```/, '').trim()

            sendJson(res, { reply: cleanReply, applied })
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
