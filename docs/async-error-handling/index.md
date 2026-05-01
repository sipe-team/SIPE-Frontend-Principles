# 비동기 처리와 에러 핸들링 (Async & Error Handling)

선언적 프로그래밍으로 비동기 상태와 에러를 체계적으로 관리합니다.

## 지침 목록

- [선언적 비동기 처리 기본 원칙](./declarative-async-basics): Suspense, ErrorBoundary, AsyncBoundary를 활용해 로딩/에러 상태를 컴포넌트 외부로 위임하고 Happy Path 중심으로 UI를 구성합니다.
- [Boundary 설계와 실패 격리 전략](./boundary-design): 도메인 경계를 기준으로 Boundary를 배치해 Partial Failure를 허용하고, 결합도가 높은 화면은 하나의 경계로 묶어 일관된 UX를 유지합니다.
- [다중 쿼리 성능 최적화](./suspense-query-concurrency): Suspense 환경의 Waterfall을 방지하고, 병렬 요청 전략과 부분 실패 대응 방법을 다룹니다.
- [에러 대응 및 복구 전략](./error-handling-strategy): 에러 성격에 따라 Global/Local 처리를 분리하고, 선언적 Retry 패턴으로 사용자 복구 경험을 제공합니다.
