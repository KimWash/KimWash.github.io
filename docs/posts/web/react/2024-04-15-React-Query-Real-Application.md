---
layout: post
title: "Next.js 에서 react-query 쓰기: Server Rendering & Hydration "
category: React
date: "2024-04-15 20:46:00"
---

<img src="@image/2024-04-15/1.png">


## QueryClientProvider에 캐시된 클라이언트 주입

리액트 쿼리 공식 문서의 “고급 서버 렌더링” 문서를 보고 우선 구현에 들어갔다.

우선 공식 문서에서 하라는대로 QueryClientProvider에 캐시된 쿼리 클라이언트를 넘겨줬다.

특히 staleTime을 지정해줘야 한다.

```tsx
// provider.tsx
'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR에서는 클라이언트에서 바로 다시 refetching 이 일어나는 것을 방지하기 위해
        // staleTime을 0보다 크게 지정한다.
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // 서버는 항상 쿼리 클라이언트를 생성한다. (매 요청마다)
    return makeQueryClient()
  } else {
    // 브라우저에서 쿼리클라이언트가 없을 경우에 새로 만들게 된다.
    // 최초 렌더링 중 suspend 돼도 새로운 쿼리 클라이언트를 생성하지 않고 단일 인스턴스로 이용.
    // QueryClientProvider 아래에 Suspense Boundary가 있다면 필요하지 않을 수 있다.
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function Providers({ children }) {
  // NOTE: 사이에 Suspense Boundary가 없다면 useState를 이용해 쿼리 클라이언트를 초기화하지 마라.
  //       초기 렌더링 시에 에러가 발생하고 바운더리가 없다면 리액트는 쿼리 클라이언트를 날려버릴 것이다.
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// layout.tsx
import Providers from './providers'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
		     {// 앱을 생성한 Provider로 감싼다. }
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

## Hydration API를 이용해 쿼리 클라이언트 dehydrate/hydrate 하기

pages router 환경과 app router 환경 모두 아래와 같은 방식으로 동작한다.

1. 서버 사이드에서 쿼리 클라이언트 인스턴스 생성
2. 쿼리 클라이언트 인스턴스에서 쿼리 prefetch
3. prefetch 된 쿼리가 있는 인스턴스를 dehydrate(직렬화)
4. HydrationBoundary 컴포넌트의 state prop에 dehydrated client를 전달
5. HydrationBoundary 안의 컴포넌트에서 `useQuery` 등 쿼리 사용

pages router와 app router의 차이점은 1,2,3 단계를 어떻게 하느냐의 차이에 있다.

Next.js 공식 문서에서는 app router를 이용하는 경우 데이터를 가져오는 방법에 대해 소개하고 있다. `getServerSideProps`를 이용하는 대신 페이지 컴포넌트를 async로 정의하고, 데이터를 가져오는 함수를 await으로 호출하면 된다.

```tsx
export default async function Page() {
  const res = await fetch('https://...', { next: { tags: ['collection'] } })
  const data = await res.json()
  // ...
}
```

```tsx
// app/posts/page.jsx
export default async function PostsPage() {
  const queryClient = new QueryClient()

	// 쿼리 클라이언트에다가 Prefetching 해두기
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })
  
  return (
	  // 그걸 그대로 직렬화 해서 state 로 지정.
	  // HydrationBoundary는 Client Componenent.
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Posts />
    </HydrationBoundary>
  )
}
```

## `useDehydrateState`로 깔끔하게 이용하기

당연히 wrapping 해서 더 깔끔하게 이용할 수 있다.

```
export default async function useDehydratedState<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(args: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(args);
  
  return dehydrate(queryClient);
}

```

## refetching이 제대로 안된다.

로컬 환경에서는 괜찮은데, 배포하고 나니 CSR 환경에서 refetching 할 때 오류가 발생한다. CSR 환경에서는 API 요청을 브라우저가 날리니까 제대로 동작하지 않을 수 밖에 없다. 그래서 return-fetch로 구성한 `fetchExtended` 함수를 수정해줬다.

```tsx
// Create an extended fetch function
export default returnFetchJson({
  // default options
  baseUrl: "http://localhost:3000",
  interceptors: {
	  // 요청 시 기존 URL 가져와서 baseurl만 바꿔주기
    async request(requestArgs, fetch) {
      const prevUrl = new URL(requestArgs[0]);
      const newUrl =
        typeof window === "undefined"
          ? prevUrl
          : new URL(prevUrl.pathname + prevUrl.search, window.location.origin);

      return [newUrl, requestArgs[1]];
    },
    ...
  },
});
```

## 문자열 날짜 자동으로 파싱하기

아래와 같이 응답으로 넘어온 객체에서 문자열로 된 날짜를 찾아 파싱해주게 했다. 

여러 날짜 컨벤션이 뒤섞인 경우라면 이런 것을 이용하지 않는 것이 낫겠지만, 1인 개발로 진행하는 만큼 적용해보았다.

```tsx
...
const body = handleDates(parseJsonSafely(await response.text()) as T);
...
  
export default function handleDates(data: unknown) {
  if (isIsoDateString(data)) return parseISO(data);
  if (data === null || data === undefined || typeof data !== "object")
    return data;

  for (const [key, val] of Object.entries(data)) {
    if (isIsoDateString(val)) data[key] = parseISO(val);
    else if (typeof val === "object") handleDates(val);
  }

  return data;
}
```

## 데이터 fetching 함수 클래스로 관리하기

아래와 같이 static method로 data fetching 함수를 관리하게 만들어줬다. 덕분에 쿼리 함수 호출부가 깔끔해졌다.

```tsx
export class PostService {
  static async fetchPosts(page: number) {
    return (await fetchExtended<PostListDto[]>("/api/post?page=" + page)).body;
  }
  static async fetchPost(id: number) {
    return (await fetchExtended<PostDetailDto>("/api/post/" + id)).body;
  }
}

```

## 제 프로젝트 디렉토리 구조는요..

우선은 아래와 같이 구성돼있다. page.tsx에서는 쿼리 클라이언트 생성/prefetch/dehydration이 진행될거고,

HydrationBoundary 내부의 HomeContainer.tsx에서는 리액트 쿼리에 의해 자동으로 hydration된 쿼리가 주입돼있어서 바로 `useQuery` 를 이용해 데이터를 이용할 수 있게 된다. 이에 관한 data fetching  함수는 model/PostService.ts에 정의돼있다. 

완벽한 구조는 아니지만 나름 아키텍처에 맞게 레이어 별로 나누고자 했다.  

```tsx
my-own-blog
├── app
│   └── page.tsx // server component
└── components
    ├── container
    │   └── HomeContainer.tsx // client component
    ├── hooks
    │   └── useHomeViewModel.ts
    ├── model
    │   └── PostService.ts
    └── queries
        └── usePostListQuery.ts
```

## 느낀 점

음.. 생각보다 SSR과 react-query를 함께 이용하는 것이 만만치 않은 것이라는 것을 알게 되었다.

그리고 next.js 의 SSR과 hydration에 대해 조금 더 알아보고 싶다는 생각이 들었다.

그래도 나름 큰 성과는, 한가지 목표를 위해 여러 개의 영어로 된 공식 문서들을 해석하면서 이해하고, 실제 적용해보고, 문제 상황에 맞게 바꿔볼 수 있는 기회가 되어서 좋았다.