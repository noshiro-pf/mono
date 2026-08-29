# resize-observer-react-hooks

`useResizeObserver` — the size of an element as state, and a ref to attach to
it.

Restored from `experimental/` — see
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md). It is
what `react-utils-styled` needs, which is in turn what
`react-blueprintjs-utils` needs, so it comes back first. Never published to
npm, so it lands in `apps/` as a private package.

## What changed on the way back

- **The `resize-observer` polyfill is gone.** It was last published in 2020;
  `ResizeObserver` is in every browser this targets and `lib.dom` types it, so
  the package now uses the global.
- `useRef<E>(null)` is typed `RefObject<E | null>` in React 19, and the hooks
  say so.
