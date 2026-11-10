# GitHub Pull Requests Manager, v2

A rebuild of [`apps/pr-manager`](../pr-manager/README.md) from its specification
rather than its code. It lives beside v1 until it does everything v1 does, and
then takes its place; until then v1 is the page to use.

- [`docs/spec.md`](./docs/spec.md) — what the page does, written from v1's
  behavior and the open requirements on it. A change to what the page does
  changes this first.
- [`docs/architecture.md`](./docs/architecture.md) — how the code is laid out
  and why: the layers, the URL codecs, and what is settled about reading.

## State

Everything in [`docs/spec.md`](./docs/spec.md) is drawn, with the **(changed)**
items there differing from v1 on purpose. The demo page draws the page over
made-up data, for trying it without a token.

## Working on it

```sh
pnpm --filter pr-manager-v2 run dev       # http://localhost:5203/mono/pr-manager-v2/
                                          # demo: …/pr-manager-v2/demo.html?repo=noshiro-pf/mono
pnpm --filter pr-manager-v2 run check:test
```

The URL parameters and the token's storage key are v1's, so an address or a
token kept by one opens the same way in the other.
