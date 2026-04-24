# 📐 SIPE Frontend Principles

> SIPE 5기 프론트엔드 개발자들이 함께 만들어가는 **코드 작성 지침서**입니다.
> 동작하는 코드를 넘어, **좋은 코드와 설계**를 위한 원칙들을 정리합니다.

## 📌 소개

토스의 [Frontend Fundamentals](https://frontend-fundamentals.com/)에서 영감을 받아, 우리 팀이 개발하면서 지켜야 할 프론트엔드 코드 작성 원칙을 문서화합니다.

매주 모의고사와 PR 리뷰를 통해 논의한 내용 중, 팀 전체가 합의한 원칙들을 이 문서에 반영합니다.

🔗 **문서 사이트**: 배포 후 URL 추가 예정

## 👥 참여자

| 이름 | GitHub |
|------|--------|
| 오소현 | [@osohyun0224](https://github.com/osohyun0224) |
| 조연진 | [@Cyjin-jani](https://github.com/Cyjin-jani) |
| 조세민 | [@SEMIN-97](https://github.com/SEMIN-97) |
| 강창우 | [@monam2](https://github.com/monam2) |
| G-hoon | [@G-hoon](https://github.com/G-hoon) |
| 박진현 | [@developerjhp](https://github.com/developerjhp) |

## 📂 문서 구조

| 카테고리 | 내용 |
|----------|------|
| **Code Quality** | 가독성, 예측 가능성 등 좋은 코드를 위한 작성 원칙 |
| **JavaScript** | JS 코드 작성 시 지켜야 할 규칙과 패턴 |
| **TypeScript** | 타입 시스템을 효과적으로 활용하기 위한 지침 |
| **React** | 컴포넌트 설계와 상태 관리에 대한 작성 규칙 |
| **Web** | 렌더링 성능, 리소스 최적화 등 웹 개발 지침 |

## 🔧 로컬 실행

```bash
# 1. Clone
git clone https://github.com/sipe-team/SIPE-Frontend-Principles.git
cd SIPE-Frontend-Principles

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run docs:dev
```

## 🌿 기여 방법

### 브랜치 네이밍

```
docs/{카테고리}/{주제}
```

| 예시 | 설명 |
|------|------|
| `docs/react/use-memo-guideline` | React useMemo 사용 지침 추가 |
| `docs/typescript/enum-vs-union` | TS enum vs union type 지침 추가 |
| `docs/code-quality/early-return` | early return 패턴 지침 추가 |

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

## 📝 PR 컨벤션

- **PR 제목**: `[카테고리] 지침 제목`
- **브랜치명**: `docs/{카테고리}/{주제}`
- **base 브랜치**: `main`
- PR 본문에 **해당 원칙을 추가하게 된 배경**과 **팀 논의 내용**을 포함해주세요

## 🤝 리뷰 규칙

1. **모든 참여자**가 새로운 지침 PR에 최소 1개 이상 리뷰를 남깁니다.
2. 리뷰는 **"이 원칙이 우리 팀에 적합한가"** 에 집중합니다.
3. 리뷰 코멘트에는 가능하면 **실제 코드 사례**나 **반례**를 포함해주세요.

## 🛠 기술 스택

- [VitePress](https://vitepress.dev/) — 문서 사이트 프레임워크
- [vitepress-plugin-tabs](https://github.com/sapphi-red/vitepress-plugin-tabs) — Bad/Good 코드 비교 탭
