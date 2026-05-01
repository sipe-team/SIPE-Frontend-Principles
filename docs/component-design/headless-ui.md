# Headless UI 패턴으로 로직과 표현 분리하기

Headless UI는 동작, 접근성, 상태 관리는 컴포넌트가 맡고 마크업과 스타일은 사용하는 쪽이 결정하게 하는 설계다. 같은 동작을 여러 디자인으로 재사용해야 할 때, 컴포넌트를 "기능이 있는 뼈대"와 "표현"으로 나누어 확장성을 확보한다.

## 규칙: 동작과 마크업을 한 컴포넌트에 묶지 마세요

컴포넌트 내부에 색상, 간격, 레이아웃, 그림자 같은 시각적 결정이 고정되면 다른 화면에서 같은 동작을 재사용하기 어렵다. Headless UI는 열림/닫힘, 선택, 포커스, 키보드 조작 같은 동작만 제공하고 표현은 사용하는 쪽에 맡긴다.

:::tabs == Bad

```tsx
function UserMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        className="rounded-full bg-slate-900 px-4 py-2 text-white"
        onClick={() => setOpen((value) => !value)}
      >
        프로필
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-white p-2 shadow-lg">
          <a className="block rounded-lg px-3 py-2 text-sm" href="/profile">
            내 정보
          </a>
          <button className="block w-full rounded-lg px-3 py-2 text-left text-sm">
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
```

== Good

```tsx
function UserMenu() {
  return (
    <Menu>
      <Menu.Trigger className="rounded-full bg-slate-900 px-4 py-2 text-white">
        프로필
      </Menu.Trigger>

      <Menu.Content className="rounded-xl border bg-white p-2 shadow-lg">
        <Menu.Item asChild>
          <a className="block rounded-lg px-3 py-2 text-sm" href="/profile">
            내 정보
          </a>
        </Menu.Item>
        <Menu.Item className="block w-full rounded-lg px-3 py-2 text-left text-sm">
          로그아웃
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
```

:::

Bad 예시는 메뉴의 동작과 디자인이 `UserMenu` 안에 강하게 묶여 있다. Good 예시는 `Menu` 계열 컴포넌트가 열림/닫힘, 포커스, 키보드 조작, ARIA 계약을 담당하고, 사용하는 쪽이 `className`과 마크업을 결정한다.

## 규칙: 상태는 스타일링 가능한 레이어로 노출하세요

Headless UI는 보이지 않는 컴포넌트가 아니다. 상태를 외부에서 스타일링할 수 있도록 `data-state`, `data-selected`, `data-disabled` 같은 표면을 제공해야 한다. 상태가 밖으로 드러나야 사용하는 쪽에서 디자인만 바꿔도 동작은 그대로 유지된다.

```tsx
function MenuTrigger({ open, ...props }: MenuTriggerProps) {
  return (
    <button
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      {...props}
    />
  );
}

function MenuItem({ disabled, ...props }: MenuItemProps) {
  return <button data-disabled={disabled} disabled={disabled} {...props} />;
}
```

- 열림/닫힘은 `data-state="open"`처럼 노출한다.
- 선택됨, 비활성, 하이라이트 같은 상태는 스타일링 가능한 속성으로 드러낸다.
- 상태를 노출하되 상태 변경 방식 자체를 사용처마다 다시 구현하게 만들지 않는다.

## 규칙: 접근성과 키보드 동작은 컴포넌트 계약에 포함하세요

Headless UI의 가치는 스타일 자유도보다 먼저 접근성에 있다. `role`, `aria-*`, 포커스 이동, 키보드 조작은 선택 사항이 아니라 컴포넌트가 기본으로 보장해야 하는 계약이다.

- `Escape`로 닫기, 방향키 이동, 포커스 복귀 같은 키보드 동작을 정의한다.
- WAI-ARIA 패턴에 맞는 역할과 속성을 기본값으로 제공한다.
- 접근성을 사용하는 쪽의 스타일 코드에 떠넘기지 않는다.

## 빠른 참조

| 상황                                                 | 판단                                 |
| ---------------------------------------------------- | ------------------------------------ |
| 동작은 같지만 디자인만 화면마다 다름                 | Headless UI로 분리                   |
| open, selected, disabled 상태에 따라 스타일이 달라짐 | `data-*` 속성으로 상태 노출          |
| 포커스, 키보드, ARIA 처리가 필요한 위젯              | 컴포넌트 계약에 접근성 포함          |
| 단순 정적 UI                                         | Headless 패턴보다 일반 컴포넌트 유지 |

## 주의사항

- 모든 컴포넌트를 Headless로 만들 필요는 없다.
- 기본 스타일을 강하게 고정하면 Headless UI의 장점이 줄어든다.
- 이 문서는 커스텀 훅 추출 기준이나 상태 관리 전략을 다루지 않는다.
- `children`, render props, slot 선택 기준은 Props/인터페이스 문서에서 다룬다.
- 복합 컴포넌트의 가족 API 설계는 Compound Components 문서에서 다룬다.

## 참고 자료

- [Headless UI](https://headlessui.com/)
- [Radix Primitives - Introduction](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [Radix Primitives - Styling](https://www.radix-ui.com/primitives/docs/guides/styling)
- [React Aria - Getting started](https://react-spectrum.adobe.com/react-aria/getting-started.html)
- [Headless Component: a pattern for composing React UIs](https://martinfowler.com/articles/headless-component.html)
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
