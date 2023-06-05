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

### Development Environment

1. `cp dotenv-example .env.dev`
1. Set environment variable `DISCORD_TOKEN` generated at [Discord Developer Portal](https://discord.com/developers/applications).
1. `yarn build:dev`
1. `yarn start:dev`

### Production Environment

1. (local) `cp dotenv-example .env.prd`
1. (local) Set environment variable `DISCORD_TOKEN` generated at [Discord Developer Portal](https://discord.com/developers/applications).
1. (local) `yarn build:prd`
1. (local) `yarn scp`
1. (in VM) `nohup node ./bot.prd.cjs &`

## Links

-   https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
