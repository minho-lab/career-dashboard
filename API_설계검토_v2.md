# Career Dashboard 프로젝트

> 이 파일은 커리어 대시보드 프로젝트의 요구사항 및 진행상황을 관리하는 문서입니다.

## 프로젝트 개요

이직용 커리어 대시보드를 Vue 3 정적 사이트로 개발한다.
회사에서 수행한 개발/운영 경험을 정리하고, Git/Jira 데이터를 자동 수집하여 성과를 시각화한다.

---

## 목표

1. **1차 목표**: 커리어 대시보드 웹사이트 개발 ✅
   - Vue 3 정적 사이트
   - 콘텐츠는 JSON 파일로 관리
   - 성과 시각화 (타임라인, 대시보드, 기술 스택)

2. **2차 목표**: 콘텐츠 자동 수집 ✅
   - Git 커밋 로그 자동 수집 (Admin 페이지)
   - Jira 티켓 자동 수집 (Admin 페이지)
   - 수집 데이터 → 프로젝트/Achievement로 변환

3. **3차 목표**: 배포 ✅
   - 개인 GitHub 레포 (minho-lab/career-dashboard)
   - Cloudflare Pages 자동 배포

---

## 배포 정보

| 항목 | 값 |
|------|-----|
| **사이트 URL** | https://career-dashboard-630.pages.dev |
| **GitHub** | https://github.com/minho-lab/career-dashboard |
| **호스팅** | Cloudflare Pages (무료) |
| **자동 배포** | main 브랜치 push 시 자동 빌드/배포 |
| **빌드 설정** | Root: `frontend`, Build: `npm run build`, Output: `dist` |

---

## 기술 스택

| 구분 | 기술 | 선택 이유 |
|------|------|----------|
| **Frontend** | Vue 3 + Vite 7 | 학습 곡선 낮음, 직관적 |
| **CSS** | Tailwind CSS v4 | 빠른 UI 구성, Vite 플러그인 방식, 다크모드 |
| **Data** | 정적 JSON 파일 | 백엔드 불필요, 심플한 구조 |
| **Build** | Vite 7 | 빠른 빌드, HMR 지원 |
| **Sync** | Vite 서버 미들웨어 | 로컬 dev 모드에서 Git/Jira 동기화 |
| **배포** | Cloudflare Pages | 무료, GitHub 연동 자동 배포 |
| **버전관리** | GitHub (개인 계정) | 회사 계정과 완전 분리 |

### 프로젝트 구조

```
career-dashboard/
├── frontend/                  # Vue 3 프로젝트
│   ├── public/
│   │   └── data/              # 정적 JSON 데이터
│   │       ├── profile.json
│   │       ├── projects.json
│   │       └── achievements.json
│   ├── src/
│   │   ├── views/             # 10개 페이지 컴포넌트
│   │   ├── components/        # 재사용 컴포넌트 (6개)
│   │   ├── composables/       # useDarkMode
│   │   └── api/               # fetch 기반 데이터 로딩 (4개)
│   ├── server/                # Vite dev 서버 미들웨어
│   │   ├── api-plugin.js      # API 라우팅
│   │   ├── git-sync.js        # Git 커밋 수집
│   │   └── jira-sync.js       # Jira 이슈 수집
│   └── package.json
│
├── jira_analysis.md           # 지라 티켓 분석 결과
├── jira_tickets_all.csv       # 지라 티켓 원본 (1,384건)
└── API_설계검토_v2.md          # 이 문서
```

---

## 웹사이트 구성 (10개 페이지)

### 1. 메인 페이지 (Home) `/`
- 히어로 섹션 (이름, 직함, 요약, CTA 버튼)
- 핵심 기술 스택 배지
- 주요 프로젝트 카드 목록

### 2. 프로필 페이지 (About) `/about`
- 2-column 그리드 레이아웃 (경력/학력 + 소개/스킬)
- GitHub 잔디 (Contribution Graph) — 로컬 git 기반

### 3. 프로젝트 목록 (Projects) `/projects`
- 프로젝트 카드 + 검색/기술 스택 필터
- hover 시 blue border + shadow + "View details" 애니메이션

### 4. 프로젝트 상세 (Project Detail) `/projects/:id`
- 기본 정보 + 2-column 그리드 (기여=파랑, 도전=주황, 성과=초록)
- 관련 Achievement 카드 목록

### 5. 성과 (Achievements) `/achievements`
- Problem/Solution/Result 패턴 카드 + 검색/프로젝트 필터
- 컬러 좌측 바 + 정량 지표 배지

### 6. 타임라인 (Timeline) `/timeline`
- 프로젝트/성과를 시간순으로 타임라인 뷰
- 연도 마커, 프로젝트(파랑)/성과(초록) 구분

### 7. 기술 스택 상세 (Tech Stack) `/tech`
- 기술별 카테고리 (Backend, DB, Cloud, Architecture, AI)
- 프로젝트 연관성 및 사용 비율 바

### 8. 성과 대시보드 (Dashboard) `/dashboard`
- 요약 카드 (프로젝트 수, 성과 수, 티켓 수, 주요 지표)
- 정량 지표 시각화 (감소율 바, before/after 비교)
- 프로젝트별 성과 수 차트

### 9. 연락처 (Contact) `/contact`
- 연락처 정보 카드

### 10. 동기화 (Sync/Admin) `/admin` — 로컬 전용
- Git 커밋 가져오기 (ec-oms-internal-api, batch-app-v2, admin)
- Jira 이슈 가져오기 (ECOMS 프로젝트)
- 프로젝트/Achievement 추가/업데이트 폼

---

## 주요 기능

### 다크모드
- 네비게이션 토글 버튼 (달/해 아이콘)
- 모든 페이지 dark: 클래스 적용
- localStorage 저장, 시스템 테마 감지

### PDF 내보내기
- 네비게이션 다운로드 아이콘 버튼
- 브라우저 인쇄 기능 (nav/footer 숨김 처리)

### GitHub 잔디 (Contribution Graph)
- 로컬 git 3개 레포 기반 1년간 커밋 잔디
- Vite 서버 미들웨어 API (`/api/github/contributions`)
- About 페이지에 표시

### Git/Jira 동기화 (로컬 전용)
- Vite dev server 미들웨어로 동작
- Git: 커밋 로그, 통계, 카테고리별(feat/fix/refactor) 분류
- Jira: REST API 연동 (`.env` 설정 필요)
- 프로젝트 업데이트 또는 Achievement 추가 가능

### 검색/필터
- Projects: 키워드 검색 + 기술 스택 필터
- Achievements: 키워드 검색 + 프로젝트 필터

---

## 데이터 모델 (JSON)

데이터는 `frontend/public/data/` 디렉토리의 정적 JSON 파일로 관리한다.

### profile.json
```json
{
  "name": "String",
  "title": "String (직함)",
  "summary": "String (자기소개)",
  "skills": "String (기술 스택, 콤마 구분)",
  "career": "String (경력 요약)",
  "education": "String (학력)",
  "contact": "String (연락처 정보)"
}
```

### projects.json (배열)
```json
{
  "id": "Number",
  "name": "String (프로젝트명)",
  "description": "String (설명)",
  "period": "String (기간)",
  "role": "String (역할)",
  "teamSize": "String (팀 규모)",
  "techStack": "String (기술 스택, 콤마 구분)",
  "highlights": "String (주요 기여)",
  "challenges": "String (기술적 도전과 해결)",
  "impact": "String (성과/임팩트)",
  "sortOrder": "Number (정렬 순서)"
}
```

### achievements.json (배열)
```json
{
  "id": "Number",
  "projectId": "Number|null (연관 프로젝트)",
  "title": "String (성과 제목)",
  "summary": "String (한 줄 요약)",
  "problem": "String (문제 상황)",
  "solution": "String (해결 과정)",
  "result": "String (결과)",
  "metrics": "String (정량 지표)",
  "sortOrder": "Number (정렬 순서)"
}
```

---

## 콘텐츠 소스

### 1. 지라 티켓 (수집 완료)
- 프로젝트: ECOMS
- 담당자: 송민호
- 총 1,384건 수집 → 7개 카테고리 분류 → 11개 Achievement 선별

### 2. 성과보고서 (반영 완료)
- 정량 지표 추출: CS 67% 감소, 출고후취소 95% 감소 등

### 3. 로컬 Git 커밋 기록 (동기화 기능으로 수집 가능)
- ec-oms-internal-api (135건/3개월)
- ec-oms-batch-app-v2 (142건/3개월)
- ec-oms-admin (81건/3개월)

---

## 진행 상태

| Phase | 상태 | 완료일 |
|-------|------|--------|
| Phase 1: 프로젝트 셋업 | ✅ 완료 | 2026-03-06 |
| Phase 2: 정적 JSON 데이터 구성 | ✅ 완료 | 2026-03-06 |
| Phase 3: 프론트엔드 | ✅ 완료 | 2026-03-06 |
| Phase 4: 콘텐츠 입력 | ✅ 완료 | 2026-03-09 |
| Phase 5: 스타일링 | ✅ 완료 | 2026-03-09 |
| Phase 6: 백엔드 제거 → 정적 사이트 전환 | ✅ 완료 | 2026-03-12 |
| Phase 7: 추가 기능 | ✅ 완료 | 2026-03-13 |
| Phase 8: GitHub + Cloudflare 배포 | ✅ 완료 | 2026-03-13 |

---

## Phase별 상세 작업 내용

### Phase 1: 프로젝트 셋업 ✅ 완료
- [x] 디렉토리 생성 + `git init`
- [x] Vue 3 + Vite 7 + Tailwind CSS v4 프론트엔드
- [x] vue-router 설치
- [x] 프론트엔드 빌드 확인

### Phase 2: 정적 JSON 데이터 구성 ✅ 완료
- [x] `public/data/profile.json` — 프로필 정보
- [x] `public/data/projects.json` — 프로젝트 목록
- [x] `public/data/achievements.json` — 성과 목록
- [x] fetch 기반 데이터 로딩 모듈 (`src/api/`)

### Phase 3: 프론트엔드 페이지 개발 ✅ 완료
- [x] 데이터 로딩 모듈: `src/api/` (index, profile, project, achievement)
- [x] 6개 페이지 (Home, About, Projects, ProjectDetail, Achievements, Contact)
- [x] 공통 컴포넌트: ProjectCard, AchievementCard, SkillBadge, MarkdownContent
- [x] 네비게이션 (App.vue에 내장)

### Phase 4: 콘텐츠 입력 ✅ 완료
- [x] 지라 ECOMS 프로젝트 전체 티켓 수집 (1,384건)
- [x] 7개 카테고리 분류
- [x] 11개 Achievement 선별 및 JSON 데이터 반영
- [x] 성과보고서 정량 데이터 반영

### Phase 5: 스타일링 ✅ 완료
- [x] 전체 페이지 카드 기반 디자인
- [x] 반응형 디자인 (모바일 햄버거 메뉴, grid 반응형)
- [x] hover 효과, PSR 컬러 패턴

### Phase 6: 백엔드 제거 → 정적 사이트 전환 ✅ 완료
- [x] Spring Boot 백엔드 제거
- [x] H2 DB → 정적 JSON 파일로 데이터 이관
- [x] axios → fetch 기반으로 API 모듈 변경

### Phase 7: 추가 기능 ✅ 완료 (2026-03-13)
- [x] 타임라인 뷰 (`/timeline`)
- [x] 기술 스택 상세 페이지 (`/tech`)
- [x] 성과 대시보드 (`/dashboard`) — CSS 기반 시각화
- [x] 검색/필터 (Projects, Achievements)
- [x] PDF 내보내기 (브라우저 인쇄)
- [x] GitHub 잔디 (로컬 git 기반 Contribution Graph)
- [x] 다크모드 (전체 페이지, localStorage 저장)
- [x] Git/Jira 동기화 Admin 페이지
- [x] 프로젝트/Achievement 추가/업데이트 기능

### Phase 8: GitHub + Cloudflare 배포 ✅ 완료 (2026-03-13)
- [x] 개인 GitHub 계정 생성 (minho-lab)
- [x] SSH 키 생성 및 설정 (회사 계정과 분리)
- [x] career-dashboard 레포 생성 및 push (8개 커밋)
- [x] Cloudflare Pages 연동 및 자동 배포 설정
- [x] https://career-dashboard-630.pages.dev 배포 완료

---

## 의사결정 기록

| 날짜 | 결정 사항 | 이유 |
|------|----------|------|
| 2026-02-02 | React 대신 Vue 선택 | 학습 곡선 낮음, 나중에 React 포팅 가능 |
| 2026-03-06 | Tailwind CSS v4 + Vite 플러그인 | postcss 설정 불필요 |
| 2026-03-06 | 지라 티켓 기반 콘텐츠 수집 | 1,384건 → 11개 Achievement 선별 |
| 2026-03-12 | 백엔드 제거, 정적 사이트 전환 | 배포 단순화 |
| 2026-03-13 | 프로젝트명 career-dashboard로 변경 | 성과 시각화 도구 성격에 맞게 |
| 2026-03-13 | 개인 GitHub + SSH 키 분리 | 회사 계정과 완전 분리 |
| 2026-03-13 | Cloudflare Pages 배포 | 무료, GitHub 연동 자동 배포, 빠름 |

---

## Git 커밋 이력

```
a26b0fb docs: 요구사항 문서 및 Jira 티켓 분석 데이터
17ae3e9 feat: Git/Jira 동기화 기능
6c71271 feat: 타임라인, 기술 스택 상세, 성과 대시보드 페이지
2632c6b feat: 핵심 페이지 6개 + 네비게이션
7975a43 feat: 공통 컴포넌트 및 다크모드
80c76cb feat: 정적 JSON 데이터 (프로필, 프로젝트 1건, 성과 11건)
f8fdabc feat: 프론트엔드 기본 구조 (Vue 3 + Vite 7 + Tailwind CSS v4)
810c968 chore: 프로젝트 초기 설정 (.gitignore, README)
```

---

## 로컬 개발 환경

```bash
# 프론트엔드 개발 서버 (http://localhost:5173)
cd frontend && npm run dev

# Jira 동기화 사용 시 .env 설정
# frontend/.env
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT=ECOMS
```

## Git 설정 (개인 GitHub)

```bash
# SSH config (~/.ssh/config)
Host github-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal

# 이 레포 로컬 설정
git config user.name "minho-lab"
git config user.email "arog1086@gmail.com"

# push
git push origin main  # → Cloudflare 자동 배포
```

---

## 다른 세션에서 이어서 작업할 때

```
커리어 대시보드 개발을 이어서 해줘.
요구사항 문서: /Users/ad1116/IdeaProjects/portfolio/API_설계검토_v2.md

현재 진행 상태: Phase 8까지 완료 (배포 완료)
사이트: https://career-dashboard-630.pages.dev
GitHub: https://github.com/minho-lab/career-dashboard

프로젝트 위치: ~/IdeaProjects/portfolio/
- 프론트: cd frontend && npm run dev (http://localhost:5173)
```

---

*마지막 업데이트: 2026-03-13*
