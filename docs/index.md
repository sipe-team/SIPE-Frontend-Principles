---
layout: home

hero:
  name: 'SIPE Frontend Principles'
  text: 'React 코드 작성 지침'
  tagline: SIPE 팀이 합의한 React 개발 원칙과 코드 컨벤션
  actions:
    - theme: brand
      text: 지침 살펴보기
      link: /component-design/
    - theme: alt
      text: GitHub
      link: https://github.com/sipe-team

features:
  - title: 컴포넌트 설계
    details: 단일 책임, Headless UI, Compound Components 등 확장 가능한 컴포넌트 설계
    link: /component-design/
  - title: 훅 설계
    details: 커스텀 훅 추출 기준, 합성 패턴, 책임 범위 설계
    link: /custom-hooks/
  - title: 상태 관리
    details: Local vs Global 판단, 서버 상태와 클라이언트 상태 분리
    link: /state-management/
  - title: 비동기/에러 핸들링
    details: Suspense, ErrorBoundary, AsyncBoundary를 활용한 선언적 처리
    link: /async-error-handling/
  - title: Props/인터페이스
    details: Props 설계 원칙, 합성 패턴, API 응답 매핑 전략
    link: /props-interface/
  - title: 아키텍처
    details: Feature-Sliced Design, Colocation, 의존성 규칙, 배럴 패턴
    link: /architecture/
---
