# Boundary 설계와 실패 격리 전략

도메인 경계를 기준으로 Boundary를 배치해 한쪽의 실패가 다른 영역을 방해하지 않도록 에러 전파를 차단한다. 단, 비즈니스 로직상 함께 노출되어야 하는 데이터는 하나의 경계로 묶어 일관된 UX를 유지한다.

## 규칙: 독립적인 영역은 Boundary를 분리해 부분 실패를 허용하세요

페이지 최상단에만 단일 Boundary를 두면, 부가적인 영역 하나의 실패가 전체 화면을 망가뜨린다. 필수 데이터와 부가 데이터의 경계를 나누어 한쪽의 실패가 다른 정상적인 영역의 렌더링을 방해하지 않도록 격리한다.

:::tabs
== Bad

```tsx
// 추천 목록 하나만 API 에러가 나도 페이지 전체가 작동 불능
function DashboardPage() {
  return (
    <AsyncBoundary loadingFallback={<PageSkeleton />} errorFallback={<PageError />}>
      <UserProfile />
      <MainContent />
      <Recommendations /> {/* 👈 일부 기능의 장애가 전체 경험을 파괴함 */}
    </AsyncBoundary>
  );
}
```

== Good

```tsx
// 독립적인 도메인 단위로 Boundary를 분리해 가용성을 극대화
function DashboardPage() {
  return (
    <Layout>
      {/* 필수 데이터: 실패 시 메인 에러 화면 노출 */}
      <AsyncBoundary loadingFallback={<MainSectionSkeleton />} errorFallback={<MainError />}>
        <UserProfile />
        <MainContent />
      </AsyncBoundary>
      {/* 부가 데이터: 실패해도 나머지 기능은 사용 가능하도록 격리 */}
      <AsyncBoundary
        loadingFallback={<RecommendationsSkeleton />}
        errorFallback={<SmallRetryButton />}
      >
        <Recommendations />
      </AsyncBoundary>
    </Layout>
  );
}
```

:::

## 규칙: 의미 단위(결합도/과업) 기준으로 Boundary를 묶어 파편화를 막으세요

반대로, 서로 강하게 연관된 데이터이거나, 사용자가 하나의 과업을 완료하기 위해 함께 필요한 정보라면 하나의 Boundary로 묶는다.  
개별 Boundary로 과도하게 분리하면 로딩/에러 UI가 파편화되어, 화면은 일부 보이더라도 실제 사용자 과업 흐름이 끊길 수 있다.

:::tabs
== Bad

```tsx
// 연관된 데이터인데 각자 따로 로딩/에러 처리가 되어 UI가 파편화됨
function ProductDetail() {
  return (
    <>
      <AsyncBoundary pendingFallback={<Skeleton />}>
        <ProductInfo />
      </AsyncBoundary>
      <AsyncBoundary pendingFallback={<Skeleton />}>
        <ProductPrice />
      </AsyncBoundary>
      <AsyncBoundary pendingFallback={<Skeleton />}>
        <ProductStock />
      </AsyncBoundary>
    </>
  );
}
```

== Good

```tsx
// 하나의 맥락으로 묶인 데이터는 하나의 Boundary에서 관리해 일관성 유지
function ProductDetail() {
  return (
    <AsyncBoundary pendingFallback={<ProductDetailSkeleton />}>
      {/* 과업에 필요한 모든 데이터가 준비된 뒤 일관된 화면을 한 번에 노출 */}
      <ProductInformationSection />
    </AsyncBoundary>
  );
}
```

:::

## 빠른 참조

| 코드 냄새                                                    | 개선 방법                                                        |
| ------------------------------------------------------------ | ---------------------------------------------------------------- |
| 페이지 최상단 단일 Boundary에 모든 컴포넌트를 넣음           | 필수/부가 데이터 기준으로 Boundary를 분리해 Partial Failure 허용 |
| 부가 데이터 하나의 에러로 전체 페이지가 에러 화면으로 전환됨 | 독립적인 영역은 별도 Boundary로 격리해 나머지 화면은 정상 유지   |
| 연관된 데이터를 각자 Boundary로 감싸 로딩/에러 UI가 파편화됨 | 과업 단위로 하나의 Boundary로 묶어 일관된 화면을 한 번에 노출    |

## 참고 자료

- [React 공식 문서 - Suspense](https://react.dev/reference/react/Suspense)
- [react-error-boundary](https://github.com/bvaughn/react-error-boundary)
