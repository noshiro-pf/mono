# tiny-router-react-hooks

The click handler that makes an ordinary `<a>` navigate through a router
instead of the browser: it ignores modified clicks, middle clicks and
`target="_blank"`, and falls back to a replace when the URL has not changed —
the same thing a plain `<a>` would do.

Restored from `experimental/` — see
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md). One of
the six utilities `event-schedule-app` needs. Never published to npm, so it
comes back to `apps/` as a private package.

## What changed on the way back

- **Three of its four declared dependencies were never imported.**
  `@noshiro/syncflow-react-hooks`, `@noshiro/tiny-router-observable` and
  `@noshiro/ts-utils` are gone; the package only ever used React. It takes
  `pushFn` and `redirectFn` as arguments rather than reaching for a router, so
  nothing was lost.
- `useRouterLinkClick` and `createRouterLinkClickHandler` had the same body
  written out twice. The hook now memoizes the factory's result.
- `React.MouseEventHandler` was used without importing React, which happened to
  work through a global. It is imported now.
