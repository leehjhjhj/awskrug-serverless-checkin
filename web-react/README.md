# AWSKRUG 서버리스 출석체크 - React 버전

React와 React Router를 사용한 출석체크 웹 애플리케이션입니다.

## ✨ 주요 기능

- 🎯 **URL 기반 라우팅**: `/{groupCode}/{eventCode}` 형식으로 깔끔한 URL
- 🎨 **소모임별 맞춤 테마**: 설정 파일로 쉽게 관리
- 📱 **반응형 디자인**: 모바일/데스크톱 모두 지원
- ⚡ **빠른 성능**: Vite 빌드 시스템 사용

## 📁 프로젝트 구조

```
web-react/
├── public/
│   ├── favicon.png
│   └── images/
│       ├── logo.png         # 서버리스 소모임 로고
│       ├── ausg.png         # AUSG 로고
│       ├── cert.png         # 자격증 소모임 로고
│       └── welcome.png      # 환영 이미지
├── src/
│   ├── components/
│   │   └── CheckInForm.jsx  # 출석체크 폼 컴포넌트
│   ├── pages/
│   │   ├── CheckInPage.jsx  # 출석체크 페이지
│   │   └── ResultPage.jsx   # 결과 페이지
│   ├── config/
│   │   ├── api.js           # API 설정
│   │   └── groups.js        # 소모임 설정
│   ├── styles/
│   │   └── index.css        # 전역 스타일
│   ├── App.jsx              # 라우팅 설정
│   └── main.jsx             # 진입점
├── index.html
├── package.json
└── vite.config.js
```

## 🚀 시작하기

### 1. 패키지 설치

```bash
cd web-react
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속

### 3. 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

## 🎯 URL 구조

### 출석체크 페이지
- `/sls/{eventCode}` - 서버리스 소모임
- `/ausg/{eventCode}` - AUSG 빅챗
- `/cert/{eventCode}` - 자격증 소모임

예시:
- `https://awskrug-sls.com/sls/241224`
- `https://awskrug-sls.com/ausg/250101`
- `https://awskrug-sls.com/cert/250115`

### 결과 페이지
- `/{groupCode}/{eventCode}/result`

## 🔧 새 소모임 추가하기

`src/config/groups.js` 파일을 수정하세요:

```javascript
export const GROUP_CONFIGS = {
  // ... 기존 소모임들
  
  // 새 소모임 추가 (3줄만 추가하면 끝!)
  newgroup: {
    id: 'newgroup',
    name: '새로운 소모임',
    title: '새로운 소모임 출석체크',
    logo: '/images/newgroup.png',
    description: '출석체크를 위해 등록하신 핸드폰 번호를 입력해주세요!',
    subDescription: '제출하신 번호는 출석 체크 용도로만 사용됩니다.',
    theme: {
      primaryColor: '#E91E63',
      secondaryColor: '#C2185B',
      logoWidth: '220px',
      logoMargin: '0 0 2rem 0'
    },
    features: {
      showWelcomeImage: false
    }
  }
};
```

이미지 파일(`newgroup.png`)을 `public/images/` 폴더에 추가하면 완료!

## 🎨 테마 커스터마이징

각 소모임의 테마는 `groups.js`에서 설정:

- `primaryColor`: 버튼, 강조 색상
- `secondaryColor`: 호버 상태 색상
- `logoWidth`: 로고 크기
- `logoMargin`: 로고 여백

## 📦 배포 (AWS S3 + CloudFront)

### 1. 빌드

```bash
npm run build
```

### 2. S3 버킷에 업로드

```bash
aws s3 sync dist/ s3://your-bucket-name/ --delete
```

### 3. CloudFront 설정

**중요**: SPA 라우팅을 위해 CloudFront에서 설정 필요

#### CloudFront Error Pages 설정:
- Error Code: 404
- Response Page Path: `/index.html`
- Response Code: 200

또는 `template.yaml`에 추가:

```yaml
CustomErrorResponses:
  - ErrorCode: 404
    ResponseCode: 200
    ResponsePagePath: /index.html
```

이 설정이 없으면 `/sls/241224` 같은 경로로 직접 접속 시 404 에러가 발생합니다.

## 🆚 기존 버전과 비교

### 기존 (일반 JavaScript)
- ❌ 각 소모임마다 별도 폴더/파일 필요
- ❌ 코드 중복
- ❌ 유지보수 어려움
- URL: `?c=241224`

### 새 버전 (React)
- ✅ 단일 코드베이스
- ✅ 설정 파일로 관리
- ✅ 컴포넌트 재사용
- ✅ 깔끔한 URL: `/sls/241224`

## 🔐 환경 변수 (선택사항)

API URL을 환경 변수로 관리하려면:

1. `.env` 파일 생성:
```
VITE_API_URL=https://your-api-gateway.amazonaws.com/prod
```

2. `src/config/api.js` 수정:
```javascript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://ydklez0xah.execute-api.ap-northeast-2.amazonaws.com/prod',
  // ...
};
```

## 📝 개발 가이드

### 컴포넌트 수정
- `CheckInForm.jsx`: 폼 로직 및 API 호출
- `CheckInPage.jsx`: 출석체크 페이지 레이아웃
- `ResultPage.jsx`: 결과 페이지 레이아웃

### 스타일 수정
- `src/styles/index.css`: 전역 스타일
- CSS 변수 사용: `var(--primary-color)`, `var(--secondary-color)`

### API 수정
- `src/config/api.js`: API 엔드포인트 관리

## 🐛 트러블슈팅

### 404 에러 발생 시
- CloudFront Error Pages 설정 확인
- S3 버킷 정책 확인
- 빌드 파일이 올바르게 배포되었는지 확인

### 이미지가 표시되지 않을 때
- `public/images/` 폴더에 이미지 파일 존재 확인
- 파일명이 `groups.js` 설정과 일치하는지 확인
- 빌드 후 `dist/images/` 폴더에 이미지가 있는지 확인

## 📄 라이선스

MIT License

