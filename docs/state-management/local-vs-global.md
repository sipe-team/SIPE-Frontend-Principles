# Local vs Global 상태 판단 기준

상태는 항상 로컬에서 시작한다. "나중에 다른 곳에서도 쓸 수 있으니까"라는 이유로 처음부터 전역에 두지 않는다.

## 로컬 상태부터 시작하기

상태의 범위는 점진적으로 넓힌다.

```
useState (로컬)
  ↓ 여러 자식 컴포넌트에서 필요할 때만
상태 끌어올리기 (Lifting State Up)
  ↓ props drilling이 3단계 이상일 때만
Context API
  ↓ 복잡한 업데이트 로직 + 성능 이슈가 있을 때만
외부 상태 관리 (Zustand, Jotai 등)
```

:::tabs
== Before
```tsx
// 이 모달을 사용하는 컴포넌트는 하나뿐인데 전역에 두고 있다
import { useModalStore } from '@/stores/modalStore'

function ProductDetailPage() {
  const { isOpen, open, close } = useModalStore()

  return (
    <div>
      <button onClick={open}>상품 문의하기</button>
      {isOpen && <InquiryModal onClose={close} />}
    </div>
  )
}
```

== After
```tsx
// 모달 상태는 사용하는 컴포넌트에서 로컬로 관리한다
function ProductDetailPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>상품 문의하기</button>
      {isModalOpen && (
        <InquiryModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}
```
:::

## 전역 상태는 "여러 페이지에서 공유"될 때만 사용하기

전역 상태가 적절한 조건:
1. 여러 라우트/페이지에 걸쳐 공유되는 데이터
2. 페이지 전환 후에도 유지되어야 하는 데이터
3. 서버 상태가 아닌 순수 클라이언트 상태

:::tabs
== Before
```tsx
// 서버 데이터를 전역 스토어에서 수동으로 관리하고 있다
const useProductStore = create((set) => ({
  products: [],
  isLoading: false,
  fetchProducts: async () => {
    set({ isLoading: true })
    const products = await api.getProducts()
    set({ products, isLoading: false })
  },
}))
```

== After
```tsx
// 전역 스토어는 테마, 사이드바 같은 순수 UI 상태에만 사용한다
const useThemeStore = create((set) => ({
  theme: 'light',
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
}))

// 서버 데이터는 React Query에 맡긴다
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: api.getProducts,
  })
}
```
:::

## 전역 상태의 크기를 최소화하기

하나의 거대한 스토어보다 작은 단위의 스토어가 낫다. 스토어가 커지면 어떤 컴포넌트가 어떤 상태에 의존하는지 파악하기 어렵다.

:::tabs
== Before
```tsx
// 하나의 스토어에 모든 것이 들어 있다
const useStore = create((set) => ({
  user: null,
  token: null,
  login: async () => { /* ... */ },
  logout: () => { /* ... */ },
  sidebarOpen: true,
  theme: 'light',
  toggleSidebar: () => { /* ... */ },
  cartItems: [],
  addToCart: () => { /* ... */ },
  notifications: [],
  markAsRead: () => { /* ... */ },
}))
```

== After
```tsx
// 도메인별로 분리한다
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: async (credentials) => { /* ... */ },
  logout: () => set({ user: null, token: null }),
}))

const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))

// 장바구니, 알림은 서버 상태라면 React Query로 분리한다
```
:::

## 빠른 참조

| 코드 냄새 | 개선 방법 |
|----------|----------|
| 한 곳에서만 쓰는 상태가 전역에 있음 | `useState`로 로컬 관리 |
| 서버 데이터를 전역 스토어에서 fetch | React Query 등 서버 상태 라이브러리 사용 |
| 스토어 하나에 모든 상태가 뭉쳐 있음 | 도메인별로 분리 |

## 참고 자료

- [React 공식 문서 - Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
- [Kent C. Dodds - Application State Management with React](https://kentcdodds.com/blog/application-state-management-with-react)
- [Zustand - Best Practices](https://zustand.docs.pmnd.rs/guides/practice-with-no-store-actions)
