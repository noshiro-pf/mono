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

(Use `/rpdev` instead of `/rp` in the development environment)

#### Shorthand

```txt
/rp30 "title" 21 23
```

or

```txt
/rp60 "title" 21 23
```

(Use `/rp30dev` , `/rp60dev` instead of `/rp30` , `/rp60` respectively in the development environment)

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

## start develop environment

-   setup PostgreSQL
-   `sudo /etc/init.d/postgresql start`
-   `yarn start:dev`

## setup

```bash
$  heroku config:add TZ=Asia/Tokyo --app poll-discord-app
$  heroku config:add DATABASE_URL=*** --app poll-discord-app
$  heroku config:add DISCORD_TOKEN=*** --app poll-discord-app
```
