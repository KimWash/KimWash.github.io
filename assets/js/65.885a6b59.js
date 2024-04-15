(window.webpackJsonp=window.webpackJsonp||[]).push([[65],{375:function(t,s,a){"use strict";a.r(s);var i=a(15),v=Object(i.a)({},(function(){var t=this,s=t._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h2",{attrs:{id:"우선순위-큐"}},[t._v("우선순위 큐")]),t._v(" "),s("p",[t._v("Heap에 대해 배운다면서 갑자기 웬 큐를, 그것도 우선순위 큐라는 특이한게 나와서 당황했다.\n하지만 Heap은 "),s("strong",[t._v("우선순위를 가진 항목들을 저장하는")]),t._v(" 우선순위 큐를 구현하기 위해 필요한 자료구조이다.\n기존의 큐는 FIFO(선입선출) 이었지만, 우선순위 큐는 우선 순위가 높은 항목을 먼저 내보내게 된다.")]),t._v(" "),s("ul",[s("li",[t._v("스택/FIFO큐와의 차이점은 당연히 "),s("strong",[t._v("삭제되는 요소가 무엇이냐")]),t._v(" 이다.")]),t._v(" "),s("li",[t._v("어떤 값을 우선순위로 두느냐에 따라 최소/최대 우선순위 큐로 구분한다.")])]),t._v(" "),s("h3",{attrs:{id:"adt"}},[t._v("ADT")]),t._v(" "),s("ul",[s("li",[s("code",[t._v("create()")]),t._v(": 우선순위 큐 생성")]),t._v(" "),s("li",[s("code",[t._v("init(q)")]),t._v(": "),s("code",[t._v("q")]),t._v("를 초기화")]),t._v(" "),s("li",[s("code",[t._v("is_empty(q)")]),t._v(": "),s("code",[t._v("q")]),t._v("의 공백체크")]),t._v(" "),s("li",[s("code",[t._v("is_full(q)")]),t._v(": "),s("code",[t._v("q")]),t._v("의 포화체크")]),t._v(" "),s("li",[s("u",[s("code",[t._v("insert(q, x)")]),t._v(": "),s("code",[t._v("q")]),t._v("에 요소 "),s("code",[t._v("x")]),t._v(" 추가")])]),t._v(" "),s("li",[s("u",[s("code",[t._v("delete(q)")]),t._v(": "),s("strong",[t._v("가장 우선순위가 높은")]),t._v(" 요소를 삭제하고 반환")])]),t._v(" "),s("li",[s("code",[t._v("find(q)")]),t._v(": "),s("strong",[t._v("가장 우선순위가 높은")]),t._v(" 요소를 반환")])]),t._v(" "),s("h3",{attrs:{id:"구현-방법"}},[t._v("구현 방법")]),t._v(" "),s("ol",[s("li",[t._v("Array (맨 뒤에 있는 값이 항상 제일 크게/작게)")]),t._v(" "),s("li",[t._v("LinkedList (head 포인터에 있는 값이 항상 제일 크게/작게)")]),t._v(" "),s("li",[t._v("Heap")])]),t._v(" "),s("ul",[s("li",[t._v("구현방법 별 삽입/삭제 시간복잡도\n"),s("table",[s("thead",[s("tr",[s("th",[t._v("Expression")]),t._v(" "),s("th",[t._v("Insertion")]),t._v(" "),s("th",[t._v("Deletion")])])]),t._v(" "),s("tbody",[s("tr",[s("td",[t._v("순서 없는 배열")]),t._v(" "),s("td",[t._v("O(1)")]),t._v(" "),s("td",[t._v("O(n)")])]),t._v(" "),s("tr",[s("td",[t._v("순서 없는 연결 리스트")]),t._v(" "),s("td",[t._v("O(1)")]),t._v(" "),s("td",[t._v("O(n)")])]),t._v(" "),s("tr",[s("td",[t._v("정렬된 배열")]),t._v(" "),s("td",[t._v("O(n)")]),t._v(" "),s("td",[t._v("O(1)")])]),t._v(" "),s("tr",[s("td",[t._v("정렬된 연결 리스트")]),t._v(" "),s("td",[t._v("O(n)")]),t._v(" "),s("td",[t._v("O(1)")])]),t._v(" "),s("tr",[s("td",[t._v("heap")]),t._v(" "),s("td",[t._v("O("),s("span",{staticClass:"katex"},[s("span",{staticClass:"katex-mathml"},[s("math",[s("semantics",[s("mrow",[s("mi",[t._v("l")]),s("mi",[t._v("o")]),s("msub",[s("mi",[t._v("g")]),s("mn",[t._v("2")])],1),s("mi",[t._v("n")])],1),s("annotation",{attrs:{encoding:"application/x-tex"}},[t._v("log_2n")])],1)],1)],1),s("span",{staticClass:"katex-html",attrs:{"aria-hidden":"true"}},[s("span",{staticClass:"base"},[s("span",{staticClass:"strut",staticStyle:{height:"0.8888799999999999em","vertical-align":"-0.19444em"}}),s("span",{staticClass:"mord mathdefault",staticStyle:{"margin-right":"0.01968em"}},[t._v("l")]),s("span",{staticClass:"mord mathdefault"},[t._v("o")]),s("span",{staticClass:"mord"},[s("span",{staticClass:"mord mathdefault",staticStyle:{"margin-right":"0.03588em"}},[t._v("g")]),s("span",{staticClass:"msupsub"},[s("span",{staticClass:"vlist-t vlist-t2"},[s("span",{staticClass:"vlist-r"},[s("span",{staticClass:"vlist",staticStyle:{height:"0.30110799999999993em"}},[s("span",{staticStyle:{top:"-2.5500000000000003em","margin-left":"-0.03588em","margin-right":"0.05em"}},[s("span",{staticClass:"pstrut",staticStyle:{height:"2.7em"}}),s("span",{staticClass:"sizing reset-size6 size3 mtight"},[s("span",{staticClass:"mord mtight"},[t._v("2")])])])]),s("span",{staticClass:"vlist-s"},[t._v("​")])]),s("span",{staticClass:"vlist-r"},[s("span",{staticClass:"vlist",staticStyle:{height:"0.15em"}},[s("span")])])])])]),s("span",{staticClass:"mord mathdefault"},[t._v("n")])])])]),t._v(")")]),t._v(" "),s("td",[t._v("O("),s("span",{staticClass:"katex"},[s("span",{staticClass:"katex-mathml"},[s("math",[s("semantics",[s("mrow",[s("mi",[t._v("l")]),s("mi",[t._v("o")]),s("msub",[s("mi",[t._v("g")]),s("mn",[t._v("2")])],1),s("mi",[t._v("n")])],1),s("annotation",{attrs:{encoding:"application/x-tex"}},[t._v("log_2n")])],1)],1)],1),s("span",{staticClass:"katex-html",attrs:{"aria-hidden":"true"}},[s("span",{staticClass:"base"},[s("span",{staticClass:"strut",staticStyle:{height:"0.8888799999999999em","vertical-align":"-0.19444em"}}),s("span",{staticClass:"mord mathdefault",staticStyle:{"margin-right":"0.01968em"}},[t._v("l")]),s("span",{staticClass:"mord mathdefault"},[t._v("o")]),s("span",{staticClass:"mord"},[s("span",{staticClass:"mord mathdefault",staticStyle:{"margin-right":"0.03588em"}},[t._v("g")]),s("span",{staticClass:"msupsub"},[s("span",{staticClass:"vlist-t vlist-t2"},[s("span",{staticClass:"vlist-r"},[s("span",{staticClass:"vlist",staticStyle:{height:"0.30110799999999993em"}},[s("span",{staticStyle:{top:"-2.5500000000000003em","margin-left":"-0.03588em","margin-right":"0.05em"}},[s("span",{staticClass:"pstrut",staticStyle:{height:"2.7em"}}),s("span",{staticClass:"sizing reset-size6 size3 mtight"},[s("span",{staticClass:"mord mtight"},[t._v("2")])])])]),s("span",{staticClass:"vlist-s"},[t._v("​")])]),s("span",{staticClass:"vlist-r"},[s("span",{staticClass:"vlist",staticStyle:{height:"0.15em"}},[s("span")])])])])]),s("span",{staticClass:"mord mathdefault"},[t._v("n")])])])]),t._v(")")])])])])])])])}),[],!1,null,null,null);s.default=v.exports}}]);