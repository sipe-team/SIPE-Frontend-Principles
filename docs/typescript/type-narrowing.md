# 타입을 좁혀서 안전하게 사용하기

넓은 타입(`any`, `unknown`, 유니온)은 그대로 사용하지 않고, 반드시 좁힌 후 사용합니다.

## 규칙: `any`를 사용하지 마세요

`any`는 타입 검사를 무력화합니다. 타입을 모를 때는 `unknown`을 사용하고 타입 가드로 좁힙니다.

:::tabs
== Bad
```ts
function processInput(input: any) {
  return input.trim().toLowerCase()
  // input이 string이 아니면 런타임 에러
}
```

== Good
```ts
function processInput(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('문자열만 처리할 수 있습니다')
  }
  return input.trim().toLowerCase()
}
```
:::

## 규칙: 판별 유니온으로 상태를 모델링하세요

여러 상태를 가진 데이터는 `status` 같은 판별 필드로 구분하여 각 상태에서 어떤 필드가 존재하는지 명확히 합니다.

:::tabs
== Bad
```ts
interface ApiResponse {
  data?: string
  error?: string
  isLoading: boolean
}

function handleResponse(res: ApiResponse) {
  if (!res.isLoading && res.data) {
    // data와 error가 동시에 존재할 수 있음
    console.log(res.data)
  }
}
```

== Good
```ts
type ApiResponse =
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; message: string }

function handleResponse(res: ApiResponse) {
  switch (res.status) {
    case 'success':
      console.log(res.data) // data가 확실히 존재
      break
    case 'error':
      console.error(res.message)
      break
  }
}
```
:::

## 규칙: 타입 단언(`as`)보다 타입 가드를 사용하세요

`as`는 컴파일러에게 "내가 맞으니 믿어"라고 말하는 것입니다. 런타임 검증이 없으므로 위험합니다.

:::tabs
== Bad
```ts
const user = JSON.parse(data) as User
// data가 User 형태가 아니어도 에러 없이 통과
console.log(user.name)
```

== Good
```ts
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof (value as Record<string, unknown>).name === 'string'
  )
}

const parsed = JSON.parse(data)
if (!isUser(parsed)) {
  throw new Error('유효하지 않은 사용자 데이터')
}
console.log(parsed.name) // 안전하게 접근
```
:::
