# 한 훅의 책임 범위 정하기

좋은 훅은 이름과 반환값만 보고도 무엇을 하고 무엇을 하지 않는지 대략 감이 와야 합니다. React 공식 문서도 커스텀 훅은 상태를 같이 쓰는 수단이 아니라, 상태를 다루는 로직을 나누어 쓰는 방법이라고 설명합니다.

## 규칙: 훅은 상태를 공유하는 도구가 아니라 로직을 나누는 방법입니다

- 같은 훅을 두 번 호출해도 두 호출은 서로 독립적으로 동작합니다
- 여러 컴포넌트가 같은 값을 공유해야 한다면 기준이 되는 상태를 어디에 둘지 먼저 정해야 합니다
- 상태 공유 문제를 훅 추출로 해결하려 하면 동기화 버그가 생기기 쉽습니다

여러 컴포넌트가 같은 상태를 봐야 한다면 훅 추출보다 상태 끌어올리기, Context, 외부 스토어 중 무엇이 맞는지 먼저 판단하세요.

## 규칙: 훅 이름과 반환 계약이 예측 가능해야 합니다

훅 이름만 보고도 어떤 값을 돌려주고 어떤 부수 효과를 감출지 대략 예상할 수 있어야 합니다. 데이터를 가져오는 훅이 화면 이동까지 해버리거나, 반환값이 지나치게 많아 호출부가 무엇을 믿어야 할지 모르게 만들면 설계가 흔들립니다. 다만 `useUserQuery`처럼 라이브러리에서 익숙한 계약을 그대로 따르는 경우에는, 이름이 충분히 구체적이라면 전체 결과 객체를 반환해도 괜찮습니다.

:::tabs
== Bad
```tsx
function useUser() {
  const router = useRouter()
  const query = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  })

  useEffect(() => {
    if (query.isError) {
      router.replace('/login')
    }
  }, [query.isError, router])

  return query.data
}
```

== Good
```tsx
function useUserQuery() {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  })
}

function ProfilePage() {
  const router = useRouter()
  const userQuery = useUserQuery()

  useEffect(() => {
    if (userQuery.isError) {
      router.replace('/login')
    }
  }, [userQuery.isError, router])
}
```
:::

## 규칙: 한 훅에는 한 가지 주된 변경 이유만 남기세요

폼 상태, 서버 요청, 라우팅, 토스트는 자주 함께 등장하지만 항상 같은 이유로 바뀌는 것은 아닙니다. 이런 로직이 한 훅에 섞이면 수정 범위가 넓어지고, 호출부는 숨겨진 부수 효과를 따라가야 합니다. 페이지 단위 훅을 만드는 것 자체가 문제는 아니지만, 그 안에서 숨기는 책임의 수는 신중하게 제한해야 합니다.

:::tabs
== Bad
```tsx
function useCheckoutPage() {
  const form = useForm<OrderFormValues>()
  const router = useRouter()

  const submit = async (values: OrderFormValues) => {
    await submitOrder(values)
    toast.success('주문이 완료되었어요.')
    router.push('/complete')
  }

  return { form, submit }
}
```

== Good
```tsx
function useCheckoutForm() {
  return useForm<OrderFormValues>()
}

function useSubmitOrder() {
  return useMutation({
    mutationFn: submitOrder,
  })
}

function CheckoutPage() {
  const router = useRouter()
  const form = useCheckoutForm()
  const submitOrderMutation = useSubmitOrder()

  const handleSubmit = form.handleSubmit(async (values) => {
    await submitOrderMutation.mutateAsync(values)
    toast.success('주문이 완료되었어요.')
    router.push('/complete')
  })
}
```
:::

## 빠른 참조

| 코드 냄새 | 개선 방법 |
|----------|----------|
| 상태 공유 문제를 훅 추출로 해결하려 함 | 상태 끌어올리기, Context, 외부 스토어 검토 |
| 훅 이름과 실제 동작이 다름 | 이름과 책임을 다시 맞추기 |
| 훅 하나가 `fetch`, `form`, `navigation`, `toast`를 모두 담당 | 변화 이유별로 분리 |
| 반환값이 너무 많아 호출부에서 다시 분해 | 계약 축소 또는 작은 훅으로 분리 |

## 체크리스트

- 이 훅은 상태를 같이 쓰기 위한 것인가, 로직을 나누기 위한 것인가?
- 이 훅을 한 문장으로 설명할 수 있나요?
- 반환값을 처음 보는 사람도 역할을 추측할 수 있나요?
- 다른 이유로 바뀌는 로직이 한 훅에 섞여 있지 않나요?

## 참고 자료

- [React 공식 문서 - Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React 공식 문서 - Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
