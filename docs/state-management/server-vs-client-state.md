# 서버 상태와 클라이언트 상태를 분리하기

서버에서 가져온 데이터(서버 상태)와 UI 상태(클라이언트 상태)는 특성이 완전히 다르다. 서버 상태는 비동기적이고, 캐싱과 동기화가 필요하며, 소유권이 서버에 있다. 이를 같은 방식으로 관리하면 불필요한 복잡성이 생긴다.

| 특성 | 서버 상태 | 클라이언트 상태 |
|------|-----------|-----------------|
| 소유권 | 서버 (DB) | 클라이언트 (브라우저) |
| 동기화 | 필요 (stale 가능) | 불필요 |
| 지속성 | 서버에 영구 저장 | 세션/페이지 단위 |
| 예시 | 유저 정보, 상품 목록, 주문 내역 | 모달 열림, 폼 입력값, 탭 선택 |

## 서버 데이터를 전역 스토어에서 관리하지 않기

캐싱, 재시도, 백그라운드 리패치를 직접 구현하면 코드가 복잡해지고 버그가 생긴다. 서버 상태 라이브러리에 맡긴다.

:::tabs
== Before
```tsx
// 서버 데이터를 Zustand에서 수동 관리한다
const useProductStore = create((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.getProducts()
      set({ products: data, isLoading: false })
    } catch (error) {
      set({ error, isLoading: false })
    }
  },
  // 캐시 무효화, 재시도, 폴링... 이 모든 것을 직접 구현해야 한다
}))

function ProductList() {
  const { products, isLoading, fetchProducts } = useProductStore()

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  if (isLoading) return <Spinner />
  return <ul>{products.map(/* ... */)}</ul>
}
```

== After
```tsx
// React Query가 캐싱, 재시도, 백그라운드 리패치를 자동으로 처리한다
function useProducts(category?: string) {
  return useQuery({
    queryKey: ['products', { category }],
    queryFn: () => api.getProducts({ category }),
    staleTime: 5 * 60 * 1000,
  })
}

function ProductList({ category }: { category?: string }) {
  const { data: products, isLoading, error } = useProducts(category)

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage error={error} />

  return <ul>{products.map(/* ... */)}</ul>
}
```
:::

## 서버 상태와 클라이언트 상태를 같은 객체에 섞지 않기

하나의 상태 객체에 서버 데이터와 UI 상태가 섞이면, 서버 데이터 업데이트가 UI 상태까지 리렌더링을 유발한다.

:::tabs
== Before
```tsx
function OrderPage() {
  const [state, setState] = useState({
    // 서버 상태
    order: null,
    products: [],
    isLoading: false,

    // 클라이언트 상태
    selectedTab: 'details',
    isEditMode: false,
    expandedSections: [],
  })

  useEffect(() => {
    setState((prev) => ({ ...prev, isLoading: true }))
    fetchOrder(orderId).then((order) =>
      setState((prev) => ({ ...prev, order, isLoading: false }))
    )
  }, [orderId])
}
```

== After
```tsx
function OrderPage() {
  // 서버 상태: React Query에 위임
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId),
  })

  // 클라이언트 상태: 컴포넌트 로컬에서 관리
  const [selectedTab, setSelectedTab] = useState('details')
  const [isEditMode, setIsEditMode] = useState(false)

  if (isLoading) return <Spinner />

  return (
    <div>
      <Tabs value={selectedTab} onChange={setSelectedTab} />
      <OrderDetails order={order} isEditMode={isEditMode} />
    </div>
  )
}
```
:::

## 낙관적 업데이트로 사용자 경험 개선하기

서버 응답을 기다린 후에야 UI가 바뀌면 사용자는 느리다고 느낀다. 먼저 UI를 업데이트하고, 실패 시 롤백한다.

:::tabs
== Before
```tsx
// 서버 응답을 기다린 후에야 UI가 변경된다
function LikeButton({ postId, isLiked, likeCount }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    await api.toggleLike(postId)
    await refetchPosts()
    setLoading(false)
  }

  return (
    <button onClick={handleClick} disabled={loading}>
      {isLiked ? '♥' : '♡'} {likeCount}
    </button>
  )
}
```

== After
```tsx
// 클릭 즉시 UI를 반영하고, 실패 시 롤백한다
function LikeButton({ postId, isLiked, likeCount }) {
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: () => api.toggleLike(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] })
      const previous = queryClient.getQueryData(['post', postId])

      queryClient.setQueryData(['post', postId], (old) => ({
        ...old,
        isLiked: !old.isLiked,
        likeCount: old.isLiked ? old.likeCount - 1 : old.likeCount + 1,
      }))

      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['post', postId], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })

  return (
    <button onClick={() => mutate()}>
      {isLiked ? '♥' : '♡'} {likeCount}
    </button>
  )
}
```
:::

## queryKey를 체계적으로 관리하기

queryKey는 서버 상태의 캐시 식별자다. 일관된 구조로 관리해야 캐시 무효화가 쉬워진다.

:::tabs
== Before
```tsx
// queryKey가 파일마다 다른 형태로 흩어져 있다
useQuery({ queryKey: ['products'], ... })
useQuery({ queryKey: ['product-detail', id], ... })
useQuery({ queryKey: ['getProductReviews', productId], ... })
useQuery({ queryKey: ['products', 'list', category, page], ... })
```

== After
```tsx
// queryKey를 팩토리 패턴으로 중앙 관리한다
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  reviews: (id: string) =>
    [...productKeys.detail(id), 'reviews'] as const,
}

// 사용
useQuery({ queryKey: productKeys.list({ category: 'shoes' }), ... })
useQuery({ queryKey: productKeys.detail(id), ... })

// 캐시 무효화도 체계적으로 할 수 있다
queryClient.invalidateQueries({ queryKey: productKeys.all })
queryClient.invalidateQueries({ queryKey: productKeys.lists() })
queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
```
:::

## 빠른 참조

| 코드 냄새 | 개선 방법 |
|----------|----------|
| 전역 스토어에서 fetch + 로딩 관리 | React Query로 분리 |
| 서버 데이터와 UI 상태가 한 객체에 섞임 | 서버: useQuery, UI: useState |
| 클릭 후 로딩 → 반영이 느림 | 낙관적 업데이트 |
| queryKey 형태가 파일마다 다름 | 팩토리 패턴으로 중앙 관리 |

## 참고 자료

- [TanStack Query 공식 문서 - Overview](https://tanstack.com/query/latest/docs/framework/react/overview)
- [TanStack Query 공식 문서 - Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [TkDodo - Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)
- [TkDodo - React Query as a State Manager](https://tkdodo.eu/blog/react-query-as-a-state-manager)
