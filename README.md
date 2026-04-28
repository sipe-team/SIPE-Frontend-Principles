# SIPE Frontend Principles

> SIPE 5기 프론트엔드 개발자들이 함께 만들어가는 **React 코드 작성 지침서**입니다.
> 동작하는 코드를 넘어, **좋은 코드와 설계**를 위한 원칙들을 정리합니다.

## 소개

토스의 [Frontend Fundamentals](https://frontend-fundamentals.com/)에서 영감을 받아, 우리 팀이 개발하면서 지켜야 할 React 코드 작성 원칙을 문서화합니다.

매주 모의고사와 PR 리뷰를 통해 논의한 내용 중, 팀 전체가 합의한 원칙들을 이 문서에 반영합니다.

배포 링크: https://sipefrontendprinciples.vercel.app/

## 참여자

| 이름 | GitHub |
|------|--------|
| 오소현 | [@osohyun0224](https://github.com/osohyun0224) |
| 조연진 | [@Cyjin-jani](https://github.com/Cyjin-jani) |
| 조세민 | [@SEMIN-97](https://github.com/SEMIN-97) |
| 강창우 | [@monam2](https://github.com/monam2) |
| G-hoon | [@G-hoon](https://github.com/G-hoon) |
| 박진현 | [@developerjhp](https://github.com/developerjhp) |

## 문서 구조

| 토픽 | 내용 |
|------|------|
| **컴포넌트 설계** | 단일 책임, Headless UI, Compound Components 등 확장 가능한 컴포넌트 설계 |
| **훅 설계** | 커스텀 훅 추출 기준, 합성 패턴, 책임 범위 설계 |
| **상태 관리** | Local vs Global 판단, 서버 상태와 클라이언트 상태 분리 |
| **비동기/에러 핸들링** | Suspense, ErrorBoundary, AsyncBoundary를 활용한 선언적 처리 |
| **Props/인터페이스** | Props 설계 원칙, 합성 패턴, API 응답 매핑 전략 |
| **아키텍처** | Feature-Sliced Design, Colocation, 의존성 규칙, 배럴 패턴 |

## 로컬 실행

```bash
# 1. Clone
git clone https://github.com/sipe-team/SIPE-Frontend-Principles.git
cd SIPE-Frontend-Principles

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run docs:dev
```

## 기여 방법

### 브랜치 네이밍

```
docs/{토픽}/{주제}
```

| 예시 | 설명 |
|------|------|
| `docs/component-design/headless-ui` | Headless UI 패턴 지침 추가 |
| `docs/custom-hooks/extraction-criteria` | 훅 추출 기준 지침 추가 |
| `docs/state-management/server-state` | 서버 상태 관리 지침 추가 |

### 문서 작성 포맷

각 문서는 다음 형태를 따릅니다:

```markdown
# 지침 제목 (~하기)

지침의 배경 설명 (1-2문장)

## 규칙: ~하세요

:::tabs
== Bad
(나쁜 예시 코드)

== Good
(좋은 예시 코드)
:::
```

## PR 컨벤션

- **PR 제목**: `[토픽] 지침 제목`
- **브랜치명**: `docs/{토픽}/{주제}`
- **base 브랜치**: `main`
- PR 본문에 **해당 원칙을 추가하게 된 배경**과 **팀 논의 내용**을 포함해주세요

## 리뷰 규칙

1. **모든 참여자**가 새로운 지침 PR에 최소 1개 이상 리뷰를 남깁니다.
2. 리뷰는 **"이 원칙이 우리 팀에 적합한가"** 에 집중합니다.
3. 리뷰 코멘트에는 가능하면 **실제 코드 사례**나 **반례**를 포함해주세요.

## 기술 스택

- [VitePress](https://vitepress.dev/) — 문서 사이트 프레임워크
- [vitepress-plugin-tabs](https://github.com/sapphi-red/vitepress-plugin-tabs) — Bad/Good 코드 비교 탭
