# Portfolio

개인 포트폴리오 웹사이트 (이직용)

## Tech Stack
- **Frontend**: Vue 3 + Vite 7 + Tailwind CSS v4
- **Data**: 정적 JSON 파일 (`frontend/public/data/`)
- **배포**: 정적 사이트 (GitHub Pages 등)

## Run

```bash
# Frontend (http://localhost:5173)
cd frontend && npm run dev
```

## Project Structure

```
portfolio/
├── frontend/                     # Vue 3 + Vite 7
│   ├── public/
│   │   └── data/                 # 정적 JSON 데이터
│   │       ├── profile.json      # 프로필 정보
│   │       ├── projects.json     # 프로젝트 목록
│   │       └── achievements.json # 성과 목록
│   └── src/
│       ├── api/                  # fetch 기반 데이터 로딩 모듈
│       ├── views/                # 6 pages (Home, About, Projects, ProjectDetail, Achievements, Contact)
│       └── components/           # ProjectCard, AchievementCard, SkillBadge, MarkdownContent
│
├── jira_analysis.md              # 지라 티켓 분석 결과
├── jira_tickets_all.csv          # 지라 티켓 원본 데이터 (1,384건)
└── API_설계검토_v2.md             # 요구사항 및 진행상황 문서
```

## Pages

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | 히어로 섹션, CTA 버튼, 주요 프로젝트 |
| About | `/about` | 경력, 학력, 기술 스택 (2-column 그리드) |
| Projects | `/projects` | 프로젝트 카드 목록 (hover 효과) |
| Project Detail | `/projects/:id` | 기여/도전/성과 상세 + 관련 Achievement |
| Achievements | `/achievements` | Problem/Solution/Result 패턴 카드 |
| Contact | `/contact` | 연락처 정보 |

## Features

- Sticky navigation + mobile hamburger menu
- Hero section with CTA buttons
- Project cards with hover effects
- Achievement cards with Problem/Solution/Result pattern + quantitative metrics
- Responsive grid layout
- 정적 JSON 기반 데이터 로딩 (백엔드 불필요)