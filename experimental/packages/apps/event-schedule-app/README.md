# Event Schedule App

イベントの日程調整のためのアプリ

https://event-schedule-app.web.app

## Setup

```
pnpm run setup
```

## Start

```sh
pnpm run start:build-functions
```

```sh
pnpm run start:emulators
```

```sh
pnpm run start:dev-server
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

### Firestore structure

`[]` は collection

```
/[events_v7]/
    |
    +--(event-id): EventSchedule
        |
        +--[answers]/
        |   |
        |   +--(answer-id): Answer
        |
        +--[internal]/
            |
            +--values
                |
                +--email: string
```
