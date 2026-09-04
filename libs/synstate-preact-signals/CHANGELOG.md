# synstate-preact-signals

## 2.0.1

### Patch Changes

- 30de8fa: Build with the native TypeScript compiler and drop Rollup. Each module in `dist/` is emitted by `tsc` as written, then the type tests, the in-source tests, the identity casts and the comments are removed from it. The declarations are unchanged, every module exports the same names as before, and the JavaScript is smaller: 1437 KB across these packages before, 1041 KB after.

    Two things change in the published JavaScript. `export` declarations appear inline rather than in a trailing `export { ... }` list, and the line structure is the source's rather than a bundler's, so a stack trace or a source map lands where the code was written.

    `github-settings-as-code` was already compiled by `tsc`; what it gains here is the removal pass, so its `dist/` no longer carries `expectType(...)` calls.

- Updated dependencies [30de8fa]
    - synstate@3.0.1
    - ts-data-forge@14.6.3

## 2.0.0

### Major Changes

- 394ded1: Rewrite the observable core without classes and remove the class exports.

    The internal implementation of every observable is now built from closure-based
    factory functions (`src/core/base/`) instead of a class hierarchy. The public
    API — `source`, `timer`, the operator factories, `pipe`, the structural
    `Observable` interfaces and the `kind` tags — is unchanged, and all existing
    behavior is preserved.

    BREAKING CHANGE: the implementation classes `ObservableBaseClass`,
    `RootObservableClass`, `SyncChildObservableClass`, `AsyncChildObservableClass`
    and `InitializedSyncChildObservableClass` are no longer exported from
    `synstate`, and consequently no longer re-exported from `synstate-react-hooks`,
    `synstate-react-hooks-compat`, `synstate-preact-hooks` and
    `synstate-preact-signals`. Code that extended or instantiated these classes
    should build observables through the factory functions and the structural
    `Observable` types instead.

### Patch Changes

- Updated dependencies [4a69cc8]
- Updated dependencies [394ded1]
    - ts-data-forge@14.5.0
    - synstate@3.0.0

## 1.0.2

### Patch Changes

- 40ff18c: Point `module` and `types` at files that exist. Both named `./dist/index.js`
  and `./dist/index.d.ts`, which the build has never emitted — it emits
  `./dist/index.mjs` and `./dist/index.d.mts`, as the `exports` map already said.
  Modern resolution reads `exports` and was unaffected; anything falling back to
  the legacy fields found nothing.

    Also declare `engines` (Node >= 22.22.2) and `publishConfig`, bringing these
    packages in line with the rest of the repository.

- Updated dependencies [40ff18c]
    - synstate@2.0.2

## 1.0.1

### Patch Changes

- 3d6bca7: Fix the links in the README. They were relative, and npm rewrites a relative
  link against the repository root without regard for `repository.directory`, so
  publishing from the monorepo would have pointed them at paths that do not
  exist — `synstate`'s logo among them. They are absolute now. The links that
  still named one of the repositories this package was merged from now name
  `mono`, and a handful that had gone stale independently (a file that moved, one
  that was renamed, three documents that became pages on the docs site) point
  where those things actually are.
- Updated dependencies [3d6bca7]
    - synstate@2.0.1
    - ts-data-forge@14.2.1
    - ts-type-forge@9.2.1

## 1.0.0

### Major Changes

- 6f4805e: Upgrade to `ts-data-forge` 14 and `ts-type-forge` 9.

    Both are dependencies whose types appear in these packages' public
    signatures, so consumers that also depend on them directly have to upgrade in
    step.

    BREAKING CHANGE: requires `ts-data-forge` >= 14 and `ts-type-forge` >= 9.

### Patch Changes

- Updated dependencies [6f4805e]
    - synstate@2.0.0

## 0.2.2

### Patch Changes

- e667fe3: Updated ts-type-forge to v3.1.0.
- Updated dependencies [e667fe3]
    - synstate@1.0.2

## 0.2.1

### Patch Changes

- 759b7d5: The implementation has been modified to explicitly import ts-type-forge internally.
- Updated dependencies [759b7d5]
    - synstate@1.0.1

## 0.2.0

### Minor Changes

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
