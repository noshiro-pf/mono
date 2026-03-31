---
'synstate': major
'synstate-react-hooks': major
'synstate-preact-hooks': major
'synstate-react-hooks-compat': major
'synstate-preact-signals': minor
---

Breaking changes (`synstate`):

- Renamed APIs:
    - `interval()` → `counter()`
    - `auditTime()` → `audit()`
    - `debounceTime()` → `debounce()`
    - `throttleTime()` → `throttle()`
    - `mapWithIndex()` → `map()` — index is now available as the second argument of `map(fn)`
    - `UpdaterSymbol` type → `UpdateToken`
- Removed APIs:
    - `fromArray()`
    - `of()`
    - `predefined/map` (consolidated into core `map` operator)
    - `core/utils` public exports (made internal)
- `createReducer` return type changed: third element is now `{ getSnapshot, initialState }` instead of `getSnapshot` directly
- `createState` / `createBooleanState` third element now includes `initialState`

New APIs (`synstate`):

- `just(value)` — create an Observable that holds a single static value and immediately completes (useful as a fallback inside `switchMap`)
- `fromAbortablePromise()` — create observable from an abortable promise
- `collectToArray()` — collect all emissions into a promise of array
- `initialState` is now returned from `createState`, `createBooleanState`, and `createReducer`
- Circular dependency detection — `.pipe()` and combinators (`combine`, `merge`, `zip`) now throw at construction time if a cycle is detected

New packages:

- `synstate-preact-signals` — Preact Signals bridge (`toSignal`, `fromSignal`, signal-returning `createState` / `createBooleanState` / `createReducer`)
- `synstate-react-hooks-compat` — React 16.8–17 hooks support (same API as `synstate-react-hooks`)

Other:

- Added `@synstate/docs` documentation site with interactive demos and performance benchmarks
