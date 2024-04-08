---
layout: post
title: "CS - 버블정렬로 n개의 수 정렬하기"
category: CS
date: "2022-04-16"
---

### 버블정렬?
버블정렬은 수를 정렬하는 알고리즘 중의 하나로, 예를 들어 3,2,1 세 수가 있을 때 1,2,3 의 오름차순으로 정렬하려 할 때 n까지 수 i를 0부터 증가시키며 i번째 원소가 i+1번째 원소보다 큰 경우에 둘의 위치를 교환해주는 알고리즘이다.
### 한번만 돌았을 때의 문제
하지만 이렇게 한번만 돌게 되면 1,3,2 인 경우에는 제대로 작동하겠지만 3,2,1 인 경우에는 2,1,3으로 출력하게 된다. 따라서 교환할 때 j번째까지 원소까지 교환해주고, 이 j는 원소의 갯수 n부터 1씩 줄여가주면 된다.
![](https://lh3.googleusercontent.com/pw/AM-JKLWZN4o2ssAluzoFUGZQXU8xUDUjNg3rs3OpX1X1RUX4oIunmu9AGWpQO6wywWSBOQNc75LQpMEHzAGfqRY-s4ijV4lz7oe66NizI6SG1jFYFyapkK9A5751ZoQe26vn9d7hFopfV8Vrn1QH-YEIL0cETg=w593-h295-no?authuser=0)
### 프로그래밍으로 구현 - 순서도와 테스트 케이스 표
![](https://lh3.googleusercontent.com/pw/AM-JKLUbrNkUFH44NaVyQ9yOrvBi7f_tIvTG8bsE-vP5NVoUlLeGEzaSsxOkIppN6ep1irAMkcTD2fiH1Zq6jz7bngOO3y7IZdhqoG6t3DbXoZGoTfHiOO8QE-_CdvSNi_7vvWvuu5Kmy_t0u4cksnhg3LYD0Q=w1280-h800-no?authuser=0)
### 프로그래밍으로 구현 - 파이썬 코드
```python
def bubbleSort(a, n):
  for i in range(n):
    for j in range(n-1-i):
      if (a[j] > a[j+1]):
        a[j], a[j+1] = a[j+1], a[j]
  return a
```

다른 여러가지 정렬 알고리즘에 대해 더 조사해 적고 싶었지만, 시험기간이라 이정도에서 줄인다..