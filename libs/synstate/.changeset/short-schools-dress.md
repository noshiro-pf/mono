---
'synstate': major
'synstate-react-hooks': major
'synstate-preact-hooks': major
'synstate-react-hooks-compat': major
'synstate-preact-signals': minor
---

### Breaking Changes (`synstate`)

#### Renamed APIs

- `interval()` → `counter()` — renamed for clarity
- `auditTime()` → `audit()` — simplified name
- `debounceTime()` → `debounce()` — simplified name
- `throttleTime()` → `throttle()` — simplified name
- `mapWithIndex()` → `map()` — index is now available as the second argument of `map(fn)`, removing the need for a separate function
- `UpdaterSymbol` type → `UpdateToken` — internal type renamed for clarity

#### Removed APIs

- `fromArray()` — removed
- `of()` — removed
- `predefined/map` — removed (consolidated into core `map` operator)
- `core/utils` public exports — made internal

#### New APIs

- `just(value)` — create an Observable that holds a single static value and immediately completes (useful as a fallback inside `switchMap`)
- `fromAbortablePromise()` — create observable from an abortable promise
- `collectToArray()` — collect all emissions into a promise of array
- Circular dependency detection — `.pipe()` and combinators (`combine`, `merge`, `zip`) now throw at construction time if a cycle is detected

### New Packages

- `synstate-preact-signals` — Preact Signals bridge (`toSignal`, `fromSignal`, signal-returning `createState` / `createBooleanState` / `createReducer`)
- `synstate-react-hooks-compat` — React 16.8–17 hooks support (same API as `synstate-react-hooks`)

### Other

- Added `@synstate/docs` documentation site with interactive demos and performance benchmarks
