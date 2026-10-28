# tiny-router-observable

A router in about 180 lines: it reads `window.location`, exposes the pathname,
path segments and query parameters as a `synstate` observable, and wraps
`history.pushState` / `replaceState` / `go` / `back` / `forward` so that each
one republishes the state.

Restored from `experimental/` — see
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md). It is
one of the six utilities `event-schedule-app` needs, and
`tiny-router-react-hooks` sits on top of it. Never published to npm, so it comes
back to `apps/` as a private package.

## Serving below a base path

An app on the repository's GitHub Pages site is served from
`/mono/<dir>/`, not from the root. Pass Vite's base to `createRouter` —
`createRouter({ basePath: import.meta.env.BASE_URL })` — and route as if the
app were at the root.

`state.pathname` then reads `/career/` for `/mono/profile/career/`, and
`push('/career/')` goes to `/mono/profile/career/`. A whole URL (a clicked
link's `href`, or what `updateQueryParams` builds) is taken as it is.

## Without a window

`createRouter` reads and writes the real window unless it is handed a
`browser`: a `RouterBrowser` is the location, the history methods and the
`popstate` listener the router uses. `createMemoryBrowser(href)` is one kept in
memory, so a store that owns a router can be created and tested in Node:

```ts
const browser = createMemoryBrowser('https://example.com/mono/loan/?a=1');

const router = createRouter({ basePath: '/mono/loan/', browser });

router.push('/?a=2');

browser.url().search; // '?a=2'
```

`go`, `back` and `forward` fire `popstate` at once, where a browser fires it a
moment later.

## What changed on the way back

- `@noshiro/syncflow` → `synstate`, whose API has moved: `createState` returns a
  tuple rather than an object, and operators are applied with `.pipe(…)` rather
  than `.chain(…)`.
- `pipe(...).chain(…)` from `@noshiro/ts-utils` is `pipe(...).map(…)` in
  `ts-data-forge`. The two `chain`s were unrelated, and both are gone.
- `Omit` became `StrictOmit`, which is what the repository's lint rules ask for.
