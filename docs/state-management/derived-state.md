# 파생 가능한 값을 상태로 만들지 않기

이미 존재하는 state나 props에서 계산할 수 있는 값을 별도의 상태로 만들면, 동기화 버그가 생긴다. 원본 데이터가 바뀌어도 파생 상태를 깜빡하고 업데이트하지 않으면 UI가 불일치한다.

## 계산 가능한 값은 렌더링 중에 계산하기

:::tabs
== Before
```tsx
function Cart({ items }: { items: CartItem[] }) {
  const [totalPrice, setTotalPrice] = useState(0)
  const [itemCount, setItemCount] = useState(0)
  const [hasExpensiveItem, setHasExpensiveItem] = useState(false)

  // items가 바뀔 때마다 3개의 파생 상태를 동기화해야 한다
  useEffect(() => {
    setTotalPrice(items.reduce((sum, item) => sum + item.price * item.qty, 0))
    setItemCount(items.reduce((sum, item) => sum + item.qty, 0))
    setHasExpensiveItem(items.some((item) => item.price > 100000))
  }, [items])

  // useEffect를 깜빡하면 totalPrice와 items가 불일치한다
}
```

== After
```tsx
function Cart({ items }: { items: CartItem[] }) {
  // 렌더링 중에 계산한다. items와 항상 동기화된다.
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  )
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0)
  const hasExpensiveItem = items.some((item) => item.price > 100000)

  return (
    <div>
      <p>총 {itemCount}개 상품</p>
      <p>합계: {totalPrice.toLocaleString()}원</p>
      {hasExpensiveItem && <p>고가 상품이 포함되어 있습니다</p>}
    </div>
  )
}
```
:::

## useMemo는 실제로 무거운 계산에만 사용하기

대부분의 계산은 충분히 빠르다. useMemo는 성능 문제가 측정된 후에 추가한다.

:::tabs
== Before
```tsx
function UserList({ users, searchQuery }) {
  // 10-20명 정도의 유저를 필터링하는 데 useMemo는 과하다
  const filteredUsers = useMemo(
    () => users.filter((u) => u.name.includes(searchQuery)),
    [users, searchQuery]
  )

  return <ul>{filteredUsers.map(/* ... */)}</ul>
}
```

== After
```tsx
// 단순 계산은 그냥 매번 계산한다
function UserList({ users, searchQuery }) {
  const filteredUsers = users.filter((u) => u.name.includes(searchQuery))
  return <ul>{filteredUsers.map(/* ... */)}</ul>
}

// useMemo는 실제로 무거운 계산에만 사용한다
function AnalyticsDashboard({ transactions }: { transactions: Transaction[] }) {
  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => ({
        totalRevenue: acc.totalRevenue + tx.amount,
        avgOrderValue: (acc.totalRevenue + tx.amount) / (acc.count + 1),
        count: acc.count + 1,
        byCategory: {
          ...acc.byCategory,
          [tx.category]: (acc.byCategory[tx.category] ?? 0) + tx.amount,
        },
      }),
      { totalRevenue: 0, avgOrderValue: 0, count: 0, byCategory: {} }
    )
  }, [transactions])

  return <SummaryChart data={summary} />
}
```
:::

## URL에서 파생되는 상태를 별도로 관리하지 않기

현재 페이지, 필터, 정렬 조건 등이 URL에 이미 있다면 그것이 진실의 원천(source of truth)이다. 별도 state를 두면 URL과 동기화하는 코드가 필요해진다.

:::tabs
== Before
```tsx
// URL에 이미 있는 정보를 별도 state로 복제하고 있다
function ProductListPage() {
  const [searchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('latest')
  const [category, setCategory] = useState('all')

  // URL과 state를 양방향 동기화해야 한다
  useEffect(() => {
    setCurrentPage(Number(searchParams.get('page')) || 1)
    setSortBy(searchParams.get('sort') || 'latest')
    setCategory(searchParams.get('category') || 'all')
  }, [searchParams])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSearchParams({ ...Object.fromEntries(searchParams), page: String(page) })
  }
}
```

== After
```tsx
// URL을 유일한 진실의 원천으로 사용한다
function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // URL에서 직접 파생한다. 별도 state가 필요 없다.
  const currentPage = Number(searchParams.get('page')) || 1
  const sortBy = searchParams.get('sort') || 'latest'
  const category = searchParams.get('category') || 'all'

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      prev.set('page', String(page))
      return prev
    })
  }

  // queryKey에 URL 파라미터를 포함하면 URL 변경 시 자동 리패치된다
  const { data } = useQuery({
    queryKey: ['products', { page: currentPage, sort: sortBy, category }],
    queryFn: () => api.getProducts({ page: currentPage, sort: sortBy, category }),
  })
}
```
:::

## 빠른 참조

| 코드 냄새 | 개선 방법 |
|----------|----------|
| useEffect로 파생 상태 동기화 | 렌더링 중에 계산 |
| 단순 필터에 useMemo | 그냥 매번 계산 |
| URL 값을 별도 state에 복제 | URL에서 직접 파생 |
| state와 props에서 동일한 값이 중복 | 하나의 source of truth만 유지 |

## 주의사항

- useMemo를 모든 계산에 붙이지 않는다. 측정 후 필요할 때만 추가한다.
- "미래에 독립적으로 바뀔 수 있는 값"은 파생이 아닌 별도 상태가 맞을 수 있다.

## 참고 자료

- [React 공식 문서 - Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state)
- [React 공식 문서 - You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React 공식 문서 - useMemo](https://react.dev/reference/react/useMemo)
- [Kent C. Dodds - Don't Sync State. Derive It!](https://kentcdodds.com/blog/dont-sync-state-derive-it)
