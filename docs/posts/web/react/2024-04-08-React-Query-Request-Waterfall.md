---
layout: post
title: "Next.js 에서 react-query 쓰기: 퍼포먼스와 요청 폭포"
category: React
date: "2024-04-08 20:40:00"
---

<img src="@image/2024-04-08/1.png">

### 요청 폭포

다른 자원에 대한 요청이 끝나기 전까지 자원의 요청이 시작되지 않는 현상 (폭포수가 떨어져내리듯이 상향식으로 이뤄진다는 모습에서 비유)

요청 폭포는 아래와 같이 마크업, JS, CSS, 이미지 순으로 구성돼 브라우저는 이 순서대로 페이지 렌더링에 필요한 자원을 불러온다.

```tsx
1. |-> Markup
2.   |-> JS
3.     |-> CSS
4.       |-> Image
```

각 요청 폭포는 자원이 캐시돼있지 않는 한 최소 1회 이상의 서버와의 요청/응답을 주고 받아야 한다. 당연한 말이지만, 폭포가 많을 수록 성능은 나빠진다.

### 요청 폭포와 리액트 쿼리

리액트 쿼리를 클라이언트에서 쓴다고 해보자.

마크업과 리액트를 포함한 SPA 로드에 필요한 모든 JS파일을 받아오고 나서야 쿼리가 이루어질 것이다.

리액트 쿼리에서 요청 폭포를 만들어낼 수 있는 몇가지 패턴을 살펴보고, 피하는 법을 알아보자.

- Single Component Waterfalls / Serial Queries
- Nested Component Waterfalls
- Code Splitting

### Single Component Waterfalls / Serial Queries

한 컴포넌트가 먼저 하나의 쿼리를 가져오고 다른 쿼리를 가져오면 그것은 요청 폭포다. 이 현상은 두번째 날린 쿼리가 의존적 쿼리여서 첫번째 쿼리의 결과에 의존적인 경우다. 

이 경우 당연히 두번째 쿼리를 불러오려면 첫번째 쿼리까지 불러온 후에야 불러와질 것이다. 이러한 현상을 막기 위해 클라이언트↔서버 간의 왕복을 줄이고 서버에서 작업이 이뤄질 수 있게 하는 것이 요청 폭포를 줄이는 방법이다. 사실, 폭포를 서버로 옮기는 것이긴 하다. 서버에서는 클라이언트 간의 통신보다 레이턴시가 낮기 때문이다.

아래는 의존적 쿼리에 의해 요청 폭포가 생기는 예시이다. 이런 경우 이메일을 요청으로 받아 프로젝트들을 응답으로 주는 API를 만드는 편이 요청 폭포를 줄일 수 있다.

```tsx
// Get the user
const { data: user } = useQuery({
  queryKey: ['user', email],
  queryFn: getUserByEmail,
})

const userId = user?.id

// Then get the user's projects
const {
  status,
  fetchStatus,
  data: projects,
} = useQuery({
  queryKey: ['projects', userId],
  queryFn: getProjectsByUser,
  // The query will not execute until the userId exists
  enabled: !!userId,
})
```

직렬적 쿼리 또한 요청 폭포를 만들어낸다.

`useSuspenseQuery` 를 이용해 여러 쿼리를 직렬적으로 구성하면 먼저 선언한 쿼리가 먼저 수행되고, 다음 쿼리가 수행되는 식으로 동작해 의존적 쿼리와 같은 효과가 만들어진다.

```tsx
function App () {
  // The following queries will execute in serial, causing separate roundtrips to the server:
  const usersQuery = useSuspenseQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const teamsQuery = useSuspenseQuery({ queryKey: ['teams'], queryFn: fetchTeams })
  const projectsQuery = useSuspenseQuery({ queryKey: ['projects'], queryFn: fetchProjects })

  // Note that since the queries above suspend rendering, no data
  // gets rendered until all of the queries finished
  
  // 대신 이렇게 병렬로 해볼까요
  const [usersQuery, teamsQuery, projectsQuery] = useSuspenseQueries({
	  queries: [
	    { queryKey: ['users'], queryFn: fetchUsers },
	    { queryKey: ['teams'], queryFn: fetchTeams },
	    { queryKey: ['projects'], queryFn: fetchProjects },
	  ]
	};
}
```

### Nested Component Waterfalls

의존적 쿼리나 직렬적 쿼리와 비슷한 상황인데 부모-자식 관계를 이루는 컴포넌트 두개가 모두 쿼리를 갖고 있고 부모 컴포넌트에서 쿼리가 완료되기 전까지 자식 컴포넌트가 렌더되지 않게 구성했다면 마찬가지로 요청 폭포가 생긴다.

이러한 요청 폭포를 제거하는 방법으로 부모 컴포넌트로 자식 컴포넌트의 쿼리를 호이스팅하는 것이 있다. 이렇게 하면 두 개의 쿼리가 병렬로 수행돼 요청 폭포를 평탄화시킬 수 있다.

