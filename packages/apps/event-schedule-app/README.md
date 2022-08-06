# Event Schedule App

イベントの日程調整のためのアプリ

https://event-schedule-app.web.app

## Setup

```
yarn setup
```

## Start

```sh
yarn start:build-functions
```

```sh
yarn start:emulators
```

```sh
yarn start:dev-server
```

### env

```
{
  "gmail": {
    "email": "noshiro.app@gmail.com",
    "password": <password>
  }
}
```

### service-account-key.json

最初は tsc を通すために空ファイルが自動生成されているので中身を更新する。
