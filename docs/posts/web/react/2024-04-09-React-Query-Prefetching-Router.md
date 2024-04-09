---
layout: post
title: "Next.js 에서 react-query 쓰기: Prefetching"
category: React
date: "2024-04-09 23:15:00"
---

<img src="@image/2024-04-08/1.png">
prefetching은 당연하지만 pre+fetching의 합성어로, 미리 데이터를 가져오는 것을 의미한다. prefetching을 이용하는 목적은 요청 폭포 현상을 막는 데에 있다. 따라서, 쿼리를 이용하는 컴포넌트가 렌더되기 전에 데이터를 먼저 가져와 놓는 것이다.

prefetching 패턴은 네가지 정도가 있다.

1. 이벤트 핸들러에서
2. 컴포넌트에서
3. 라우터와의 연동을 통해
4. 서버 렌더링 중에 (라우터 연동의 다른 형태)

### `prefetchQuery` 와 `prefetchInfiniteQuery` 에 대해

이 함수들은 쿼리 클라이언트에 설정된  `staleTime` 을 이용하거나 별도로 설정한 값을 이용해 존재하는 데이터가 fresh한지, stale해져 다시 가져와야하는지를 판단한다.

이 함수들은 아무런 값도 반환하지 않는다.

### 컴포넌트에서 Prefetch 하기

앞전에 쿼리 클라이언트의 두 메서드에 대해 설명해서 다소 헷갈릴 수 있는데, 본질적으로 prefetching ‘개념’은 데이터를 미리 가져와 캐시에 넣어두고, 쿼리를 이용하는 컴포넌트가 렌더되는 시점에 캐시가 유효해 그 값을 이용하게 하는 것이다. 따라서 아래와 같이 구성 가능하다.

```jsx
function Parent({id}) {
	const firstQuery = useQuery({
		queryKey: ['first', id]
	});
	
	useQuery({
		queryKey: ['second', id],
		// 쿼리 변동에 의한 리렌더 방지
		notifyOnChangeProps: [],
	});
	
	if (firstQuery.isPending) return 'loading';
	return <Child parentData={firstQuery.data}/>
} 
function Child({parentData}) {
	// 부모에서 캐싱된 값을 이용할 것 (staleTime이 지나지 않아 렌더됐다면)
	const secondQuery = useQuery({
		queryKey: ['second', parentData.id]
	});
	...
}
```

Suspense와 함께 prefetch를 이용하려면 우선 `useSuspenseQueries` 가 생각난다. 하지만  `useSuspenseQueries`  는 prefetch가 렌더링을 막아버리므로 사용하면 안된다. `useQuery` 도 사용하면 안된다. suspenseful query가 처리되기 전까지 prefetch를 시작하지 않을 것이기 때문이다.

[Suspense](https://www.notion.so/Suspense-d240fc6abfbe43f7bde93b190298d09c?pvs=21)

그래서 아래와 같이 usePrefetchQuery를 만들어서 호출한다. 이 방식의 장점은 `useSuspenseQueires` 뿐 아니라 `useQuery`  에도 대응 가능하다는 것이다. 단점으로는 존재하는 캐시가 stale하다면 데이터를 가져오지 않는다는 것인데, 이 현상은 다음 쿼리에서도 자주 일어나는 일이다.

```jsx
const usePrefetchQuery = (...args) => {
  const queryClient = useQueryClient()

  // 렌더될 때 발생한다. 하지만 ensureQueryData는 
  // 쿼리에 캐시가 없을 때에만 fetch를 발생시키기 때문에
  // 안전하다. 이것은 데이터를 바라보는 관찰자가 없다는 것이고,
  // 그말인 즉슨 사이드 이펙트가 없어 안전하다는 것이다.
  queryClient.ensureQueryData(...args)
}
```

다른 방법으로는 쿼리 함수 내에서 prefetch를 수행하는 방법도 있다.

```jsx
const queryClient = useQueryClient();
const firstQuery = useQuery({
	queryKey: ['first', id],
	queryFn: (...args) => {
		queryClient.prefetchQuery({
			queryKey: ['second', id]
		});
		return originalQueyFn(...args);
	}
});
```

useEffect 내부에서 수행하는 방법도 동작한다. 하지만 `useSuspenseQuery` 를 같은 컴포넌트에서 이용한다면, 이펙트는 쿼리가 완료되기 전에 수행되지 않을 것이다. 

```jsx
function PostContainer() {
	const params = useSearchParams();
	const id = useMemo(() => params.get(id), params);
	
	// Content 에서 이용하고 있는 `useSuspenseQuery`가 
	// 완료되지 않았으면 fallback prop의 컴포넌트 렌더
	<Suspense fallback={<Spinner/>}>
		<Content id={id}/>
	</Suspense>
}

function Content({id}) {
	const {data} = useSuspenseQuery({
		queryKey: ['post', id]
	});
	const queryClient = useQueryClient();
	useEffect(() => {
		// 당연히 Suspense 안에 있으므로 렌더되지 않아
		// mounted effect는 발동하지 않는다.
		queryClient.prefetchQuery({
			queryKey: ['second', id]
		});
	}, [])
	return <h1>{data.title}</h1>
}
```

### Dependent Queries & Code Splitting

다른 fetch의 값에 따른 조건에 의해 prefetch가 수행되게 하고 싶을 수도 있다. [Code Splitting](https://www.notion.so/Code-Splitting-ec6d5941c2614feea77a226c54cd2b18?pvs=21) 의 예시를 보자. 여기에서 부모 컴포넌트의 쿼리 함수 내에서 조건부로 수행되게 할 수 있다. 그런데 이것도 마찬가지로 `getGraphDataById` 가 부모 컴포넌트 번들에 포함되는 결고를 낳을 것이다.

```tsx
const { data, isPending } = useQuery({
    queryKey: ['feed'],
    queryFn: async (...args) => {
      const feed = await getFeed(...args)
      for (const feedItem of feed) {
        if (feedItem.type === 'GRAPH') {
          queryClient.prefetchQuery({
            queryKey: ['graph', feedItem.id],
            queryFn: getGraphDataById,
          })
        }
      }
      return feed
    }
  })

```

### Router Integration

컴포넌트 트리 상에서 데이터를 로드하는 것은 쉽게 요청 폭포를 만들어낼 수 있고, 라우터 레벨에서 데이터를 미리 가져오는 방법론이 나오기 시작했다. 

이 경우, 각 라우트에 어떤 컴포넌트에 어떤 데이터가 갈지 미리 명시해줘야 한다. 왜냐하면 서버 렌더링은 전통적으로 렌더가 시작되기 전에 모든 데이터를 갖고 있어야하기 때문이다. 

TanStack Query v5 문서에서는 Tanstack Router와의 연동을 이용해 라우트 별 데이터를 미리 로드하는 방법과 코드에 대해 소개하고 있다. 하지만 깊게 다루진 않을 생각이다. 사실 ‘Advanced Server Rendering’ 문서를 읽기 위한 초석일 뿐이었다.