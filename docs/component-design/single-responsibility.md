# 단일 책임 원칙으로 컴포넌트 경계 세우기

단일 책임 원칙(Single Responsibility Principle, SRP)은 "하나의 모듈은 하나의 변경 이유만 가져야 한다"는 원칙이다. React 컴포넌트에 적용하면 컴포넌트가 담당하는 역할을 변경 이유가 같은 단위로 묶고, 변경 이유가 다른 역할은 분리하는 것을 의미한다.

컴포넌트의 크기보다 중요한 기준은 "왜 바뀌는가"다. 코드가 조금 길어도 같은 이유로 함께 바뀐다면 하나의 책임으로 볼 수 있고, 코드가 짧아도 서로 다른 이유로 바뀐다면 분리를 고려한다.

## 규칙: 변경 이유가 다르면 컴포넌트를 분리하세요

한 컴포넌트 안에 썸네일, 상품 설명, 가격 표시, 구매 버튼의 세부 구현이 모두 들어 있으면 작은 변경에도 전체 컴포넌트를 다시 읽어야 한다. 각 영역이 다른 이유로 바뀐다면 별도 컴포넌트로 나눈다.

:::tabs
== Bad

```tsx
function ProductCard({ product }: { product: Product }) {
  const isSoldOut = product.stock === 0;
  const discountPercent = product.discountRate * 100;
  const discountedPrice = product.price * (1 - product.discountRate);

  return (
    <article>
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>

      {product.discountRate > 0 && <strong>{discountPercent}% 할인</strong>}
      <p>{discountedPrice.toLocaleString()}원</p>

      <button disabled={isSoldOut}>
        {isSoldOut ? "품절" : "장바구니 담기"}
      </button>
    </article>
  );
}
```

== Good

```tsx
function ProductCard({ product }: { product: Product }) {
  return (
    <article>
      <ProductThumbnail product={product} />
      <ProductSummary product={product} />
      <ProductPrice price={product.price} discountRate={product.discountRate} />
      <ProductAction stock={product.stock} />
    </article>
  );
}

function ProductThumbnail({ product }: { product: Product }) {
  return <img src={product.imageUrl} alt={product.name} />;
}

function ProductSummary({ product }: { product: Product }) {
  return (
    <>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
    </>
  );
}

function ProductPrice({
  price,
  discountRate,
}: {
  price: number;
  discountRate: number;
}) {
  const discountedPrice = price * (1 - discountRate);

  return (
    <div>
      {discountRate > 0 && <strong>{discountRate * 100}% 할인</strong>}
      <p>{discountedPrice.toLocaleString()}원</p>
    </div>
  );
}

function ProductAction({ stock }: { stock: number }) {
  const isSoldOut = stock === 0;

  return (
    <button disabled={isSoldOut}>{isSoldOut ? "품절" : "장바구니 담기"}</button>
  );
}
```

:::

`ProductCard`는 상품 카드의 전체 배치만 담당한다. 썸네일 표시 방식이 바뀌면 `ProductThumbnail`, 가격 정책이 바뀌면 `ProductPrice`, 품절 버튼 문구가 바뀌면 `ProductAction`만 수정하면 된다.

## 규칙: 컴포넌트 설명에 "그리고"가 많아지면 분리하세요

컴포넌트를 설명할 때 "썸네일을 그리고, 가격을 계산하고, 버튼 상태를 정하고, 카드 레이아웃을 렌더링한다"처럼 `그리고(and)`가 반복된다면 책임이 섞였을 가능성이 크다. 다만 무조건 파일을 많이 나누는 것이 목표는 아니다. 책임 분리는 변경 이유를 기준으로 판단한다.

- **같이 두어도 되는 경우**: 같은 UI 조각을 표현하기 위한 마크업, 스타일, 간단한 조건부 렌더링
- **분리해야 하는 경우**: 카드 레이아웃과 가격 정책, 썸네일 표시와 액션 버튼, 리스트 배치와 아이템 표현
- **아직 분리하지 않아도 되는 경우**: 컴포넌트가 작고 변경 이유가 하나이며, 분리했을 때 오히려 추적해야 할 파일만 늘어나는 경우

## 빠른 참조

| 코드 냄새                                | 개선 방법                                    |
| ---------------------------------------- | -------------------------------------------- |
| 컴포넌트 이름보다 내부 역할이 훨씬 많음  | 변경 이유가 다른 영역을 하위 컴포넌트로 분리 |
| 한 영역 수정이 주변 JSX까지 함께 건드림  | 해당 영역을 독립 컴포넌트로 분리             |
| 특정 정책 계산이 마크업 사이에 섞여 있음 | 정책을 표현하는 작은 컴포넌트로 분리         |
| 컴포넌트를 한 문장으로 설명하기 어려움   | 변경 이유가 다른 책임을 별도 컴포넌트로 분리 |

## 주의사항

- 상태를 어디에 둘지는 상태 관리 문서에서 다룬다.
- 커스텀 훅 추출 기준은 훅 설계 문서에서 다룬다.
- props 네이밍과 `children`, render props, slot 선택 기준은 Props/인터페이스 문서에서 다룬다.
- 이 문서에서는 컴포넌트의 변경 이유와 책임 경계만 다룬다.

## 체크리스트

- 이 컴포넌트를 한 문장으로 설명할 수 있나요?
- 변경 요청자가 달라지는 책임이 섞여 있지 않나요? 예: 디자이너의 UI 변경, 백엔드의 API 변경, 기획자의 정책 변경
- 컴포넌트 내부의 주요 영역들이 서로 다른 이유로 변경되지 않나요?
- 분리 후 각 컴포넌트 이름이 자기 책임을 명확히 드러내나요?
- 분리했을 때 오히려 파일 이동만 늘어나는 과한 추상화는 아닌가요?

## 참고 자료

- [React 공식 문서 - Thinking in React](https://react.dev/learn/thinking-in-react)
- [Single Responsibility Principle in React: The Art of Component Focus](https://cekrem.github.io/posts/single-responsibility-principle-in-react/)
- [[번역] 리액트에서의 단일 책임 원칙: 컴포넌트 집중의 기술](https://velog.io/@eunbinn/single-responsibility-principle-in-react)
