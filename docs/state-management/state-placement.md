# 상태를 적절한 위치에 배치하기

상태는 그것을 사용하는 컴포넌트에서 가장 가까운 위치에 선언한다. 불필요하게 높은 곳에 올리면 관련 없는 컴포넌트까지 리렌더링되고, 데이터 흐름을 파악하기 어려워진다.

## 가장 가까운 공통 부모에 두기

상태를 끌어올릴 때는 "이 상태를 읽거나 변경하는 컴포넌트들의 가장 가까운 공통 조상"에 둔다.

:::tabs
== Before
```tsx
// SearchInput과 SearchResults만 사용하는 상태가 App에 있다
function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  return (
    <div>
      <Header />
      <Navigation />
      <SearchPage
        query={searchQuery}
        onQueryChange={setSearchQuery}
        results={searchResults}
        onSearch={setSearchResults}
      />
      <Footer />
    </div>
  )
}
```

== After
```tsx
function App() {
  return (
    <div>
      <Header />
      <Navigation />
      <SearchPage />
      <Footer />
    </div>
  )
}

// 검색 상태는 SearchPage 안에서 관리한다
function SearchPage() {
  const [query, setQuery] = useState('')
  const { data: results } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchProducts(query),
    enabled: query.length > 0,
  })

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} />
      <SearchResults items={results ?? []} />
    </div>
  )
}
```
:::

## Props Drilling이 깊어지면 합성(Composition)을 먼저 시도하기

Props가 3단계 이상 전달되면 Context보다 먼저 컴포넌트 합성을 시도한다. 합성은 중간 컴포넌트가 props를 알 필요를 없앤다.

:::tabs
== Before
```tsx
// user가 3단계를 통과한다
function Dashboard({ user }) {
  return <Sidebar user={user} />
}

function Sidebar({ user }) {
  return <UserSection user={user} />
}

function UserSection({ user }) {
  return <UserAvatar name={user.name} src={user.avatarUrl} />
}
```

== After
```tsx
// 합성을 사용하면 중간 컴포넌트가 user를 몰라도 된다
function Dashboard({ user }) {
  return (
    <Sidebar
      userSection={
        <UserAvatar name={user.name} src={user.avatarUrl} />
      }
    />
  )
}

function Sidebar({ userSection }) {
  return (
    <aside>
      <nav>{/* ... */}</nav>
      {userSection}
    </aside>
  )
}
```
:::

## Context는 자주 바뀌지 않는 값에 사용하기

Context 값이 자주 바뀌면 해당 Context를 구독하는 모든 컴포넌트가 리렌더링된다. 자주 바뀌는 상태는 외부 스토어가 적합하다.

:::tabs
== Before
```tsx
// 매 초마다 Context를 구독하는 모든 컴포넌트가 리렌더링된다
const TimerContext = createContext(0)

function TimerProvider({ children }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <TimerContext.Provider value={seconds}>
      {children}
    </TimerContext.Provider>
  )
}
```

== After
```tsx
// 자주 바뀌는 상태는 외부 스토어 + selector로 필요한 곳만 구독한다
const useTimerStore = create((set) => ({
  seconds: 0,
  start: () => {
    const id = setInterval(
      () => set((state) => ({ seconds: state.seconds + 1 })),
      1000
    )
    return () => clearInterval(id)
  },
}))

function TimerDisplay() {
  const seconds = useTimerStore((state) => state.seconds)
  return <span>{seconds}초</span>
}

// Context는 테마, 로케일처럼 자주 바뀌지 않는 값에 적합하다
const ThemeContext = createContext<'light' | 'dark'>('light')
```
:::

## 상위에 있는 상태를 내려야 할 때를 인지하기

상태를 올리기만 하는 게 아니다. 상위에 있는 상태가 실제로는 하위 컴포넌트에서만 쓰인다면 내려야 한다.

:::tabs
== Before
```tsx
// 각 필드의 변경이 폼 전체를 리렌더링한다
function CheckoutForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [cardNumber, setCardNumber] = useState('')

  return (
    <form>
      <PersonalInfoSection
        name={name} onNameChange={setName}
        email={email} onEmailChange={setEmail}
      />
      <AddressSection address={address} onAddressChange={setAddress} />
      <PaymentSection
        cardNumber={cardNumber} onCardNumberChange={setCardNumber}
      />
    </form>
  )
}
```

== After
```tsx
// 각 섹션이 자신의 상태를 직접 관리한다
function CheckoutForm() {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    submitOrder(Object.fromEntries(formData))
  }

  return (
    <form onSubmit={handleSubmit}>
      <PersonalInfoSection />
      <AddressSection />
      <PaymentSection />
      <button type="submit">주문하기</button>
    </form>
  )
}

function PersonalInfoSection() {
  return (
    <fieldset>
      <input name="name" placeholder="이름" />
      <input name="email" type="email" placeholder="이메일" />
    </fieldset>
  )
}
```
:::

## 빠른 참조

| 코드 냄새 | 개선 방법 |
|----------|----------|
| 한 곳에서만 쓰는 상태가 최상위에 있음 | 사용하는 컴포넌트로 내리기 |
| props가 3단계 이상 통과 | 합성 패턴: children 사용 |
| Context 값이 빈번하게 바뀜 | 외부 스토어 + selector |
| 폼 필드 하나 바꿨는데 전체 리렌더링 | 각 섹션이 자체 상태 관리 |

## 참고 자료

- [React 공식 문서 - Lifting State Up](https://react.dev/learn/sharing-state-between-components#lifting-state-up-by-example)
- [React 공식 문서 - Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
- [Kent C. Dodds - Prop Drilling](https://kentcdodds.com/blog/prop-drilling)
- [React 공식 문서 - Composition vs Inheritance](https://legacy.reactjs.org/docs/composition-vs-inheritance.html)
