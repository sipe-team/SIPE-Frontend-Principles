# 커스텀 훅 추출 기준 세우기

React 공식 문서는 커스텀 훅을 상태를 다루는 로직을 나누어 쓰는 방법으로 설명합니다. 그래서 훅을 뽑을지 말지는 "중복이 있느냐"보다 "역할이 더 또렷해지느냐"로 판단하는 편이 낫습니다.

## 규칙: Hook과 Effect가 한 가지 목적을 이룰 때만 추출하세요

다음 조건이 함께 맞을 때 커스텀 훅의 가치가 커집니다.

- 실제로 Hook을 호출합니다
- 상태, 파생값, 이벤트, Effect가 한 가지 맥락으로 묶입니다
- 이름을 붙였을 때 호출부가 더 또렷해집니다

반대로 `useState` 하나를 감싸거나, 한 컴포넌트 안에서만 잠깐 쓰는 로컬 로직을 무리하게 빼면 추상화만 남습니다.

## 규칙: Hook을 쓰지 않는 함수는 일반 함수로 두세요

커스텀 훅은 Hook을 호출하는 함수입니다. `sort`, `map`, `filter` 같은 순수 계산만 하는 함수에 `use` 접두사를 붙이면 React 로직이 숨어 있는 것처럼 보여 호출부를 오히려 헷갈리게 만듭니다.

:::tabs
== Bad
```tsx
function useSortedProducts(products: Product[]) {
  return [...products].sort((a, b) => a.price - b.price)
}
```

== Good
```tsx
function getSortedProducts(products: Product[]) {
  return [...products].sort((a, b) => a.price - b.price)
}
```
:::

## 규칙: Effect 기반 훅은 생명주기보다 동기화 대상을 이름에 드러내세요

Effect는 DOM, 브라우저 API, 구독, 네트워크처럼 React 바깥과 동기화할 때만 씁니다. 이런 로직이 여러 곳에서 반복된다면 `useMount`처럼 시점만 말하는 이름보다, 무엇과 동기화하는지 드러나는 훅이 더 낫습니다.

:::tabs
== Bad
```tsx
function useMount(callback: () => void) {
  useEffect(() => {
    callback()
  }, [])
}
```

== Good
```tsx
function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) {
      return
    }

    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = original
    }
  }, [locked])
}
```
:::

## 규칙: Effect가 필요 없다면 훅도 다시 생각하세요

렌더링용 계산이나 클릭 이후의 처리라면 Effect보다 계산식과 이벤트 핸들러를 우선합니다. 한 컴포넌트 안에서만 쓰이고 주변 상태와 강하게 결합된 Effect라면, 굳이 커스텀 훅으로 감추지 않고 컴포넌트 안의 `useEffect`로 두는 편이 더 읽기 쉽습니다.

- 계산 로직은 렌더링 중 계산합니다
- 사용자 동작 뒤에 일어나는 처리는 이벤트 핸들러에서 다룹니다
- 훅 추출은 Effect를 숨기기보다 동기화 목적을 분명하게 만드는 선택이어야 합니다

## 빠른 참조

| 코드 냄새 | 개선 방법 |
|----------|----------|
| `useState` 하나만 감싼 훅 | 컴포넌트 안에 두거나 목적이 드러나는 단위로 다시 묶기 |
| Hook을 호출하지 않는 `useX` 함수 | 일반 함수로 변경 |
| `useMount`, `useEffectOnce` 같은 lifecycle 훅 | 동기화 대상이 드러나는 훅으로 변경 |
| 계산용 로직을 Effect로 동기화 | 렌더링 중 계산 또는 이벤트 핸들러로 이동 |
| 한 컴포넌트에만 묶인 Effect를 무리하게 훅으로 추출 | 컴포넌트 안의 `useEffect`로 유지 |

## 체크리스트

- 이름을 붙였을 때 호출부가 더 읽기 쉬워지나요?
- 상태, 이벤트, 파생값, Effect가 한 가지 목적 아래 묶이나요?
- Hook을 호출하지 않는 일반 함수를 억지로 훅으로 만들고 있지 않나요?
- Effect가 정말 외부 시스템 동기화인가요?

## 참고 자료

- [React 공식 문서 - Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React 공식 문서 - You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React 공식 문서 - Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)
