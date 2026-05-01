# 작은 훅을 조합해 유스케이스 구성하기

React와 Toss의 공개 라이브러리를 보면, 훅 합성의 목적은 "더 잘게 쪼개기"보다 "호출부를 더 단순하게 만드는 것"에 가깝습니다. `overlay-kit`은 반복적인 상태 관리와 이벤트 처리를 감추고, `use-funnel`은 복잡한 단계 흐름을 하나의 분명한 인터페이스로 다룹니다.

## 규칙: 작은 훅은 관심사별로 나누고, 조합 훅은 한 가지 사용자 흐름을 설명해야 합니다

작은 훅은 폼 상태, 서버 요청, 온라인 상태, 스크롤 잠금처럼 한 관심사만 다룹니다. 조합 훅은 이런 훅을 묶어 `게시글 작성`, `결제 진행`, `회원가입 흐름`처럼 한 가지 사용자 흐름을 설명할 때만 의미가 있습니다.

- `useState` 하나마다 훅을 만드는 방식은 합성이라기보다 잘게 쪼개는 데 가깝습니다
- 단계 전환, 뒤로 가기 흐름, 라우터 연동이 함께 움직인다면 `use-funnel`처럼 흐름 자체를 다루는 훅이 더 잘 맞을 수 있습니다
- 같은 훅 안에 도메인 상태와 화면 전용 상태를 별 고민 없이 섞지 마세요

## 규칙: 조합 훅은 읽기 쉬운 계약을 만들고, 화면 부수 효과는 대체로 호출부에 남기세요

페이지 단위 훅 자체가 문제는 아닙니다. 다만 조합 훅이 라우팅, 토스트, 모달 닫기까지 모두 숨기기 시작하면 호출부는 무엇이 일어나는지 알기 어려워집니다. 반대로 `form`과 `mutation`을 한 객체에 담아 되돌려주는 정도라면 합성의 이점도 크지 않습니다. 조합 훅은 내부 도구를 그대로 노출하기보다, 호출부가 바로 쓸 수 있는 목적 단위의 동작을 만드는 편이 낫습니다.

:::tabs
== Bad
```tsx
function useCreatePostPage() {
  const form = usePostForm()
  const mutation = useCreatePostMutation()

  return { form, mutation }
}
```

== Good
```tsx
function useCreatePostForm() {
  const form = usePostForm()
  const mutation = useCreatePostMutation()

  const submit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values)
  })

  return {
    form,
    submit,
    isSubmitting: mutation.isPending,
  }
}

function CreatePostPage() {
  const router = useRouter()
  const { form, submit, isSubmitting } = useCreatePostForm()

  const handleSubmit = async () => {
    await submit()
    toast.success('게시글이 등록되었어요.')
    router.push('/posts')
  }

  return (
    <PostEditor
      form={form}
      onSubmit={handleSubmit}
      disabled={isSubmitting}
    />
  )
}
```
:::

## 규칙: 조합 훅이 세터와 플래그만 늘린다면 경계를 다시 보세요

좋은 조합 훅은 호출부에서 "무엇을 하는지"를 바로 읽히게 만듭니다. `overlay-kit`이 반복적인 이벤트 처리와 상태 전이를 목적에 맞는 API로 바꾸는 것처럼, 조합 훅도 내부 훅을 한곳에 모아 다시 내보내는 데서 끝나면 안 됩니다.

- `usePageState()`처럼 지나치게 넓은 이름은 책임을 흐립니다
- 호출부가 세터와 내부 플래그를 전부 알아야 한다면 훅 경계가 너무 얕습니다
- `form`, `query`, `mutation`을 그대로 되돌려주기만 한다면 합성의 이점이 약합니다
- 반환값이 지나치게 많다면 훅을 다시 나누거나, 반대로 더 높은 수준의 인터페이스가 맞는지 검토하세요

## 빠른 참조

| 코드 냄새 | 개선 방법 |
|----------|----------|
| `useState` 하나마다 훅을 만드는 식의 과도한 분해 | 관심사 단위로 다시 묶기 |
| 페이지 이름만 달고 모든 로직을 담은 거대한 훅 | 작은 훅으로 나누고 유스케이스 단위로 조합 |
| 내부 훅을 그대로 모아 되돌려주기만 하는 조합 훅 | 목적 단위의 동작과 파생 상태로 계약 재설계 |
| 조합 훅이 라우팅/토스트까지 수행 | 화면 부수 효과는 호출부로 이동 |
| 단계 전환과 뒤로 가기 흐름을 직접 조립하는 복잡한 화면 | 흐름 전용 조합 훅 또는 전용 라이브러리 검토 |
| 반환값이 너무 많아 다시 분해해서 사용 | 조합 경계 축소 또는 더 높은 수준의 인터페이스 검토 |

## 참고 자료

- [React 공식 문서 - Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [toss/overlay-kit](https://github.com/toss/overlay-kit)
- [toss/use-funnel](https://github.com/toss/use-funnel)
