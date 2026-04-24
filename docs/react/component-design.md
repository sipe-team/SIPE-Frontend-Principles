# 단일 책임 컴포넌트 작성하기

하나의 컴포넌트가 여러 역할을 담당하면 수정 범위가 넓어지고 재사용이 어려워집니다. 컴포넌트는 하나의 역할만 담당하도록 분리합니다.

## 규칙: 데이터 로딩과 UI 렌더링을 분리하세요

:::tabs
== Bad
```tsx
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    fetchUser(userId).then(setUser)
    fetchPosts(userId).then(setPosts)
  }, [userId])

  if (!user) return <Spinner />

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

== Good
```tsx
// 데이터 로딩은 커스텀 훅으로 분리
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => { fetchUser(userId).then(setUser) }, [userId])
  return user
}

function usePosts(userId: string) {
  const [posts, setPosts] = useState<Post[]>([])
  useEffect(() => { fetchPosts(userId).then(setPosts) }, [userId])
  return posts
}

// UI는 받은 데이터를 렌더링하는 데만 집중
function UserProfile({ userId }: { userId: string }) {
  const user = useUser(userId)
  const posts = usePosts(userId)

  if (!user) return <Spinner />

  return (
    <div>
      <UserInfo user={user} />
      <PostList posts={posts} />
    </div>
  )
}
```
:::

## 규칙: 조건부 렌더링이 복잡하면 컴포넌트를 분리하세요

:::tabs
== Bad
```tsx
function OrderStatus({ order }: { order: Order }) {
  return (
    <div>
      {order.status === 'pending' && (
        <div>
          <Spinner />
          <p>주문 처리 중...</p>
          <button onClick={() => cancelOrder(order.id)}>취소</button>
        </div>
      )}
      {order.status === 'shipped' && (
        <div>
          <TrackingMap trackingId={order.trackingId} />
          <p>배송 중입니다</p>
        </div>
      )}
      {order.status === 'delivered' && (
        <div>
          <CheckIcon />
          <p>배송 완료</p>
          <button onClick={() => writeReview(order.id)}>리뷰 작성</button>
        </div>
      )}
    </div>
  )
}
```

== Good
```tsx
function OrderStatus({ order }: { order: Order }) {
  switch (order.status) {
    case 'pending':
      return <PendingOrder orderId={order.id} />
    case 'shipped':
      return <ShippedOrder trackingId={order.trackingId} />
    case 'delivered':
      return <DeliveredOrder orderId={order.id} />
  }
}
```
:::

## 규칙: Props는 필요한 것만 전달하세요

객체 전체를 전달하면 컴포넌트가 불필요한 데이터에 의존하게 됩니다.

:::tabs
== Bad
```tsx
// user 객체 전체에 의존 — user 구조가 바뀌면 영향받음
function UserAvatar({ user }: { user: User }) {
  return <img src={user.avatarUrl} alt={user.name} />
}
```

== Good
```tsx
// 필요한 props만 받음 — user 구조와 무관
function UserAvatar({ src, name }: { src: string; name: string }) {
  return <img src={src} alt={name} />
}
```
:::
