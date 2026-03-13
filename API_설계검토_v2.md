# 포트폴리오 웹사이트 프로젝트

> 이 파일은 포트폴리오 프로젝트의 요구사항 및 진행상황을 관리하는 문서입니다.

## 프로젝트 개요

이직용 개인 포트폴리오 웹사이트를 Vue 3 정적 사이트로 개발한다.
회사에서 수행한 개발/운영 경험을 정리하고, 정적 JSON 데이터 기반으로 구성한다.

---

## 목표

1. **1차 목표**: 포트폴리오 웹사이트 개발
   - Vue 3 정적 사이트
   - 로컬에서 실행하여 확인 가능
   - 콘텐츠는 JSON 파일로 관리

2. **2차 목표**: 콘텐츠 자동 수집 (나중에)
   - 지라 티켓 자동 수집
   - Git 커밋 로그 분석
   - 자동으로 포트폴리오 콘텐츠 생성

3. **3차 목표**: 개인 Git 저장소 (나중에)
   - 퇴사 후에도 유지 가능한 개인 저장소로 이관
   - GitHub Pages 등으로 온라인 공개

---

## 기술 스택

| 구분 | 기술 | 선택 이유 |
|------|------|----------|
| **Frontend** | Vue 3 + Vite 7 | 학습 곡선 낮음, 직관적 |
| **CSS** | Tailwind CSS v4 | 빠른 UI 구성, Vite 플러그인 방식 |
| **Data** | 정적 JSON 파일 | 백엔드 불필요, 심플한 구조 |
| **Build** | Vite 7 | 빠른 빌드, HMR 지원 |

### 프로젝트 구조

```
portfolio/
├── frontend/              # Vue 3 프로젝트
│   ├── public/
│   │   └── data/          # 정적 JSON 데이터
│   │       ├── profile.json
│   │       ├── projects.json
│   │       └── achievements.json
│   ├── src/
│   │   ├── views/         # 6개 페이지 컴포넌트
│   │   ├── components/    # 재사용 컴포넌트 (4개)
│   │   └── api/           # fetch 기반 데이터 로딩 (4개)
│   └── package.json
│
├── jira_analysis.md       # 지라 티켓 분석 결과
├── jira_tickets_all.csv   # 지라 티켓 원본 (1,384건)
└── API_설계검토_v2.md      # 요구사항 및 진행상황
```

---

## 웹사이트 구성 (페이지)

### 1. 메인 페이지 (Home)
- 히어로 섹션 (이름, 직함, 요약, CTA 버튼)
- 핵심 기술 스택 배지
- 주요 프로젝트 카드 목록

### 2. 프로필 페이지 (About)
- 2-column 그리드 레이아웃
- 좌측: 경력, 학력
- 우측: 자기소개, 기술 스택

### 3. 프로젝트 목록 페이지 (Projects)
- 프로젝트 카드 (hover 시 blue border + shadow + "View details" 애니메이션)
- 기간, 역할, 기술 스택 배지

### 4. 프로젝트 상세 페이지 (Project Detail)
- 프로젝트 기본 정보 (기간/역할/팀규모 + 기술 스택)
- 2-column 그리드: 주요 기여(파랑) / 기술적 도전(주황)
- 성과 섹션(초록)
- 관련 성과(Achievement) 카드 목록

### 5. 성과/경험 페이지 (Achievements)
- Problem(빨강) → Solution(파랑) → Result(초록) 패턴
- 컬러 좌측 바 + 정량 지표 배지

### 6. 연락처 페이지 (Contact)
- 연락처 정보 카드

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
- `/Users/ad1116/IdeaProjects/ec-oms-internal-api/성과보고서_송민호_25FW.md`
- 정량 지표 추출: CS 67% 감소, 출고후취소 95% 감소 등

### 3. 로컬 프로젝트 커밋 기록 (Phase 6)
- ec-oms-internal-api
- ec-oms-batch-app-v2
- 기타 프로젝트

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
| Phase 7: 추가 기능 | ⬜ 대기 | |

---

## Phase별 상세 작업 내용

### Phase 1: 프로젝트 셋업 ✅ 완료

- [x] 디렉토리 생성 + `git init`
- [x] Vue 3 + Vite 7 + Tailwind CSS v4 프론트엔드
- [x] vue-router (6개 라우트) 설치
- [x] 프론트엔드 빌드 확인

---

### Phase 2: 정적 JSON 데이터 구성 ✅ 완료

- [x] `public/data/profile.json` — 프로필 정보
- [x] `public/data/projects.json` — 프로젝트 목록
- [x] `public/data/achievements.json` — 성과 목록
- [x] fetch 기반 데이터 로딩 모듈 (`src/api/`)

---

### Phase 3: 프론트엔드 페이지 개발 ✅ 완료

- [x] 데이터 로딩 모듈: `src/api/` (index, profile, project, achievement)
- [x] 6개 페이지 (Home, About, Projects, ProjectDetail, Achievements, Contact)
- [x] 공통 컴포넌트: ProjectCard, AchievementCard, SkillBadge, MarkdownContent
- [x] 모든 페이지에서 JSON 데이터 로딩 완료
- [x] 네비게이션 (App.vue에 내장)

---

### Phase 4: 콘텐츠 입력 ✅ 완료

- [x] 지라 ECOMS 프로젝트 전체 티켓 수집 (1,384건)
- [x] 7개 카테고리 분류 (클레임, 주문, 출고/배송, 상품/재고, 정산/매출, 외부연동, 시스템/인프라)
- [x] 11개 Achievement 선별 및 JSON 데이터 반영
- [x] 성과보고서 정량 데이터 반영 (CS 67% 감소, 출고후취소 95% 감소 등)
- [x] 프로필 정보 보강 (경력, 기술 스택, 요약에 정량 지표 포함)
---

### Phase 5: 스타일링 ✅ 완료

- [x] App.vue: sticky nav + backdrop blur, 활성 링크 하이라이트, 모바일 햄버거 메뉴, 푸터
- [x] Home.vue: 히어로 섹션 (Backend Engineer 배지, CTA 버튼), 섹션별 아이콘 헤더
- [x] About.vue: 카드 기반 2-column 그리드 레이아웃
- [x] Projects.vue: 페이지 설명 추가
- [x] ProjectDetail.vue: 카드 기반 섹션, 색상 아이콘 (기여=파랑, 도전=주황, 성과=초록)
- [x] Achievements.vue: 페이지 설명 추가
- [x] Contact.vue: 카드 스타일 통일
- [x] ProjectCard.vue: hover border + shadow + "View details" 애니메이션
- [x] AchievementCard.vue: PSR 컬러 좌측 바, metrics 차트 아이콘 배지
- [x] SkillBadge.vue: 회색 톤 중립 스타일
- [x] 반응형 디자인 (모바일 햄버거 메뉴, grid 반응형)

---

### Phase 6: 백엔드 제거 → 정적 사이트 전환 ✅ 완료

- [x] Spring Boot 백엔드 제거
- [x] H2 DB → 정적 JSON 파일로 데이터 이관
- [x] axios → fetch 기반으로 API 모듈 변경
- [x] 백엔드 없이 프론트엔드만으로 동작 확인

---

## 남은 작업

### Phase 7: 추가 기능 (나중에)
- [ ] 개인 GitHub 레포 생성 및 푸시
- [ ] GitHub Pages 배포
- [ ] Git 커밋 로그 분석 → 자동 콘텐츠 생성
- [ ] 다크모드 (선택)
- [ ] (선택) React로 프론트엔드 포팅

---

## 의사결정 기록

| 날짜 | 결정 사항 | 이유 |
|------|----------|------|
| 2026-02-02 | React 대신 Vue 선택 | 학습 곡선 낮음, 나중에 React 포팅 가능 |
| 2026-03-06 | Tailwind CSS v4 + Vite 플러그인 | postcss 설정 불필요 |
| 2026-03-06 | 지라 티켓 기반 콘텐츠 수집 | 1,384건 → 11개 Achievement 선별 |
| 2026-03-12 | 백엔드 제거, 정적 사이트 전환 | 배포 단순화, GitHub Pages 호환 |

---

## 다른 세션에서 이어서 작업할 때

```
포트폴리오 웹사이트 개발을 이어서 해줘.
요구사항 문서: /Users/ad1116/IdeaProjects/portfolio/API_설계검토_v2.md

현재 진행 상태: Phase 6까지 완료 (정적 사이트 전환 완료, Phase 7 대기중)

프로젝트 위치: ~/IdeaProjects/portfolio/
- 프론트: cd frontend && npm run dev (http://localhost:5173)
```

---

*마지막 업데이트: 2026-03-13*
