# 재사용 가능한 타입 설계하기

비슷한 타입을 반복 정의하지 않고, 제네릭과 유틸리티 타입으로 재사용 가능하게 설계합니다.

## 규칙: 반복되는 타입은 제네릭으로 추출하세요

:::tabs
== Bad
```ts
interface UserListResponse {
  items: User[]
  totalCount: number
  page: number
}

interface PostListResponse {
  items: Post[]
  totalCount: number
  page: number
}

interface CommentListResponse {
  items: Comment[]
  totalCount: number
  page: number
}
```

== Good
```ts
interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  page: number
}

type UserListResponse = PaginatedResponse<User>
type PostListResponse = PaginatedResponse<Post>
type CommentListResponse = PaginatedResponse<Comment>
```
:::

## 규칙: 제네릭에 제약 조건을 명시하세요

제약 없는 제네릭은 `any`와 다를 바 없습니다. `extends`로 최소 요구사항을 명시합니다.

:::tabs
== Bad
```ts
function getProperty<T>(obj: T, key: string) {
  return obj[key] // T에 key가 있는지 알 수 없음
}
```

== Good
```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key] // key가 T의 키임이 보장됨
}
```
:::

## 규칙: 유틸리티 타입을 적극 활용하세요

`Partial`, `Pick`, `Omit` 등 내장 유틸리티 타입으로 기존 타입을 변형합니다.

:::tabs
== Bad
```ts
// User의 일부 필드만 필요한데 전체를 다시 정의
interface UserUpdatePayload {
  name?: string
  email?: string
  bio?: string
}
```

== Good
```ts
interface User {
  id: string
  name: string
  email: string
  bio: string
  createdAt: Date
}

// 기존 타입에서 필요한 필드만 추출
type UserUpdatePayload = Partial<Pick<User, 'name' | 'email' | 'bio'>>
```
:::
