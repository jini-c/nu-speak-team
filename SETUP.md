# nu:speak 프로젝트 설정 가이드

## 🚀 빠른 시작

### 1. 백엔드 설정
```bash
cd backend
npm install
npm start
```
백엔드 서버가 http://localhost:4001 에서 실행됩니다.

### 2. 프론트엔드 설정
```bash
cd frontend
npm install
npm run dev
```
프론트엔드가 http://localhost:3000 에서 실행됩니다.

## 📁 프로젝트 구조

```
nuspeak/
├── backend/                 # Express.js 백엔드
│   ├── app.js              # 메인 서버 파일
│   ├── routes/             # API 라우트
│   ├── services/           # 비즈니스 로직
│   └── package.json
├── frontend/               # Next.js 프론트엔드
│   ├── pages/              # 페이지 컴포넌트
│   ├── components/         # 재사용 컴포넌트
│   ├── styles/             # CSS 모듈
│   └── package.json
└── README.md
```

## 🎨 주요 기능

- **AI 맞춤 뉴스**: 네이버 뉴스 크롤링 + AI 요약
- **관심사 기반 추천**: 카테고리별 뉴스 필터링
- **모던 UI**: nu:speak 브랜드 디자인
- **반응형**: 모바일/태블릿/데스크톱 지원

## 🛠 기술 스택

- **Frontend**: React, Next.js, TypeScript, CSS Modules
- **Backend**: Node.js, Express.js, Axios, Cheerio
- **Styling**: 순수 CSS (Tailwind CSS 제거됨)

## 🔧 환경 설정

### 필수 요구사항
- Node.js 16+ 
- npm 또는 yarn

### 포트 설정
- Frontend: 3000
- Backend: 4001

## 📝 사용법

1. 백엔드와 프론트엔드를 모두 실행
2. http://localhost:3000 접속
3. "관심 카테고리 선택" 버튼 클릭
4. 원하는 뉴스 카테고리 선택
5. 맞춤 뉴스 확인!

## 🎯 nu:speak 브랜드 컬러

- **Primary**: #7ee7e7 (민트)
- **Background**: #22313a (다크)
- **Secondary**: #26323a (다크 그레이)
- **Text**: #ffffff (화이트)

---

**nu:speak - AI 맞춤형 뉴스 서비스** 🚀 