# synstate-react-hooks

## 1.0.2

### Patch Changes

- e667fe3: Updated ts-type-forge to v3.1.0.
- Updated dependencies [e667fe3]
    - synstate@1.0.2

## 1.0.1

### Patch Changes

- 759b7d5: The implementation has been modified to explicitly import ts-type-forge internally.
- Updated dependencies [759b7d5]
    - synstate@1.0.1

## 1.0.0

### Major Changes

- fb4d09c: Breaking changes (`synstate`):
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

### Patch Changes

- Updated dependencies [fb4d09c]
    - synstate@1.0.0

## 0.1.2

### Patch Changes

- 5cb2c32: Updated README.md
- Updated dependencies [5cb2c32]
    - synstate@0.1.2

## 0.1.1

### Patch Changes

- fec0a16: Fix README
- Updated dependencies [fec0a16]
    - synstate@0.1.1

## 0.1.0

### Minor Changes

- 799a759: Initial release

### Patch Changes

- Updated dependencies [799a759]
    - synstate@0.1.0
