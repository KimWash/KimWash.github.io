---
layout:  post
title:  H4Pay 개발기 - new Date()와 Date.parse()의 차이 "자료형"
category:  H4Pay
date:  "2022-01-28"
---

오늘은 간단하게 짚고 넘어가야할 부분을 적어보고자 한다.

Flutter로 앱 개발을 진행하고, Vue로 대시보드 개발을 진행하는데, 요즘 별로 대시보드를 만질 일이 없어서 JS를 손놓고 있었다. 그런데 API를 일원화하고 다중 학교를 지원하는 과정에서 대시보드의 수정도 불가피해졌고, 대시보드를 수정하는 과정에서 ISODate를 Date 객체로 받으려고 하는데, 이때 삽질을 조금 해서 기록해두려고 한다.

### Date.parse()는 밀리초로, new Date()는 Date 객체를 반환한다!

사실 굉장히 초짜스러운 것이긴 하다. 하지만 모든 데이터에 Type Check가 들어가고 VSC에서 설명도 자세하게 뜨는 Flutter와 다르게 JS는 그렇지 못한 부분이 있어서.. 라고 변명해보지만 결국 내 숙련이 부족한 탓이다.

핵심은 이것이다.
> Date.parse('ISODateString') => millisecondsSinceEpoch
> new Date('ISODateString') => DateObject

다음번엔 꼭 이런 짓을 안하기 위해서 적어본다..