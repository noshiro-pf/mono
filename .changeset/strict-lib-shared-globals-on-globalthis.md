---
'strict-ts-lib-v5.0-source': patch
'strict-ts-lib-v5.1-source': patch
'strict-ts-lib-v5.2-source': patch
'strict-ts-lib-v5.3-source': patch
'strict-ts-lib-v5.4-source': patch
'strict-ts-lib-v5.5-source': patch
'strict-ts-lib-v5.6-source': patch
'strict-ts-lib-v5.7-source': patch
'strict-ts-lib-v5.8-source': patch
'strict-ts-lib-v5.9-source': patch
'strict-ts-lib-v6.0-source': patch
'strict-ts-lib-v7.0-source': patch
---

`globalThis.navigator`, `globalThis.location`, `globalThis.crypto`,
`globalThis.self` and the other globals a window and a worker share type-check
again.

The bundles declare global variables with `const` rather than `var`, so that
assigning to one is an error. A `const` is not a property of
`typeof globalThis`, though, so every such name had dropped out of
`globalThis.X`. That is harmless where another spelling reaches the name
everywhere it exists — `Number.NaN`, a bare `Map`, `window.history` — but a
name that `lib.dom` and `lib.webworker` both declare also exists where there is
no `window`, and Node.js has `navigator`, `crypto` and `performance` too, so
`globalThis.X` is its one portable spelling. Those names (240 in the TypeScript
7.0 lib: the `fetch`-family constructors, `navigator`, `location`, `crypto`,
`performance`, `self`, `console`, …) are `var` again in `dom` and `webworker`;
every other global stays `const`.

With `@types/node` installed, `fetch` and `Response` now resolve to the
bundle's DOM declarations again: `@types/node` declares its own `Response` only
when `typeof globalThis` has none, which, with the DOM's hidden, was always.
`Response#json()` is then the bundle's `Promise<MutableJsonValue>` rather than
Node's `Promise<unknown>`, so a cast such as
`res.json() as Promise<readonly Row[]>` no longer type-checks, because a
`MutableJsonValue` array is mutable. Validate the value, or cast to a mutable
array.

The rule that turns a `var` inside a namespace into `const` no longer reaches
outside namespaces either. It had been rewriting `HTMLElementTagNameMap`'s
`var` key (the `<var>` element) to `const`, and `var()` in a comment.
