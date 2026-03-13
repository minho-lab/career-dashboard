# Career Dashboard

커리어 성과를 시각화하는 개인 대시보드

## Live
https://career-dashboard-630.pages.dev

## Tech Stack
- **Frontend**: Vue 3 + Vite 7 + Tailwind CSS v4
- **Data**: 정적 JSON 파일 (`frontend/public/data/`)
- **Hosting**: Cloudflare Pages (자동 배포)

## Run

```bash
cd frontend && npm run dev
```

## Features

- 프로젝트/성과 관리 (Problem/Solution/Result 패턴)
- 타임라인 뷰 — 시간순 프로젝트/성과 정리
- 기술 스택 상세 — 카테고리별 기술, 프로젝트 연관성
- 성과 대시보드 — 정량 지표 시각화 (CSS 기반)
- GitHub 잔디 — 로컬 git 기반 Contribution Graph
- 검색/필터 — 프로젝트, 성과 키워드/카테고리 필터
- 다크모드 — 전체 페이지, localStorage 저장
- PDF 내보내기 — 브라우저 인쇄 기능
- Git/Jira 동기화 — 로컬 dev 모드에서 커밋/이슈 자동 수집

## Pages

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | 히어로, CTA, 프로젝트 목록 |
| About | `/about` | 경력, 기술 스택, GitHub 잔디 |
| Projects | `/projects` | 프로젝트 카드 + 검색/필터 |
| Project Detail | `/projects/:id` | 기여/도전/성과 상세 |
| Achievements | `/achievements` | PSR 패턴 카드 + 검색/필터 |
| Timeline | `/timeline` | 시간순 타임라인 |
| Tech Stack | `/tech` | 기술별 카테고리, 사용 비율 |
| Dashboard | `/dashboard` | 정량 지표 시각화 |
| Contact | `/contact` | 연락처 |
| Sync | `/admin` | Git/Jira 동기화 (로컬 전용) |
