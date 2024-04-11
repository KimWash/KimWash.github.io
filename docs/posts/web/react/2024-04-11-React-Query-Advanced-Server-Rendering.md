---
layout: post
title: "Next.js 에서 react-query 쓰기: Advanced Server Rendering"
category: React
date: "2024-04-11 23:45:00"
---
<img src="@image/2024-04-11/2.png">

### 서버 컴포넌트와 Next.js 앱 라우터

서버 컴포넌트는 초기 페이지 렌더 및 페이지 전환 시 모두 서버에서만 구동되는 컴포넌트이다. 서버 컴포넌트의 동작 방식은 서버에서만 돌아가고, 데이터만을 반환한다는 점에서 Next.js의 `getServerSideProps` 나 `getStaticProps` , 혹은 Remix의 `loader` 함수가 동작하는 것과 같지만, 서버 컴포넌트는 더 많은 것을 할 수 있다. 어쨌든 데이터 부분은 리액트 쿼리의 중심이다.

pages router 환경에서 Hydration API를 이용하는 방법을 어떻게 Next.js의 app router에 적용할 수 있을까? 가장 나은 방법은 서버 컴포넌트를 “그냥” 또 다른 프레임워크 로더로서 생각하는 것이다.

### 전문 용어에 관한 빠른 설명

지금까지 이 가디드에서 “서버”와 “클라이언트”에 대해 이야기해 왔다. 혼란스럽게도, 서버 컴포넌트와 클라이언트 컴포넌트가 “서버”와 “클라이언트”에 1대1로 매칭되지 않는 점이 중요하다. 서버 컴포넌트는 서버에서 돌아가기를 보장받는다. 하지만 클라이언트 컴포넌트는 사실 서버와 클라이언트 모두에서 돌아갈 수 있다. 왜냐하면 클라이언트 컴포넌트는 최초 서버 렌더링 과정에서도 렌더 되기 때문이다.

서버 컴포넌트는 렌더되지만, 이 동작은 항상 **서버에서** “loader 단계” 에서만 실행된다. 반면에 클라이언트 컴포넌트는 “application 단계” 에서 실행되는데, 애플리케이션은 서버에서 SSR 중에서도 실행될 수 있고, 클라이언트 단인 브라우저에서도 실행될 수 있다. 

*첨언: 사실 당연한 이야기 아닌가..? 

### 최초 설정

당연히 `queryClient` 생성부터 시작한다.

```jsx
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
```

```jsx
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

### Pre-fetching 하고 데이터 de-hydrate 하기

아래는 pages router를 이용한 예제이다.

여기에서 핵심 요소만 빼서 그대로 App Router로 이전이 가능하다.

```tsx
// This could also be getServerSideProps
export async function getStaticProps() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}
function Posts() {

  const { data } = useQuery({ queryKey: ['posts'], queryFn: getPosts })
  
  const { data: commentsData } = useQuery({
    queryKey: ['posts-comments'],
    queryFn: getComments,
  })
// ...
}
export default function PostsRoute({ dehydratedState }) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <Posts />
    </HydrationBoundary>
  )
}

```

```jsx
// app/posts/page.jsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import Posts from './posts'

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

### 적용해보고 나니

SSR 개념에 조금 더 한발짝 다가갈 수 있었고, Next.js 의 서버 컴포넌트와 클라이언트 컴포넌트 개념에 대해 조금 더 심도 있는 이해를 하게 됐다. 그리고 쿼리클라이언트를 직렬화해서 클라이언트 컴포넌트 단에 내려주고, 클라이언트에 있는 캐시를 이용할 생각을 한건 정말 기발한 생각인 것 같다.

### 과제

아직 여러가지 해결할 과제들이 남아있다.

페이지 파일과 실제 UI 컴포넌트를 나눴는데, 이 파일들을 어떻게 정리하고 아키텍처화 할지도 고민이고,

공식문서에 아직 더 남아 있는 쿼리클라이언트 캐싱이라던가 해볼 것들이 조금 있다.

우선은 이걸로 충분해 보이는데, 부족한 점이 더 발견돼서 수정할 수도 있다.

그리고 아래 블로그에서 본 코드를 드디어 이해할 수 있게 되었고, experimental 기능인 스트리밍도 눈여겨볼 만 하다고 생각돼 단순 구현이 아닌 더 나은 코드 품질로 이어지게 고민해봐야겠다.

[[React-Query] Next.js app router에서 사용하면서 고민했던 것들](https://soobing.github.io/react/next-app-router-react-query/)