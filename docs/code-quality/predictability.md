# 예측 가능한 코드 작성하기

함수와 컴포넌트의 이름만 보고도 동작을 예측할 수 있어야 합니다. 숨겨진 부수 효과나 일관성 없는 동작은 버그를 만듭니다.

## 규칙: 비슷한 함수는 같은 형태의 값을 반환하세요

같은 역할을 하는 함수들이 다른 방식으로 실패를 처리하면, 호출하는 쪽에서 매번 다르게 대응해야 합니다.

:::tabs
== Bad
```ts
// null 반환
function getUserName(userId: string): string | null {
  const user = findUser(userId)
  if (!user) return null
  return user.name
}

// 예외 발생 — 같은 패턴인데 다른 처리
function getUserEmail(userId: string): string {
  const user = findUser(userId)
  if (!user) throw new Error('User not found')
  return user.email
}
```

== Good
```ts
// 둘 다 같은 방식으로 처리
function getUserName(userId: string): string | null {
  const user = findUser(userId)
  return user?.name ?? null
}

function getUserEmail(userId: string): string | null {
  const user = findUser(userId)
  return user?.email ?? null
}
```
:::

## 규칙: 함수에 숨겨진 부수 효과를 넣지 마세요

함수 이름에 드러나지 않는 동작은 호출하는 사람이 예측할 수 없습니다.

:::tabs
== Bad
```ts
function getUser(userId: string) {
  const user = findUser(userId)
  analytics.track('user_viewed', { userId }) // 숨겨진 부수 효과
  return user
}
```

== Good
```ts
function getUser(userId: string) {
  return findUser(userId)
}

// 부수 효과는 별도 함수로 분리하여 호출 측에서 명시적으로 사용
function trackUserView(userId: string) {
  analytics.track('user_viewed', { userId })
}
```
:::

## 규칙: 함수의 인자를 변경하지 마세요

인자로 받은 객체를 직접 수정하면, 호출한 쪽에서 예상치 못한 변경이 발생합니다.

:::tabs
== Bad
```ts
function addDefaultRole(user: User) {
  user.roles.push('viewer') // 원본 객체를 변경
  return user
}
```

== Good
```ts
function addDefaultRole(user: User): User {
  return {
    ...user,
    roles: [...user.roles, 'viewer'], // 새 객체를 반환
  }
}
```
:::
