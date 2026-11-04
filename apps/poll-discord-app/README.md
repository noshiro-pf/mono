# poll-discord-app

A Discord bot that runs polls: it posts a message with a reaction per option,
tallies the reactions, and keeps a summary message and the poll's title up to
date as people answer. State lives in Firestore.

Restored from `experimental/` — this is the first of the packages the monorepo
consolidation parked there. See
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md).

## Work in progress: the move to slash commands

The bot is being rewritten on Discord's slash commands (application commands).
The text-command implementation described under "usage" below now lives in
[`src-old`](./src-old); [`src`](./src) holds the rewrite, which so far registers
a few sample commands (`/ping`, `/server`, `/user`, `/select`, `/tag`) to one
guild and answers them. `build` and `start` run the rewrite.

Registering the commands needs `CLIENT_ID` (the application ID) and `GUILD_ID`
(the guild they are registered to) besides `DISCORD_TOKEN`.

## Invite

<https://discord.com/api/oauth2/authorize?client_id=822731455749685278&permissions=0&scope=bot%20applications.commands>

## usage

In the development environment every command takes a `-dev` suffix: `/rp-dev`,
`/rp30-dev`, `/rp60-dev`, `/rp30d-dev`, `/rp60d-dev`, `/gp-dev` and
`/rand-dev`.

### Rich Poll

```txt
/rp "title"
"21:00-21:30"
"21:30-22:00"
"22:00-22:30"
"22:30-23:00"
```

#### Shorthand

```txt
/rp30 "title" 21 23
```

or

```txt
/rp60 "title" 21 23
```

`/rp30` splits the hours from the first number to the second into 30-minute
options and `/rp60` into 1-hour options: `21 23` covers 21:00–23:00.

`/rp30d` and `/rp60d` do the same without a title argument, and title the poll
with today's date (`11/2（月）`):

```txt
/rp30d 21 23
```

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

## What changed on the way back

- `@noshiro/io-ts` → `ts-fortress`, `@noshiro/ts-utils` and
  `@noshiro/ts-utils-additional` → `ts-data-forge`.
- **The implicit globals are gone.** The app used to auto-import `Result`,
  `IMap`, `pipe` and the rest through `@noshiro/global-ts-utils` and an esbuild
  plugin; every one of them is now an ordinary import.
- What `ts-data-forge` has no successor for is in
  [`src-old/utils`](./src-old/utils):
  `match`, `mapOptional`, `noop`, the five `DateUtils` functions this app calls,
  and the days-of-week and alphabet constants. Each says where it came from.

## Running it

`DISCORD_TOKEN` comes from `.env`, or `.env.dev` / `.env.prd` when `NODE_ENV`
names one. `dotenv-example` lists what is expected.

```sh
pnpm run build   # transpile src/ to build/ with esbuild; no type check
pnpm run start   # node ./build/index.mjs
```

`build` does not type-check; `pnpm run check:types` does.

The Firebase config in `src-old/firebase/config.mts` is a web app config: public
by design, and unchanged from before the consolidation.

## Links

- <https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags>
