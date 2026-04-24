# 가독성 높은 코드 작성하기

코드는 작성하는 시간보다 읽는 시간이 훨씬 깁니다. 읽는 사람이 최소한의 맥락으로 이해할 수 있도록 작성합니다.

## 규칙: 함께 실행되지 않는 코드는 분리하세요

하나의 함수에 여러 단계의 로직이 섞여 있으면 전체를 읽어야 흐름을 파악할 수 있습니다.

:::tabs
== Bad
```ts
function handleSubmit(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  if (!name || name.length < 2) throw new Error('이름은 2자 이상')
  if (!email || !email.includes('@')) throw new Error('올바른 이메일')

  return fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  })
}
```

== Good
```ts
function validateForm(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  if (!name || name.length < 2) throw new Error('이름은 2자 이상')
  if (!email || !email.includes('@')) throw new Error('올바른 이메일')
  return { name, email }
}

function handleSubmit(formData: FormData) {
  const validated = validateForm(formData)
  return fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(validated),
  })
}
```
:::

## 규칙: 복잡한 조건에는 이름을 붙이세요

조건문이 길면 무엇을 판단하는지 한눈에 알기 어렵습니다.

:::tabs
== Bad
```ts
if (user.age >= 18 && user.hasAgreed && !user.isBanned && user.emailVerified) {
  grantAccess(user)
}
```

== Good
```ts
const canAccess =
  user.age >= 18 &&
  user.hasAgreed &&
  !user.isBanned &&
  user.emailVerified

if (canAccess) {
  grantAccess(user)
}
```
:::

## 규칙: 매직 넘버에 이름을 붙이세요

의미 없는 숫자는 의도를 드러내는 상수로 선언합니다.

:::tabs
== Bad
```ts
if (password.length < 8) {
  showError('비밀번호가 너무 짧습니다')
}

setTimeout(retry, 3000)
```

== Good
```ts
const MIN_PASSWORD_LENGTH = 8
const RETRY_DELAY_MS = 3000

if (password.length < MIN_PASSWORD_LENGTH) {
  showError('비밀번호가 너무 짧습니다')
}

setTimeout(retry, RETRY_DELAY_MS)
```
:::

## 규칙: 삼항 연산자는 단순한 경우에만 사용하세요

중첩된 삼항 연산자는 읽기 어렵습니다. 분기가 복잡하면 `if`문이나 early return을 사용합니다.

:::tabs
== Bad
```ts
const label =
  status === 'active'
    ? '활성'
    : status === 'inactive'
      ? '비활성'
      : status === 'pending'
        ? '대기'
        : '알 수 없음'
```

== Good
```ts
function getStatusLabel(status: string) {
  if (status === 'active') return '활성'
  if (status === 'inactive') return '비활성'
  if (status === 'pending') return '대기'
  return '알 수 없음'
}
```
:::
