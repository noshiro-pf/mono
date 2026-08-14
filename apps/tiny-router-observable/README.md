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

## What changed on the way back

- `@noshiro/syncflow` → `synstate`, whose API has moved: `createState` returns a
  tuple rather than an object, and operators are applied with `.pipe(…)` rather
  than `.chain(…)`.
- `pipe(...).chain(…)` from `@noshiro/ts-utils` is `pipe(...).map(…)` in
  `ts-data-forge`. The two `chain`s were unrelated, and both are gone.
- `Omit` became `StrictOmit`, which is what the repository's lint rules ask for.
