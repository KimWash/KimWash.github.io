---
layout: post
title: "사지방에서 코딩하기 - VSCode Tunneling"
category: etc
date: "2024-01-20"
---

# 군대에서도 코딩을 하고 싶다. 
-----
내 시간은 소중하기에
-----

2023년 12월 11일 논산훈련소에 입소한 이후 한달간 코딩을 안했더니 손이 근질근질해 죽을 것 같았다. 그래서 자대에 오고 난 이후 사지방에서 원격 개발환경 구축을 위해 토요일을 갈아넣었다.

웹에서 SSH를 이용할 수 있게 하는 SSH 웹 클라이언트 서버를 구축하고, 모자란 것 같아서 VNC 웹 클라이언트도 구축하려 했다. Wetty와 guacamole를 이용했는데, 모두 잘 안돼 다른 방법을 알아봤다.

## vscode.dev
갑자기 vscode.dev가 생각나 들어가봤는데, 내 서버와 터널링을 하면 마치 서버에서 VSCode로 작업하는 것 같은 환경을 가질 수 있다고 해서 구축에 착수했다.

### 구축방법

1. 아래 명령어로 VSCode CLI를 다운로드하고 압축해제한다.
```bash
curl -Lk 'https://code.visualstudio.com/sha/download?build=stable&os=cli-alpine-x64' --output vscode_cli.tar.gz 
tar -xf vscode_cli.tar.gz
```

2. 아래 명령어로 터널링을 활성화한다.
`./code tunnel`

그러면 링크가 나올거고, 이를 클릭하면 깃헙 페이지에 접속해 코드를 입력하게 된다. 터미널에 나온 코드를 입력하면 된다.

3. 아래 명령어로 서비스를 설치하고 서버가 'sleep'하지 않도록 해 설정을 진행한 ssh 세션이 종료돼도 터널링이 유지되게 한다.

```bash
code tunnel service install
code tunnel --no-sleep
```

개인정비 시간이 30분 가량 남은 관계로 빠르게 글을 맺어본다.