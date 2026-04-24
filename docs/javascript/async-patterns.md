# 비동기 코드를 명확하게 작성하기

비동기 코드는 실행 순서가 직관적이지 않으므로, 흐름을 명확하게 드러내는 방식으로 작성합니다.

## 규칙: `async/await`를 기본으로 사용하세요

Promise 체이닝보다 `async/await`이 위에서 아래로 읽히므로 흐름을 파악하기 쉽습니다.

:::tabs
== Bad
```js
function fetchUserPosts(userId) {
  return fetch(`/api/users/${userId}`)
    .then(res => res.json())
    .then(user => fetch(`/api/posts?userId=${user.id}`))
    .then(res => res.json())
    .catch(error => {
      console.error(error)
      return []
    })
}
```

== Good
```js
async function fetchUserPosts(userId) {
  try {
    const userRes = await fetch(`/api/users/${userId}`)
    const user = await userRes.json()
    const postsRes = await fetch(`/api/posts?userId=${user.id}`)
    return await postsRes.json()
  } catch (error) {
    console.error(error)
    return []
  }
}
```
:::

## 규칙: 독립적인 비동기 작업은 병렬로 실행하세요

순서가 상관없는 작업을 순차적으로 실행하면 불필요하게 느려집니다.

:::tabs
== Bad
```js
async function loadDashboard() {
  // 각각 1초씩 걸린다면 총 3초
  const user = await fetchUser()
  const posts = await fetchPosts()
  const notifications = await fetchNotifications()
  return { user, posts, notifications }
}
```

== Good
```js
async function loadDashboard() {
  // 병렬 실행으로 총 1초
  const [user, posts, notifications] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchNotifications(),
  ])
  return { user, posts, notifications }
}
```
:::

## 규칙: 에러 처리의 범위를 명확히 하세요

`try/catch`는 실패할 수 있는 최소 범위에만 적용합니다.

:::tabs
== Bad
```js
async function saveAndNotify(data) {
  try {
    const result = await saveToDatabase(data)
    await sendNotification(result.id)
    await updateCache(result)
    return result
  } catch (error) {
    // 어디서 실패한 건지 알 수 없음
    console.error('작업 실패:', error)
  }
}
```

== Good
```js
async function saveAndNotify(data) {
  const result = await saveToDatabase(data)

  try {
    await sendNotification(result.id)
  } catch (error) {
    // 알림 실패는 치명적이지 않으므로 로그만
    console.warn('알림 전송 실패:', error)
  }

  await updateCache(result)
  return result
}
```
:::
