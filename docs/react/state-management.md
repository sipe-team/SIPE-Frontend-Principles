# 상태를 적절한 위치에 배치하기

상태는 그것을 사용하는 컴포넌트에서 가장 가까운 위치에 선언합니다. 불필요하게 높은 곳에 올리거나 전역에 두지 않습니다.

## 규칙: 로컬 상태부터 시작하세요

"나중에 다른 곳에서도 쓸 수 있으니까"라는 이유로 처음부터 전역에 두지 않습니다.

```
useState (로컬)
  ↓ 여러 컴포넌트에서 필요할 때만
상태 끌어올리기 (Lifting State Up)
  ↓ props drilling이 3단계 이상일 때만
Context API
  ↓ 복잡한 업데이트 로직이 필요할 때만
외부 상태 관리 (Zustand, Jotai 등)
```

## 규칙: 서버 상태와 UI 상태를 분리하세요

서버에서 가져온 데이터와 UI 상태(모달, 입력값 등)를 같은 곳에서 관리하지 않습니다.

:::tabs
== Bad
```tsx
function ProductPage() {
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('info')

  useEffect(() => {
    setIsLoading(true)
    fetchProduct(id)
      .then(setProduct)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [id])

  // 서버 상태와 UI 상태가 뒤섞여 있음
}
```

== Good
```tsx
function ProductPage() {
  // 서버 상태: 데이터 패칭 라이브러리에 위임
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
  })

  // UI 상태: 컴포넌트 로컬에서 관리
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('info')
}
```
:::

## 규칙: 파생 가능한 값을 상태로 만들지 마세요

다른 상태에서 계산할 수 있는 값은 별도의 상태로 만들지 않습니다.

:::tabs
== Bad
```tsx
function Cart({ items }: { items: CartItem[] }) {
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    setTotalPrice(items.reduce((sum, item) => sum + item.price, 0))
  }, [items])

  return <p>합계: {totalPrice}원</p>
}
```

== Good
```tsx
function Cart({ items }: { items: CartItem[] }) {
  // items에서 파생 가능하므로 상태가 아닌 계산값으로 처리
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0)

  return <p>합계: {totalPrice}원</p>
}
```
:::
