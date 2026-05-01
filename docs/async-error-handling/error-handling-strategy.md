# 에러 대응 및 복구 전략

에러가 발생했을 때 모든 에러를 동일하게 처리하면 사용자 경험이 어색해진다. 에러의 성격에 따라 전역(Global)과 지역(Local) 처리를 분리하고, 사용자가 직접 복구할 수 있는 Retry 경험을 선언적으로 제공한다.

## 규칙: 에러 성격에 따라 Global과 Local 처리를 분리하세요

모든 에러를 ErrorBoundary로 던지는 것이 정답은 아니다. 401(인증 에러)처럼 화면 전환이 필요한 에러는 전역 Interceptor에서 처리하고, 500번대 서버 에러나 도메인 에러처럼 해당 영역에 에러 UI를 노출해야 하는 경우만 ErrorBoundary로 위임한다.

:::tabs
== Bad

```tsx
// 모든 에러를 무조건 ErrorBoundary로 던진다
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: true,
    },
  },
});
```

== Good

```tsx
// 전역 Interceptor에서 인증/권한 에러를 처리한다
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      // 로그인 페이지로 이동하거나 토큰 갱신 로직 실행
      redirectToLogin();
    }
    return Promise.reject(error);
  },
);

// throwOnError에서 인증/권한 에러는 Boundary로 넘기지 않는다
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: (error) => {
        if (isAxiosError(error) && error.response?.status === 401) {
          return false; // Interceptor에서 이미 처리됨
        }
        return true; // 나머지 에러는 지역 Boundary로 위임
      },
    },
  },
});
```

:::

`throwOnError`에 함수를 넘겨 **`false`**를 반환하면 해당 에러는 throw되지 않고 `query.state.status === 'error'`로 남습니다. 보통의 경우, 인증 처리 후 UI가 정체되지 않도록 **invalidate/retry/redirect 플래그** 등 후속 처리가 필요하다.

## 규칙: 선언적 Retry 패턴으로 사용자 복구 경험을 제공하세요

일시적인 네트워크 오류가 발생했을 때, 새로고침 없이 해당 영역만 다시 요청할 수 있는 경험을 제공해야 한다. `QueryErrorResetBoundary`와 `ErrorBoundary`를 결합하면 실패한 쿼리만 재시도하는 선언적 Retry 패턴을 구성할 수 있다.

:::tabs
== Bad

```tsx
// 새로고침 외에는 에러 상태에서 벗어날 방법이 없다
function ErrorFallback({ error }: { error: Error }) {
  return <div>문제가 발생했습니다: {error.message}</div>;
}
```

== Good

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

// QueryErrorResetBoundary로 실패한 쿼리 캐시를 초기화하고 재요청
function RetryableBoundary({
  children,
  resetKeys,
}: {
  children: ReactNode;
  resetKeys?: unknown[];
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          resetKeys={resetKeys}
          fallbackRender={({ resetErrorBoundary, error }) => (
            <ErrorFallback error={error} onRetry={resetErrorBoundary} />
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

:::

## 규칙: 에러 메시지는 사용자 관점에서 작성하세요

에러 UI에 기술적인 메시지를 그대로 노출하면 사용자는 무엇을 해야 할지 알 수 없다. 에러 성격에 따라 사용자가 이해할 수 있는 메시지와 다음 행동(Retry, 홈으로 이동 등)을 함께 제공해야 한다. **에러 분류·문구 선택·로깅 같은 “정책” 함수는 테스트하기 쉬운 순수 함수로 분리**하고, 컴포넌트에서는 그 결과만 받아 레이아웃을 렌더하는 것이 좋다. (아래 예시처럼 `ErrorFallback`이 `classifyError`를 호출하는 형태여도 무관함)

:::tabs
== Bad

```tsx
// 기술적인 에러 정보를 그대로 노출하고, 분기 로직이 컴포넌트에 혼재된다
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const isNetworkError = isAxiosError(error) && !error.response;
  const isServerError = isAxiosError(error) && (error.response?.status ?? 0) >= 500;

  if (isNetworkError) { ... }
  if (isServerError) { ... }
  return <div>{error.message}</div>;
}
```

== Good

```tsx
// 에러 분류 로직을 외부로 분리한다
type ErrorType = 'network' | 'server' | 'unknown';

function classifyError(error: unknown): ErrorType {
  if (isAxiosError(error) && !error.response) return 'network';
  if (isAxiosError(error) && (error.response?.status ?? 0) >= 500) return 'server';
  return 'unknown';
}

const ERROR_MESSAGES: Record<ErrorType, string> = {
  network: '네트워크 연결을 확인해 주세요.',
  server: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  unknown: '요청을 처리할 수 없습니다.',
};

// ErrorFallback은 메시지·액션 UI에 집중하고, 분류는 classifyError에 위임한다
function ErrorFallback({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const errorType = classifyError(error);
  const message = ERROR_MESSAGES[errorType];

  return (
    <div>
      {message}
      {onRetry && errorType !== 'unknown' && <button onClick={onRetry}>다시 시도</button>}
      {errorType === 'unknown' && <a href="/">홈으로 이동</a>}
    </div>
  );
}
```

:::

## 규칙: 에러 경계 초기화 시점을 resetKeys로 명시적으로 제어하세요

ErrorBoundary는 한 번 에러를 잡으면 상태가 고정되므로, 필터·검색어·페이지네이션 등 의미 있는 입력이 바뀌었을 때는 이전 에러를 초기화해야 한다.

`react-error-boundary`의 `resetKeys` 비교는 참조 동등성이 아니라 “이전 값과 달라졌는지(얕은 비교)”를 본다. 따라서 **매 렌더마다 새 배열 참조가 만들어지는 값**은 `resetKeys`로 쓰지 않도록 하고, `resetKeys`에는 **안정적인 원시 키**나, 같은 의미 단위 내에서 참조가 안정화된 객체를 넘기도록 한다.

:::tabs
== Bad

```tsx
// 필터가 바뀌어도 이전 에러 상태가 그대로 남아있다
function ProductList({ category }: { category: string }) {
  return (
    <RetryableBoundary>
      <Products category={category} />
    </RetryableBoundary>
  );
}
```

== Good

```tsx
// 의미 단위 식별자(원시값)를 넘겨 입력이 바뀔 때만 ErrorBoundary가 리셋되게 한다
function ProductList({ category }: { category: string }) {
  return (
    <RetryableBoundary resetKeys={[category]}>
      <Products category={category} />
    </RetryableBoundary>
  );
}

// queryKey 변경과 동일한 순간만 리셋하려면 원시 문자열화를 검토할 수 있다
// resetKeys={[JSON.stringify(productsQueryOptions(category).queryKey)]}
```

:::

## 빠른 참조

| 코드 냄새                                                 | 개선 방법                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 모든 에러를 `throwOnError: true`로 Boundary에 위임        | `throwOnError`에 조건 함수를 사용해 에러 성격별로 처리 전략을 분리             |
| 401 인증 에러가 ErrorBoundary로 넘어가 에러 화면이 노출됨 | 인증/권한 에러는 전역 Interceptor에서 처리하고 Boundary로 위임하지 않음        |
| 에러 발생 후 새로고침 없이는 복구할 방법이 없음           | `QueryErrorResetBoundary` + `ErrorBoundary`로 선언적 Retry 패턴 구성           |
| 에러 분기 로직이 ErrorFallback 컴포넌트에 혼재됨          | 정책(분류·문구)은 순수 함수로 분리하고 ErrorFallback은 메시지·액션 UI에 집중   |
| 상태 변경 후에도 이전 에러가 ErrorBoundary에 잔존         | `resetKeys`에 `category` 등 안정 원시 키를 넘기고, 매 렌더 새 배열 참조는 피함 |

## 참고 자료

- [TanStack Query - QueryErrorResetBoundary](https://tanstack.com/query/latest/docs/framework/react/reference/QueryErrorResetBoundary)
- [react-error-boundary](https://github.com/bvaughn/react-error-boundary)
