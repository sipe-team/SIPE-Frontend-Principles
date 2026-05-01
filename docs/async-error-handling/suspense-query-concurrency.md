# 다중 쿼리 성능 최적화

Suspense 환경에서 다중 쿼리를 다룰 때는 요청 시작 시점과 컴포넌트 배치가 성능을 결정한다. 핵심은 Waterfall을 만들지 않는 것이다.

## 규칙: Suspense 다중 쿼리 Waterfall은 "호출 위치" 기준으로 제거하세요

Suspense 환경의 Waterfall은 주로 두 패턴에서 발생한다.

- 패턴 A: 한 컴포넌트 안에서 독립 쿼리를 순차 호출
- 패턴 B: 부모-자식 렌더 순서로 자식 쿼리가 늦게 시작

두 경우 모두 해결 원칙은 같다. 독립 쿼리를 가능한 같은 시점에 시작하고, 하위 컴포넌트는 조회보다 렌더링에 집중시킨다.

### 패턴 A: same component waterfall

:::tabs
== Bad

```tsx
// 같은 컴포넌트 안에서 순차 호출되어 두 번째 요청 시작이 지연됨
function ReservationDetailData({ id }: { id: string }) {
  const { data: reservation } = useSuspenseQuery(reservationQueryOptions(id));
  const { data: rooms } = useSuspenseQuery(roomsQueryOptions());

  const roomName = rooms.find((room) => room.id === reservation.roomId)?.name ?? reservation.roomId;

  return <ReservationDetailView reservation={reservation} roomName={roomName} />;
}
```

== Good

```tsx
// SuspenseQueries: @suspensive/react-query-5에서 제공하는 컴포넌트형 유틸리티.
// TanStack Query의 useSuspenseQueries와 동일한 목적(병렬 시작)을 렌더-프롭 형태로 사용할 수 있다.

// 독립 쿼리를 동시에 시작해 Waterfall을 제거
function ReservationDetailData({ id }: { id: string }) {
  return (
    <SuspenseQueries queries={[reservationQueryOptions(id), roomsQueryOptions()]}>
      {([{ data: reservation }, { data: rooms }]) => {
        const roomName =
          rooms.find((room) => room.id === reservation.roomId)?.name ?? reservation.roomId;

        return <ReservationDetailView reservation={reservation} roomName={roomName} />;
      }}
    </SuspenseQueries>
  );
}
```

:::

### 패턴 B: parent-child waterfall

아래 예시는 두 쿼리가 **서로 독립적인 경우**다. 부모 쿼리 결과에 자식 쿼리가 의존하는 경우(예: 부모에서 받은 `userId`로 자식 쿼리를 시작해야 하는 경우)는 순차 실행이 구조적으로 불가피하며, 이는 Waterfall이 아닌 **의존성**이다. 이 경우에는 라우트 진입 시점에 미리 요청하는 prefetch 전략이나, `enabled` 옵션으로 선행 데이터가 준비된 시점에 쿼리를 시작하는 방식을 고려할 수 있다.

:::tabs
== Bad

```tsx
// 부모 렌더 후 자식이 마운트되며 자식 쿼리가 늦게 시작됨
function ProfilePage() {
  const { data: user } = useSuspenseQuery(userQueryOptions());

  return (
    <section>
      <UserSummary user={user} />
      <UserPosts />
    </section>
  );
}

function UserPosts() {
  const { data: posts } = useSuspenseQuery(userPostsQueryOptions());
  return <PostList posts={posts} />;
}
```

== Good

```tsx
// 상위에서 독립적인 두 쿼리를 함께 시작하고 자식에는 데이터만 전달
function ProfilePage() {
  const [{ data: user }, { data: posts }] = useSuspenseQueries({
    queries: [userQueryOptions(), userPostsQueryOptions()],
  });

  return (
    <section>
      <UserSummary user={user} />
      <UserPostsView posts={posts} />
    </section>
  );
}
```

:::

## 규칙: 병렬 쿼리 중 일부 실패를 허용해야 한다면 Boundary 분리 또는 useQueries를 선택하세요

`useSuspenseQueries`는 하나라도 실패하면 전체가 ErrorBoundary로 위임된다. 병렬 요청 중 일부 실패를 허용해야 하는 케이스라면 목적에 따라 두 가지 전략을 선택한다.

- **UI가 영역으로 분리 가능하다면** → 케이스 A: 각 영역을 컴포넌트로 분리하고 Boundary로 감싸 독립적으로 실패를 격리한다.
- **하나의 컴포넌트로 통합되어 있고 일부 데이터 없이도 렌더링이 가능하다면** → 케이스 B: `useQueries`로 각 쿼리 상태를 개별 핸들링한다. 단, 이 방식은 컴포넌트 내부에 상태 분기가 다시 생기는 트레이드오프가 있다. 선언적 패턴이 적용되는 일반적인 케이스가 아닌, 부분 실패 허용이 꼭 필요한 경우에만 선택한다.

### 케이스 A: 실패한 영역만 에러 UI로 교체하고 나머지는 정상 노출

쿼리를 컴포넌트로 분리하고 각자 Boundary로 감싸면, 하나가 실패해도 나머지 영역은 영향을 받지 않는다.

:::tabs
== Bad

```tsx
// useSuspenseQueries로 묶으면 recommendations 하나의 실패가 전체를 날린다
function DashboardPage() {
  const [{ data: user }, { data: recommendations }] = useSuspenseQueries({
    queries: [userQueryOptions(), recommendationsQueryOptions()],
  });

  return (
    <div>
      <UserSummary user={user} />
      <Recommendations items={recommendations} />
    </div>
  );
}
```

== Good

```tsx
// 컴포넌트를 분리하고 각자 Boundary로 감싸 독립적으로 실패를 격리
function DashboardPage() {
  return (
    <div>
      <AsyncBoundary rejectedFallback={<MainError />}>
        <UserSummary />
      </AsyncBoundary>
      <AsyncBoundary rejectedFallback={<SmallRetryButton />}>
        <Recommendations />
      </AsyncBoundary>
    </div>
  );
}
```

:::

### 케이스 B: 성공한 데이터는 그대로 쓰고 실패한 쿼리만 개별 핸들링

UI가 하나의 컴포넌트에 통합되어 있고 일부 데이터가 없어도 렌더링이 가능한 경우라면, `useQueries`로 각 쿼리의 상태를 개별적으로 핸들링한다. 이 방식은 컴포넌트 내부에 상태 분기가 다시 생기므로, 부분 실패 허용이 꼭 필요한 경우에만 선택한다.

:::tabs
== Bad

```tsx
// useSuspenseQueries는 하나가 실패하면 전체가 ErrorBoundary로 빠진다
function DashboardView() {
  const [{ data: stats }, { data: recentActivity }] = useSuspenseQueries({
    queries: [statsQueryOptions(), recentActivityQueryOptions()],
  });

  return <Dashboard stats={stats} recentActivity={recentActivity} />;
}
```

== Good

```tsx
// useQueries로 각 쿼리 상태를 개별 핸들링해 성공한 데이터는 그대로 활용
// 선언적 패턴의 예외 케이스로, 부분 실패 허용이 필요할 때만 선택한다
function DashboardView() {
  const [statsQuery, recentActivityQuery] = useQueries({
    queries: [statsQueryOptions(), recentActivityQueryOptions()],
  });

  return (
    <Dashboard
      stats={statsQuery.data}
      statsError={statsQuery.error}
      recentActivity={recentActivityQuery.data}
      recentActivityError={recentActivityQuery.error}
    />
  );
}
```

:::

## 빠른 참조

| 코드 냄새                                                            | 개선 방법                                                                      |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 독립 쿼리를 `useSuspenseQuery`로 순차 호출                           | `SuspenseQueries` 또는 `useSuspenseQueries`로 병렬 시작                        |
| 부모/자식에서 독립 쿼리가 순차 실행되어 지연 발생                    | 상위에서 쿼리를 함께 시작하고 자식에는 데이터 전달                             |
| 부모 쿼리 결과에 의존하는 자식 쿼리의 순차 실행을 Waterfall로 오해   | 의존성 있는 순차 실행은 불가피하며, prefetch 또는 `enabled` 활용을 고려        |
| `useSuspenseQueries` 사용 중 일부 실패로 전체가 에러 화면으로 전환됨 | 영역 분리 가능하면 Boundary 분리, 통합 컴포넌트라면 `useQueries`로 개별 핸들링 |

## 참고 자료

- [TanStack Query - Suspense](https://tanstack.com/query/latest/docs/framework/react/guides/suspense)
- [TanStack Query - useSuspenseQueries](https://tanstack.com/query/latest/docs/framework/react/reference/useSuspenseQueries)
