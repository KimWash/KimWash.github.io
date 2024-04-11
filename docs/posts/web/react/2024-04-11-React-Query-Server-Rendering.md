---
layout: post
title: "Next.js 에서 react-query 쓰기: Server Rendering & Hydration "
category: React
date: "2024-04-11 22:25:00"
---
<img src="@image/2024-04-11/1.png">


### 서버 렌더링과 리액트 쿼리

서버 렌더링이란 서버에서 최초 HTML을 생성하는 동작으로, 사용자는 페이지가 로드되는 대로 내용을 볼 수 있게 된다. 페이지에 대한 요청에 따라 일어나게 된다. 또한 이전 요청이 캐시됐거나 빌드 시점에 발생할 수도 있다. CSR을 이용할 때에는 아래와 같이 요청 폭포 현상이 발생한다. 빈 HTML을 렌더하고, 리액트 프레임워크와 애플리케이션 모듈, 쿼리까지 세 단계의 폭포가 발생된다.

```jsx
1. |-> Markup (without content)
2.   |-> JS
3.     |-> Query
```

반면 서버 렌더링은 내용과 초기 데이터를 포함한 HTML을 렌더한다. 따라서 사용자는 콘텐츠를 볼 수 있게 된다. 그리고 JS 로딩까지 완료되면 상호작용이 가능해지고 클릭 가능해진다. 데이터가 stale 해지거나 모종의 이유로 데이터를 다시 불러와야 하기 전까지는 쿼리를 다시 날릴 필요가 없다.

클라이언트 관점에서는 이 과정을 가진다. 서버에서는 마크업을 생성하고 렌더링하기 전에 데이터를 미리 가져와야 한다. 그 과정에서 마크업에 삽입할 수 있는 직렬화된 포맷으로 ‘dehydrate’ 시키고, 클라이언트에서는 리액트 쿼리 캐시로 ‘hydrate’ 시켜 클라이언트에서 새로운 요청을 날리는 것을 방지하게 된다.

### 최초 설정

리액트 쿼리를 이용하는 첫번째 작업은 항상 `queryClient` 를 만들고 애플리케이션을 `<QueryClientProvider>` 로 감싸는 것이다. 서버 렌더링을 진행하는 동안 `queryClient` 인스턴스를 **루트 레벨이 아닌 앱 레벨에서, 리액트 상태나 ref로서 생성하는 것이 중요하다.** 그래야 각각 다른 사용자나 요청 별로 데이터가 공유되는 것을 막을 수 있다.

### `initialData` 로 시작하기

`dehydrate/hydrate` API나 리액트 쿼리에서 prefetching을 하는 대신 Next.js의 `getServerSideProps` 함수나 Remix의 `loader` 함수를 이용해 데이터를 로드해와 `initialData` 로 지정해주는 것이다. 하지만 이 방법의 경우 몇가지 단점이 있다.

- useQuery를 하위 컴포넌트에서 호출하는 경우 `initialData` 를 그 지점까지 내려보내줘야 한다.
- useQuery를 같은 쿼리로 여러 곳에서 호출하는 경우, 그 중 한 곳에만 `initialData`  를 내려보내면 앱에 변경이 생기면 부숴지기 쉽다.
- 서버에서 언제 데이터를 가져왔는지 알 방법이 없어 데이터의 프레시함을 판단하는 `dataUpdatedAt` 필드에 값이 없다.
- 이미 쿼리에 캐시가 있는 경우,  `initialData` 가 더 예전 데이터인 경우에도 덮어씌우게 된다.
    - 이게 왜 문제가 되냐면, `getServerSideProps` 는 페이지 이동 간에 여러번 호출이 되고, 클라이언트 사이드의 캐시는 덮어씌워질 것이다.

따라서 full hydration을 구축할 필요가 있다.

### Hydration API를 이용하기

조금 더 귀찮은 과정을 거치면, `queryClient` 를 이용해 사전로딩 과정에 쿼리를 미리 가져와 `queryClient` 의 직렬화된 버전을 앱의 렌더링 부분으로 넘기고 그 곳에서 재사용한다. 이것은 위의 단점을 해결한다. hydration api를 이용하는 과정은 아래와 같다.

- 프레임워크의 loader 함수에서 `queryClient` 를 생성한다.
- loader 함수에서 `await queryClient.prefetchQuery(...)` 를 호출한다. (이 때 데이터가 가져와지지 않아도 괜찮다. 어차피 클라이언트에서 가져올 것이다.)
- loader 함수에서 `dehydrate(queryClient)` 를 반환한다. 물론 문법은 프레임워크 별로 다르다.
- 애플리케이션 트리를 `<HydrationBoundary state={dehydratedState}>` 로 감싸는데, 이 때 `dehydratedState` 는 loader 함수에서 가져온 것이다.

이 다음 글에서는 본격적으로 Next.js 13 이상 버전에서 도입된 "App Router" 환경에 react-query를 도입해 볼 것이다.