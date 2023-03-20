# poll_discord_app

## usage

### Rich Poll

```txt
/rp "title"
"21:00-21:30"
"21:30-22:00"
"22:00-22:30"
"22:30-23:00"
```

(Use `/rp-dev` instead of `/rp` in the development environment)

#### Shorthand

```txt
/rp30 "title" 21 23
```

or

```txt
/rp60 "title" 21 23
```

(Use `/rp30-dev`/`/rp60-dev` instead of `/rp30`/`/rp60` respectively in the development environment)

### Grouping

```txt
/gp 2
"Alice"
"Bob"
"Carol"
"Dave"
"Ellen"
"Frank"
```

(Use `/gpdev` instead of `/gp` in the development environment)

result

```txt
1. "Alice" "Dave" "Frank"
2. "Bob" "Carol" "Ellen"
```

### Rand

```txt
/rand 3
```

result

```txt
2
```

---

## For developers

### Start app locally

`yarn start:dev`

### setup service

1. Open https://railway.app/
2. Create a Project with name `Rich Poll`
3. Open dashboard

#### Create a PostgreSQL service

1. Create a table named `main`
2. Add columns

| name       | type | default value |
| :--------- | :--- | :------------ |
| id         | text |               |
| updated_at | date |               |
| data       | json | {}            |

#### Create a worker service

1. Connect to this Github repo.
2. Open Settings tab.
3. Select `main` branch in "Automatic Deployments".
4. Type `yarn build` in "Build Command".
5. Type `yarn start:prod` in "Start Command".
6. Set environment variable `DISCORD_TOKEN` generated at [Discord Developer Portal](https://discord.com/developers/applications).
7.

## Links

-   https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
