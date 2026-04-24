# 렌더링 성능을 고려한 코드 작성하기

DOM 조작과 스타일 변경 시 브라우저의 렌더링 파이프라인을 이해하고, 불필요한 리플로우를 최소화합니다.

## 규칙: 레이아웃을 유발하는 속성 변경을 최소화하세요

`width`, `height`, `margin`, `padding` 등을 변경하면 리플로우가 발생합니다. 애니메이션에는 `transform`과 `opacity`를 사용하세요.

:::tabs
== Bad
```css
.slide-in {
  /* left 변경은 매 프레임 리플로우 발생 */
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { left: -100%; }
  to { left: 0; }
}
```

== Good
```css
.slide-in {
  /* transform은 합성 단계에서만 처리 — 리플로우 없음 */
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
```
:::

## 규칙: DOM 읽기와 쓰기를 분리하세요

DOM 속성을 읽은 직후 스타일을 변경하면 강제 리플로우(forced reflow)가 발생합니다.

:::tabs
== Bad
```js
// 읽기/쓰기를 번갈아 → 매번 강제 리플로우
elements.forEach(el => {
  const height = el.offsetHeight       // 읽기
  el.style.height = height * 2 + 'px'  // 쓰기 → 강제 리플로우
})
```

== Good
```js
// 읽기를 먼저 모두 수행
const heights = elements.map(el => el.offsetHeight)

// 쓰기를 한 번에 수행
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2 + 'px'
})
```
:::

## 규칙: `will-change`는 필요한 곳에만 사용하세요

`will-change`는 브라우저에 최적화 힌트를 주지만, 과도하게 사용하면 오히려 메모리를 낭비합니다.

:::tabs
== Bad
```css
/* 모든 요소에 적용 — 메모리 낭비 */
* {
  will-change: transform;
}
```

== Good
```css
/* 실제 애니메이션이 발생하는 요소에만 적용 */
.animated-card:hover {
  will-change: transform;
}
```
:::
