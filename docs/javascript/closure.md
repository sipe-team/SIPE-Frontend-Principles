# 스코프를 좁혀서 작성하기

변수와 함수의 스코프는 가능한 한 좁게 유지합니다. 전역 상태나 넓은 스코프의 변수는 예측하기 어려운 부수 효과를 만듭니다.

## 규칙: 상태를 캡슐화하세요

외부에서 직접 접근 가능한 변수 대신, 함수로 감싸서 접근을 제한합니다.

:::tabs
== Bad
```js
// 전역에서 누구나 수정 가능한 상태
let count = 0

function increment() {
  count++
}

function reset() {
  count = 0
}

// 다른 곳에서 실수로 덮어쓸 수 있음
count = -999
```

== Good
```js
function createCounter(initialValue = 0) {
  let count = initialValue

  return {
    increment: () => ++count,
    reset: () => { count = initialValue },
    getCount: () => count,
  }
}

const counter = createCounter(0)
counter.increment() // 1
// count에 직접 접근 불가 — 안전
```
:::

## 규칙: `var` 대신 `const`와 `let`을 사용하세요

`var`는 함수 스코프를 가지므로 의도치 않은 호이스팅이 발생합니다. `const`를 기본으로 사용하고, 재할당이 필요한 경우에만 `let`을 사용합니다.

:::tabs
== Bad
```js
for (var i = 0; i < items.length; i++) {
  setTimeout(() => console.log(items[i]), 100)
}
// 모든 콜백에서 i === items.length
```

== Good
```js
for (const item of items) {
  setTimeout(() => console.log(item), 100)
}
// 각 콜백이 올바른 item을 참조
```
:::

## 규칙: 모듈 스코프 변수를 최소화하세요

파일 최상단에 선언하는 변수는 해당 모듈의 모든 함수에서 접근 가능합니다. 특정 함수에서만 필요한 값은 그 함수 안에서 선언합니다.

:::tabs
== Bad
```js
// 모듈 전체에서 접근 가능하지만 formatDate에서만 사용
const formatter = new Intl.DateTimeFormat('ko-KR')

export function formatDate(date) {
  return formatter.format(date)
}

export function parseInput(input) {
  // formatter가 여기서도 보이지만 관련 없음
  return input.trim()
}
```

== Good
```js
export function formatDate(date) {
  const formatter = new Intl.DateTimeFormat('ko-KR')
  return formatter.format(date)
}

export function parseInput(input) {
  return input.trim()
}
```
:::
