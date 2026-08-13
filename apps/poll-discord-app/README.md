# poll-discord-app

A Discord bot that runs polls: it posts a message with a reaction per option,
tallies the reactions, and keeps a summary message and the poll's title up to
date as people answer. State lives in Firestore.

Restored from `experimental/` — this is the first of the packages the monorepo
consolidation parked there. See
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md).

## What changed on the way back

- `@noshiro/io-ts` → `ts-fortress`, `@noshiro/ts-utils` and
  `@noshiro/ts-utils-additional` → `ts-data-forge`.
- **The implicit globals are gone.** The app used to auto-import `Result`,
  `IMap`, `pipe` and the rest through `@noshiro/global-ts-utils` and an esbuild
  plugin; every one of them is now an ordinary import.
- What `ts-data-forge` has no successor for is in [`src/utils`](./src/utils):
  `match`, `mapOptional`, `noop`, the five `DateUtils` functions this app calls,
  and the days-of-week and alphabet constants. Each says where it came from.

## Running it

`DISCORD_TOKEN` comes from `.env`, or `.env.dev` / `.env.prd` when `NODE_ENV`
names one. `dotenv-example` lists what is expected.

```sh
pnpm run build   # type-check, then transpile src/ to build/
pnpm run start   # node ./build/index.mjs
```

The Firebase config in `src/firebase/config.mts` is a web app config: public by
design, and unchanged from before the consolidation.
