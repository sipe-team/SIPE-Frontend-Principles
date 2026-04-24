# 리소스 로딩을 최적화하기

사용자에게 필요한 리소스를 적시에, 최소한으로 전달합니다.

## 규칙: 초기 번들에 모든 코드를 포함하지 마세요

사용자가 당장 보지 않는 페이지의 코드는 분리하여 필요할 때 로드합니다.

:::tabs
== Bad
```tsx
import AdminDashboard from './pages/AdminDashboard'
import UserSettings from './pages/UserSettings'
import Analytics from './pages/Analytics'

// 모든 페이지가 초기 번들에 포함
function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/settings" element={<UserSettings />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  )
}
```

== Good
```tsx
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const UserSettings = lazy(() => import('./pages/UserSettings'))
const Analytics = lazy(() => import('./pages/Analytics'))

// 해당 경로 진입 시에만 코드 로드
function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  )
}
```
:::

## 규칙: 이미지는 적절한 포맷과 크기로 제공하세요

:::tabs
== Bad
```html
<!-- 3000x2000 원본 이미지를 300px 너비로 표시 -->
<img src="/photos/hero.png" alt="hero" />
```

== Good
```html
<!-- 뷰포트에 맞는 크기 + 최신 포맷 + 지연 로딩 -->
<picture>
  <source srcset="/photos/hero.avif" type="image/avif" />
  <source srcset="/photos/hero.webp" type="image/webp" />
  <img
    src="/photos/hero.jpg"
    alt="hero"
    width="600"
    height="400"
    loading="lazy"
  />
</picture>
```
:::

## 규칙: 중요 리소스는 미리 로드하세요

LCP(Largest Contentful Paint)에 영향을 주는 리소스는 `preload`로 미리 가져옵니다.

```html
<!-- 히어로 이미지나 주요 폰트는 preload -->
<link rel="preload" href="/fonts/pretendard.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/images/hero.webp" as="image" />
```
