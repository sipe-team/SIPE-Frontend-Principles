# Compound Components로 복합 UI 설계하기

Compound Components는 여러 하위 컴포넌트를 하나의 UI 단위로 묶는 패턴이다. 부모 컴포넌트는 함께 쓰는 상태와 동작을 관리하고, 하위 컴포넌트는 필요한 값만 꺼내 각자의 역할을 수행한다.

## 규칙: 관련된 하위 컴포넌트를 맥락으로 단위로 묶으세요

`Tabs`, `Accordion`, `Select`, `Menu`, `Modal`처럼 여러 파트가 하나의 상태를 기준으로 함께 움직이는 UI는 하나의 거대한 컴포넌트보다 역할이 나뉜 하위 컴포넌트 구조가 더 적합하다. 호출하는 쪽은 구조를 선언적으로 배치하고, 내부 구현은 파트 간 협력을 책임진다.

:::tabs
== Bad

```tsx
function Tabs({
  items,
  activeValue,
  layout = "horizontal",
  showDivider = false,
  renderTrigger,
  renderPanel,
}: TabsProps) {
  return (
    <section data-layout={layout} data-divider={showDivider}>
      {items.map((item) => (
        <div key={item.value}>
          {renderTrigger ? renderTrigger(item) : item.label}
          {activeValue === item.value && (
            <div>{renderPanel ? renderPanel(item) : item.content}</div>
          )}
        </div>
      ))}
    </section>
  );
}
```

== Good

```tsx
<Tabs defaultValue="profile">
  <Tabs.List>
    <Tabs.Trigger value="profile">프로필</Tabs.Trigger>
    <Tabs.Trigger value="security">보안</Tabs.Trigger>
  </Tabs.List>

  <Tabs.Panel value="profile">프로필 내용</Tabs.Panel>
  <Tabs.Panel value="security">보안 내용</Tabs.Panel>
</Tabs>
```

:::

Bad 예시는 `Tabs` 하나가 데이터, 배치 옵션, 트리거 렌더링, 패널 렌더링을 모두 받는다. Good 예시는 `Tabs.List`, `Tabs.Trigger`, `Tabs.Panel`이 각각 자기 역할을 드러내고, 사용하는 쪽이 필요한 구조를 직접 조립한다.

## 규칙: 함께 쓰는 상태는 부모에서 관리하세요

Compound Components의 핵심은 단순히 `children`을 받는 것이 아니라 관련 하위 컴포넌트들이 같은 상태를 함께 쓴다는 점이다. 부모가 선택된 값 같은 상태를 관리하고, 하위 컴포넌트는 context를 통해 필요한 값과 변경 함수를 꺼내 쓴다.

```tsx
const TabsContext = createContext<TabsContextValue | null>(null);

function Tabs({ defaultValue, children }: TabsProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      {children}
    </TabsContext.Provider>
  );
}

function TabsTrigger({ value, children }: TabsTriggerProps) {
  const tabs = useTabsContext();
  const selected = tabs.value === value;

  return (
    <button
      role="tab"
      aria-selected={selected}
      onClick={() => tabs.setValue(value)}
    >
      {children}
    </button>
  );
}
```

중간 컴포넌트가 `activeValue`, `onChange`를 계속 전달하지 않아도 되므로 각 파트의 역할이 선명해진다.

## 규칙: 자식 요소를 강제로 변형하지 마세요

`Children`과 `cloneElement`로 자식에게 props를 주입하는 방식도 가능하지만 데이터 흐름을 추적하기 어렵고 구조 변화에 약하다. 기본 구현은 context 기반으로 두고, 자식 요소를 직접 변형하는 방식은 예외적으로만 사용한다.

## 빠른 참조

| 상황                                      | 권장 설계                                                        |
| ----------------------------------------- | ---------------------------------------------------------------- |
| 여러 파트가 하나의 상태를 공유함          | Compound Components + context                                    |
| 호출자가 UI 구조를 선언적으로 배치해야 함 | `Tabs.List`, `Tabs.Trigger`, `Tabs.Panel` 같은 하위 컴포넌트 API |
| 중간 컴포넌트가 props를 전달만 함         | 부모 context로 공유 상태 제공                                    |
| 자식에게 props를 자동 주입하고 싶음       | `cloneElement`보다 context 우선                                  |

## 주의사항

- 관련 파트가 실제로 협력할 때만 적용한다.
- 독립적인 컴포넌트를 억지로 하나의 사용 단위로 묶지 않는다.
- 이 문서는 generic `children`, render props, slot 선택 기준을 다루지 않는다.
- 상태를 어디에 둘지에 대한 일반 원칙은 상태 관리 문서에서 다룬다.
- `Tabs`, `Accordion`, `Menu`, `Modal`에는 ARIA 역할과 키보드 상호작용이 함께 따라와야 한다.

## 참고 자료

- [React 공식 문서 - Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)
- [React 공식 문서 - Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
- [React 공식 문서 - Children](https://react.dev/reference/react/Children)
- [React 공식 문서 - cloneElement](https://react.dev/reference/react/cloneElement)
- [Patterns.dev - Compound Pattern](https://www.patterns.dev/react/compound-pattern/)
- [Epic React - Compound Components: Truly Flexible React APIs](https://www.epicreact.dev/compound-components-truly-flexible-react-apis-5nu15)
- [WAI-ARIA APG Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
