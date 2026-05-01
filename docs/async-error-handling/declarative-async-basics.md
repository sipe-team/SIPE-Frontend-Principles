# 선언적 비동기 처리 기본 원칙

UI 컴포넌트는 로딩/에러 분기까지 모두 떠안기보다, "성공적으로 데이터를 받은 상태(Happy Path)"를 표현하는 데 집중해야 한다. 비동기 상태 관리는 `Suspense`, `ErrorBoundary`, `AsyncBoundary`등을 사용하여 컴포넌트 외부(상위)로 위임한다.

## 규칙: 비동기 상태 처리는 상위 경계에서 담당하세요

`isLoading`, `isError`, `data?` 같은 방어 코드가 컴포넌트 내부에 많아질수록 UI 의도가 흐려진다. 데이터가 필요한 컴포넌트는 "데이터가 준비되었다"는 전제 위에서 렌더링되도록 설계한다. 이때 하위 UI 컴포넌트는 `User | undefined` 같은 모호한 타입보다 `User`처럼 non-null 계약을 사용해 Happy Path를 명확히 드러낸다.

:::tabs
== Bad

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  // UI 내부에 비동기 상태 분기 로직이 혼재되어 있다
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{data?.name}</div>;
}
```

== Good

```tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSuspenseQuery } from '@tanstack/react-query';

function UserProfile({ userId }: { userId: string }) {
  // data 존재가 보장되어 Happy Path에만 집중할 수 있다
  const { data } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  return <div>{data.name}</div>;
}

function UserProfileWrapper({ userId }: { userId: string }) {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <ErrorMessage error={error} />}>
      <Suspense fallback={<LoadingSpinner />}>
        <UserProfile userId={userId} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

:::

## 규칙: `useQuery`의 에러는 자동으로 ErrorBoundary에 전달되지 않아요

`useQuery`를 쓰면서 ErrorBoundary를 함께 배치했을 때 에러가 잡히지 않는 경우가 있다. TanStack Query는 기본적으로 에러를 ErrorBoundary로 전파하지 않고 `error` 상태로만 반환한다. ErrorBoundary로 위임하려면 `throwOnError: true`를 명시해야 한다. 단, 이 케이스는 `useSuspenseQuery`로 전환할 수 있다면 그쪽이 더 일관된 선택이다.

:::tabs
== Bad

```tsx
// ErrorBoundary를 배치했지만 에러가 잡히지 않는다
<ErrorBoundary fallbackRender={...}>
  <UserProfile userId={userId} />
</ErrorBoundary>

function UserProfile({ userId }: { userId: string }) {
  const { data, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    // throwOnError가 없으면 에러는 error 변수에만 담기고 Boundary로 전파되지 않는다
  });
  ...
}
```

== Good

```tsx
// throwOnError: true로 ErrorBoundary에 위임
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  throwOnError: true,
});

// 또는 useSuspenseQuery로 전환
const { data } = useSuspenseQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});
```

:::

## 규칙: `useSuspenseQuery`를 적용하기 어려운 케이스는 명시적 처리를 유지하세요

선언적 패턴을 무리하게 적용하려다 오히려 코드가 복잡해지는 경우가 있다. 아래 케이스는 `useSuspenseQuery` 대신 `useQuery`의 명시적 상태를 그대로 쓰는 게 자연스럽다:

- **조건부 실행 쿼리**: `enabled: !!userId`처럼 특정 조건이 충족될 때만 실행되는 쿼리. `useSuspenseQuery`는 `enabled: false`를 지원하지 않는다.
- **사용자 인터랙션 후 실행되는 쿼리**: 검색어 입력 후 실행되는 쿼리처럼, 초기에는 결과가 없는 게 정상인 케이스.

:::tabs
== Bad

```tsx
// enabled를 우회하려고 억지로 Suspense 패턴에 끼워 맞춤
function UserDetail({ userId }: { userId?: string }) {
  const { data } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => {
      if (!userId) throw new Error('no userId'); // ❌ 억지로 에러를 던져 Boundary에 위임
      return fetchUser(userId);
    },
  });
  ...
}
```

== Good

```tsx
// 조건부 쿼리는 useQuery + 명시적 분기가 더 명확하다
function UserDetail({ userId }: { userId?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId!),
    enabled: !!userId,
  });

  if (!userId || isLoading) return null;
  return <div>{data?.name}</div>;
}
```

:::

## 규칙: 반복되는 Boundary 중첩은 AsyncBoundary로 통합하세요

기본 원리를 이해한 뒤에는 반복되는 중첩을 추상화해 가독성을 높인다. 로딩과 에러 처리가 항상 같이 움직이는 구간은 두 경계를 감싸는 `AsyncBoundary` 컴포넌트로 묶어 보일러플레이트를 줄인다.

:::tabs
== Bad

```tsx
// 화면마다 같은 중첩 패턴이 반복된다
function OrderPage() {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <ErrorFallback error={error} />}>
      <Suspense fallback={<LoadingSpinner />}>
        <OrderSummary />
      </Suspense>
    </ErrorBoundary>
  );
}

function ProfilePage() {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <ErrorFallback error={error} />}>
      <Suspense fallback={<LoadingSpinner />}>
        <UserProfile />
      </Suspense>
    </ErrorBoundary>
  );
}

function DashboardPage() {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <ErrorFallback error={error} />}>
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardWidgets />
      </Suspense>
    </ErrorBoundary>
  );
}
```

== Good

```tsx
import { Suspense, ReactNode } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

interface AsyncBoundaryProps {
  pendingFallback: ReactNode;
  rejectedFallback: (props: FallbackProps) => ReactNode;
  children: ReactNode;
}

function AsyncBoundary({ pendingFallback, rejectedFallback, children }: AsyncBoundaryProps) {
  return (
    <ErrorBoundary fallbackRender={rejectedFallback}>
      <Suspense fallback={pendingFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// 로딩/에러 정책을 하나의 선언으로 표현한다
function OrderPage() {
  return (
    <AsyncBoundary
      pendingFallback={<LoadingSpinner />}
      rejectedFallback={({ error }) => <ErrorFallback error={error} />}
    >
      <OrderSummary />
    </AsyncBoundary>
  );
}
```

:::

## 규칙: Mutation 에러는 경계(Boundary)가 아닌 호출부에서 직접 처리하세요

Mutation 에러는 Query 에러와 성격이 다르다. Query 에러는 해당 UI 영역 전체를 대체 UI로 교체해도 자연스럽지만, Mutation 에러는 폼이 살아있어야 하고 사용자가 즉시 수정 후 재시도할 수 있어야 한다. Boundary에 던지면 폼 영역 전체가 날아가 사용자 입력이 초기화되는 UX 문제가 생긴다.

:::tabs
== Bad

```tsx
function SubmitButton({ orderId }: { orderId: string }) {
  const { mutate } = useMutation({
    mutationFn: submitOrder,
    onError: (error) => {
      throw error;
    }, // ❌ Boundary가 폼 전체를 날려버린다
  });
  return <button onClick={() => mutate(orderId)}>주문 제출</button>;
}
```

== Good

```tsx
function SubmitButton({ orderId }: { orderId: string }) {
  const { mutate, isError, error } = useMutation({
    mutationFn: submitOrder,
  });

  return (
    <>
      {isError && <InlineErrorMessage error={error} />} {/* 폼은 유지 */}
      <button onClick={() => mutate(orderId)}>주문 제출</button>
    </>
  );
}
```

:::

## 빠른 참조

| 코드 냄새                                              | 개선 방법                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| 컴포넌트마다 `isLoading`, `isError` 분기 반복          | `useSuspenseQuery` + 상위 `ErrorBoundary`/`Suspense`로 위임   |
| `user?: User` 같은 모호한 props 계약 사용              | 상위 경계에서 데이터 보장 후 UI 컴포넌트는 non-null 타입 사용 |
| `useQuery` 사용 중 ErrorBoundary에 에러가 잡히지 않음  | `throwOnError: true` 추가 또는 `useSuspenseQuery`로 전환      |
| `enabled` 조건을 `useSuspenseQuery`에 억지로 끼워 맞춤 | `useQuery` + 명시적 분기로 유지                               |
| 중첩된 Boundary 패턴이 화면마다 복붙됨                 | `AsyncBoundary`로 로딩/에러 정책을 단일 인터페이스로 통합     |
| Mutation `onError`에서 에러를 throw해 Boundary로 위임  | `isError` + 인라인 에러 메시지로 호출부에서 직접 처리         |

## 참고 자료

- [React 공식 문서 - Suspense](https://react.dev/reference/react/Suspense)
- [TanStack Query - Suspense](https://tanstack.com/query/latest/docs/framework/react/guides/suspense)
- [react-error-boundary](https://github.com/bvaughn/react-error-boundary)
