# poll_discord_app

## Invite

https://discord.com/api/oauth2/authorize?client_id=822731455749685278&permissions=0&scope=bot%20applications.commands

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

## Setup

### Local

-   Install PostgreSQL

```sh
$  sudo apt update
$  sudo apt install postgresql
```

-   Setup PostgreSQL

```sh
$  sudo /etc/init.d/postgresql restart
$  sudo passwd postgres
$  sudo -u postgres -i
$  createuser -d -U postgres -P db-user1
$  createdb poll-discord-app --encoding=UTF-8 --owner=db-user1 --port 5432

# -> LOCAL_DATABASE_URL="postgres://db-user1:<password>@localhost:5432/poll-discord-app"
```

-   Create table

1. start pqsl

```sh
$  psql -U db-user1 -h localhost -d poll-discord-app
```

2. show tables

```sql
select * from pg_catalog.pg_tables;
```

3. create table

```sql
create table main ( data JSON , updated_at timestamp, id varchar(256) );

poll-discord-app=> insert into main ( data, updated_at, id ) values ( '{ "aaa": "bbb" }', current_timestamp, '2021-03-20_16:35' );

poll-discord-app=> update main SET data = '{ "eee": "fff" }',  updated_at = current_timestamp where id = '2021-03-20_16:35';
```

### heroku configs

```sh
$  heroku config:add TZ=Asia/Tokyo --app poll-discord-app
$  heroku config:add DATABASE_URL=*** --app poll-discord-app
$  heroku config:add DISCORD_TOKEN=*** --app poll-discord-app
```

## Start develop environment

```sh
$  sudo /etc/init.d/postgresql start
$  yarn start:dev
```
