# 🃏 Blackjack Game

완전한 기능을 갖춘 웹 기반 블랙잭 게임입니다. React, TypeScript, Tailwind CSS로 구현되었습니다.

## ✨ 주요 기능

- **완전한 블랙잭 룰**: Hit, Stand, Double Down, Split, Surrender, Insurance
- **실시간 게임 진행**: 애니메이션과 사운드 효과
- **키보드 조작**: 마우스 없이도 게임 플레이 가능
- **스플릿 게임**: 동일한 카드 쌍으로 핸드 분할
- **Insurance**: 딜러 Ace 카드 시 보험 베팅
- **배경 음악**: 카지노 분위기의 BGM과 효과음
- **반응형 디자인**: 모바일과 데스크톱 모두 지원

## 🎮 게임 규칙

- **목표**: 21을 넘지 않으면서 딜러보다 높은 점수 만들기
- **카드 값**: A(1 또는 11), J/Q/K(10), 숫자 카드(액면가)
- **최소 베팅**: $10
- **블랙잭**: 첫 두 장으로 21 (A + 10점 카드)
- **버스트**: 21 초과 시 즉시 패배

## 🎯 게임 액션

- **HIT**: 카드 한 장 더 받기
- **STAND**: 현재 점수로 멈추기
- **DOUBLE**: 베팅 2배, 카드 1장만 더 받기
- **SPLIT**: 같은 카드 쌍을 두 핸드로 분할
- **SURRENDER**: 베팅 절반 포기하고 게임 종료
- **INSURANCE**: 딜러 블랙잭에 대한 보험 베팅

## ⌨️ 키보드 단축키

- **Enter**: Hit / 이전 베팅으로 게임 시작 / 계속하기
- **Space**: Stand
- **D**: Double Down
- **S**: Split
- **Tab**: 스플릿 시 핸드 전환

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

## 🛠 기술 스택

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, Bootstrap
- **Build Tool**: Vite
- **Assets**: SVG 카드 이미지, 카지노 칩, 오디오 파일

## 📁 프로젝트 구조

```
src/
├── components/     # React 컴포넌트
├── hooks/         # 커스텀 훅
├── types/         # TypeScript 타입 정의
├── utils/         # 유틸리티 함수
├── assets/        # 이미지, 오디오 파일
└── App.tsx        # 메인 앱 컴포넌트
```

## 🎨 특징

- **카지노 테이블 디자인**: 실제 카지노 느낌의 녹색 펠트 테이블
- **카드 애니메이션**: 부드러운 카드 딜링 효과
- **칩 베팅 시스템**: 다양한 액면가의 카지노 칩
- **사운드 시스템**: 카드, 칩, 승부 효과음
- **게임 상태 표시**: 실시간 점수, 베팅 금액, 게임 진행 상황

## 📱 반응형 지원

- 데스크톱, 태블릿, 모바일 모든 기기에서 최적화된 경험
- 터치 인터페이스와 키보드 조작 모두 지원

---

**즐거운 게임 되세요! 🎰**
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
