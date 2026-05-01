# Feature-Sliced Design(FSD) 설계 전략

기능 중심의 계층 설계로 프로젝트 확장에 대응합니다.

Feature-Sliced Design(FSD)은 도메인 중심으로 코드를 분리하는 아키텍처 방법론입니다. 기술 역할(components, hooks, utils)이 아니라 **비즈니스 기능 단위**로 코드를 묶기 때문에, 특정 기능을 수정하거나 삭제할 때 영향 범위가 명확합니다.

FSD는 코드를 `app → pages → widgets → features → entities → shared` 순서의 레이어로 구성하며, **상위 레이어만 하위 레이어를 참조**할 수 있습니다.

---

## 기술 역할 기준 vs 도메인 기준 구조

:::tabs
== Before

```
src/
├── components/
│   ├── Button.tsx
│   ├── UserCard.tsx
│   ├── ProductCard.tsx
│   └── OrderSummary.tsx
├── hooks/
│   ├── useUser.ts
│   ├── useProduct.ts
│   └── useOrder.ts
├── utils/
│   ├── formatDate.ts
│   ├── formatPrice.ts
│   └── validateEmail.ts
└── pages/
    ├── UserPage.tsx
    ├── ProductPage.tsx
    └── OrderPage.tsx
```

기술 역할 기준으로 폴더를 나눴다. 유저 관련 코드를 수정하려면 `components`, `hooks`, `utils`를 모두 뒤져야 한다. 기능이 늘어날수록 각 폴더가 비대해지고, 무엇이 어디에 있는지 파악하기 어려워진다.

== After

```
src/
├── app/                        # 앱 초기화, 라우팅, 전역 프로바이더
│   ├── providers/
│   └── router.tsx
├── pages/                      # 라우트 단위 페이지 조합
│   ├── user/
│   └── product/
├── widgets/                    # 독립적인 UI 블록 (헤더, 사이드바 등)
│   └── Header/
├── features/                   # 사용자 행동 단위 기능
│   ├── auth/
│   │   ├── ui/LoginForm.tsx
│   │   ├── model/useAuth.ts
│   │   └── index.ts
│   └── cart/
│       ├── ui/CartButton.tsx
│       ├── model/useCart.ts
│       └── index.ts
├── entities/                   # 비즈니스 도메인 모델
│   ├── user/
│   │   ├── ui/UserCard.tsx
│   │   ├── model/user.types.ts
│   │   └── index.ts
│   └── product/
└── shared/                     # 어디서든 재사용 가능한 공통 코드
    ├── ui/Button.tsx
    ├── lib/formatPrice.ts
    └── api/client.ts
```

도메인 기준으로 폴더를 나눴다. `features/auth` 폴더 하나만 보면 인증 관련 코드를 모두 파악할 수 있다. 기능을 삭제할 때도 해당 슬라이스 폴더를 통째로 제거하면 된다.

:::

---

## 레이어별 역할과 경계

각 레이어는 담당하는 책임이 다릅니다. 코드를 어느 레이어에 배치할지 판단하는 기준은 **이 코드가 누구를 위해 존재하는가**입니다.

| 레이어 | 역할 | 예시 |
|--------|------|------|
| `app` | 앱 전체 초기화, 라우터, 전역 프로바이더 | `Router.tsx`, `ThemeProvider.tsx` |
| `pages` | 라우트에 대응하는 페이지. 하위 레이어를 조합만 한다 | `ProductListPage.tsx` |
| `widgets` | 여러 feature/entity를 조합한 독립 UI 블록 | `Header`, `Sidebar`, `Feed` |
| `features` | 사용자의 특정 행동 단위 기능 | `auth`, `cart`, `follow` |
| `entities` | 비즈니스 도메인 모델과 그 표현 | `user`, `product`, `order` |
| `shared` | 도메인에 무관하게 재사용되는 코드 | `Button`, `formatDate`, `apiClient` |

### 헷갈리기 쉬운 경우

**`features` vs `entities`**

`entities`는 도메인 **모델**을 나타내고, `features`는 사용자가 그 모델로 **무언가를 하는 행동**을 나타냅니다.

```
entities/user       → User가 무엇인지 (UserCard, user.types.ts)
features/follow     → User를 팔로우하는 행동 (FollowButton, useFollow.ts)
features/auth       → 로그인/로그아웃하는 행동 (LoginForm, useAuth.ts)
```

**`widgets` vs `features`**

`features`는 하나의 행동에 집중하고, `widgets`는 여러 feature와 entity를 **조합해서 완성되는 UI 블록**입니다.

```
features/search     → 검색창과 검색 로직
features/cart       → 장바구니 버튼과 상태
widgets/Header      → 검색창 + 장바구니 버튼 + 로고를 조합한 헤더 전체
```

**`shared` 배치 기준**

특정 도메인에 종속되면 `shared`가 아닙니다. `formatPrice`는 `shared`에 둘 수 있지만, `formatUserName`은 `entities/user` 안에 두는 것이 적절합니다.

---

## 단방향 의존성 규칙

상위 레이어만 하위 레이어를 참조합니다.

FSD의 핵심 규칙은 **레이어 간 참조 방향이 항상 위에서 아래로만 흐른다**는 것입니다. `features`가 `entities`를 참조할 수 있지만, `entities`가 `features`를 참조하면 안 됩니다. 이 규칙이 무너지면 순환 참조가 생기고, 어느 한 곳의 변경이 예측할 수 없는 곳까지 파급됩니다.

의존성 규칙은 코드 리뷰만으로는 놓치기 쉽습니다. `@feature-sliced/eslint-config`과 같은 ESLint 플러그인으로 위반을 자동으로 감지하는 것을 권장합니다.

```
app → pages → widgets → features → entities → shared
(상위)                                          (하위)
```

:::tabs
== Before

```tsx
// entities/user/ui/UserCard.tsx
// ❌ entity가 feature를 참조하고 있다
import { FollowButton } from '@/features/follow'
import { MessageButton } from '@/features/message'

export function UserCard({ user }: { user: User }) {
  return (
    <div>
      <p>{user.name}</p>
      <FollowButton userId={user.id} />
      <MessageButton userId={user.id} />
    </div>
  )
}
```

`entities/user`가 `features/follow`를 참조한다. 이후 `features/follow`에서 다시 `entities/user`를 참조하면 순환 참조가 생긴다.

== After

```tsx
// entities/user/ui/UserCard.tsx
// ✅ entity는 하위 레이어(shared)만 참조한다
import type { User } from '../model/user.types'

interface UserCardProps {
  user: User
  actions?: React.ReactNode // 상위 레이어의 기능을 슬롯으로 주입받는다
}

export function UserCard({ user, actions }: UserCardProps) {
  return (
    <div>
      <p>{user.name}</p>
      {actions}
    </div>
  )
}

// features/user-actions/ui/UserActionCard.tsx
// ✅ feature가 entity를 조합한다
import { UserCard } from '@/entities/user'
import { FollowButton } from '@/features/follow'
import { MessageButton } from '@/features/message'

export function UserActionCard({ user }: { user: User }) {
  return (
    <UserCard
      user={user}
      actions={
        <>
          <FollowButton userId={user.id} />
          <MessageButton userId={user.id} />
        </>
      }
    />
  )
}
```

`entity`는 슬롯(`actions`)으로 외부 기능을 주입받는다. 레이어 간 참조 방향이 항상 위에서 아래로만 흐른다.

:::


## Public API

Public API는 Slice 기능을 외부에서 사용할 수 있는 공식 경로입니다.

각 슬라이스는 `index.ts`로 외부에 공개할 것만 명시합니다.

FSD에서 슬라이스 내부 파일을 직접 참조하는 것은 지양합니다. 외부에서는 항상 `index.ts`를 통해서만 접근하며, 이를 통해 슬라이스 내부 구현을 자유롭게 변경해도 외부에 영향을 주지 않습니다.

:::tabs
== Before

```tsx
// 내부 파일 경로를 직접 참조하고 있다
import { UserCard } from '@/entities/user/ui/UserCard'
import { useUser } from '@/entities/user/model/useUser'
import type { User } from '@/entities/user/model/user.types'

// ui/UserCard.tsx → ui/UserAvatar.tsx로 파일명이 바뀌면
// 참조하는 모든 곳을 수정해야 한다
```

== After

```ts
// entities/user/index.ts
// 외부에 공개할 것만 명시한다
export { UserCard } from './ui/UserCard'
export { useUser } from './model/useUser'
export type { User } from './model/user.types'

// 내부 구현 세부 사항은 노출하지 않는다
// export { userInternalHelper } from './lib/internal' ← 공개하지 않음
```

```tsx
// 사용하는 쪽에서는 슬라이스 내부 구조를 알 필요가 없다
import { UserCard, useUser, type User } from '@/entities/user'
```

:::


## 빠른 참조

| 상황 | 레이어 |
|------|--------|
| 로그인/로그아웃 폼과 로직 | `features/auth` |
| 유저 정보를 보여주는 카드 컴포넌트 | `entities/user` |
| 헤더(로고 + 검색 + 유저 메뉴 조합) | `widgets/Header` |
| 공통 버튼, 인풋 컴포넌트 | `shared/ui` |
| 날짜 포맷 유틸 함수 | `shared/lib` |
| 특정 도메인에서만 쓰는 포맷 유틸 | 해당 `entities` 또는 `features` 안 |

## 주의사항

- FSD는 팀 전체가 합의한 후 도입할 때 효과적입니다. 레이어 이름과 경계 기준을 팀 내에서 먼저 맞춰야 합니다.
- 소규모 프로젝트에서 6개 레이어를 모두 사용하는 것은 오버엔지니어링입니다. `shared`, `entities`, `features`, `pages` 정도만 도입하는 것으로도 충분합니다.
- "이게 feature야, entity야?" 하는 판단이 계속 어렵다면 팀 내 기준 문서를 별도로 작성하는 것이 좋습니다.

## 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [@feature-sliced/eslint-config](https://github.com/feature-sliced/eslint-config)
