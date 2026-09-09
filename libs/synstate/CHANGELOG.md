# synstate

## 3.0.2

### Patch Changes

- 9c21467: Stop the program through ts-std-forge's panic path instead of a bare `throw`.

    The two invariant violations — a circular dependency in the observable graph,
    and `tryUpdate` reached on an observable that has no parents — used to be
    `throw new Error(...)` with an `oxlint-disable-next-line sumi/no-throw` above
    them, because Sumi's prelude had no panic function when they were written.
    D-48 added one, so they are now `panic(message)` and `unreachable()`. Not
    `todo()` for the second: nothing there is waiting to be written. It is the
    base default of what used to be a base-class method — every observable that
    can receive a parent update supplies its own `tryUpdate`, and one with no
    parents never gets called — so reaching it is the invariant breaking.

    The circular-dependency message is passed through unchanged, so the
    `toThrow('...')` assertions on it keep matching. The other one changes from
    `'not implemented'` to `'Reached code the types mark unreachable'`, which
    nothing asserts on.

    Both errors change identity: they carry the `$$panic` mark and their `name` is
    `PanicError` rather than `Error`, which is what makes the `Result` /
    `AsyncResult` boundaries rethrow them instead of turning an invariant
    violation into an `Err` a caller might handle.

    `ts-std-forge` is a new direct runtime dependency, which `ts-data-forge`
    already brought in transitively since the D-49 inversion, so the README and
    the docs site now say "two external runtime dependencies" rather than one.

    The advertised bundle size is unchanged at ~4.6 kB, but getting a truthful
    number needed a fix to the measurement: `embed-bundle-size.mts` marked only
    `ts-data-forge` as external, so the moment synstate imported from
    `ts-std-forge` the whole of that package was bundled into the figure and it
    read 8.7 kB. Every runtime dependency is external now — the number is the size
    of this package, not of its dependency tree inlined.

- Updated dependencies [9c21467]
- Updated dependencies [9c21467]
- Updated dependencies [9c21467]
- Updated dependencies [9c21467]
    - ts-std-forge@0.5.0
    - ts-data-forge@14.7.0

## 3.0.1

### Patch Changes

- 30de8fa: Build with the native TypeScript compiler and drop Rollup. Each module in `dist/` is emitted by `tsc` as written, then the type tests, the in-source tests, the identity casts and the comments are removed from it. The declarations are unchanged, every module exports the same names as before, and the JavaScript is smaller: 1437 KB across these packages before, 1041 KB after.

    Two things change in the published JavaScript. `export` declarations appear inline rather than in a trailing `export { ... }` list, and the line structure is the source's rather than a bundler's, so a stack trace or a source map lands where the code was written.

    `github-settings-as-code` was already compiled by `tsc`; what it gains here is the removal pass, so its `dist/` no longer carries `expectType(...)` calls.

- Updated dependencies [30de8fa]
    - ts-data-forge@14.6.3

## 3.0.0

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
    - ts-data-forge@14.5.0

## 2.0.2

### Patch Changes

- 40ff18c: Point `module` and `types` at files that exist. Both named `./dist/index.js`
  and `./dist/index.d.ts`, which the build has never emitted — it emits
  `./dist/index.mjs` and `./dist/index.d.mts`, as the `exports` map already said.
  Modern resolution reads `exports` and was unaffected; anything falling back to
  the legacy fields found nothing.

    Also declare `engines` (Node >= 22.22.2) and `publishConfig`, bringing these
    packages in line with the rest of the repository.

## 2.0.1

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
    - ts-data-forge@14.2.1
    - ts-type-forge@9.2.1

## 2.0.0

### Major Changes

- 6f4805e: Upgrade to `ts-data-forge` 14 and `ts-type-forge` 9.

    Both are dependencies whose types appear in these packages' public
    signatures, so consumers that also depend on them directly have to upgrade in
    step.

    BREAKING CHANGE: requires `ts-data-forge` >= 14 and `ts-type-forge` >= 9.

## 1.0.2

### Patch Changes

- e667fe3: Updated ts-type-forge to v3.1.0.

## 1.0.1

### Patch Changes

- 759b7d5: The implementation has been modified to explicitly import ts-type-forge internally.

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

## 0.1.2

### Patch Changes

- 5cb2c32: Updated README.md

## 0.1.1

### Patch Changes

- fec0a16: Fix README

## 0.1.0

### Minor Changes

- 799a759: Initial release
