# synstate-react-hooks

## 6.1.0

### Minor Changes

- 388a021: Add `derive(parents, (a, b) => …, { equals })`, which derives one value from the latest values of several observables as a single observable. It calls the projection with the parents' values as arguments, emits once every parent has a value and then whenever one of them emits, and stops a result `Object.is` the one it holds unless `equals` says otherwise. `combine(parents).pipe(map(fn))` emits the same values with two observables and a tuple built on every update; `derive` builds none. `combine` keeps emitting the tuple, now through `derive`, which makes `combine(...).pipe(map(...))` faster too. synstate-react-hooks, synstate-react-hooks-compat, synstate-preact-hooks and synstate-preact-signals re-export `derive`.

    synstate-dom's `derive` now builds on it, so a value derived from several bindables is one observable, and blueprint-synstate's components use it in place of `combine` + `map`. Both now need synstate 6.1.0 or later.

### Patch Changes

- Updated dependencies [388a021]
    - synstate@6.1.0

## 6.0.0

### Major Changes

- ddbb770: `map` no longer passes on a result equal to the one it holds, so a derived value that did not change wakes nothing below it — what `skipIfNoChange()` after a `map` did, without the extra observable. The comparison is `Object.is`; `map(fn, { equals })` replaces it. The mapping function no longer receives an index either, so a `map` no longer counts its updates.

    Migrating:

    - A `map` that turns events into a value that can repeat — `click$.pipe(map(() => true))`, a request mapped to the id it is for, a `map` run for its side effect that returns nothing — now emits only when the value changes. Use `mapTo(value)`, which still emits on every event, or pass `{ equals: () => false }`.
    - `map((x, i) => ...)` becomes `.pipe(withIndex()).pipe(map(([i, x]) => ...))`. `withIndex` (alias `attachIndex`) still gives `-1` to a value the source already holds.
    - `.pipe(map(fn)).pipe(skipIfNoChange())` can drop the `skipIfNoChange()`.

    `mapTo` takes its value as a `const` type parameter, so `mapTo('reset')` is typed `'reset'` without `as const`. Where the wider type is wanted, widen the value: `mapTo(1 as number)`.

### Patch Changes

- Updated dependencies [ddbb770]
    - synstate@6.0.0

## 5.0.1

### Patch Changes

- Updated dependencies [5e9b2c6]
    - synstate@5.0.1

## 5.0.0

### Major Changes

- 69956bd: An update now visits only the nodes its value reaches. Every node that emits puts its children into a queue of the update, one bucket per depth, and the update visits the buckets shallowest first, so each node still runs once per update and only after all its parents have settled (glitch-free). A root no longer keeps a list of all its descendants, and a descendant no longer registers to every root it can be reached from: building a graph in which many roots meet is linear in its edges (a 1,000-task critical-path schedule with a state per task builds in about 30 ms instead of a second), and an update stopped by `filter` or `skipIfNoChange` costs only the nodes above the stop (0.07 ms instead of 1.1 ms in that schedule). An update in which every node changes costs about the same as before, between 25% faster and 30% slower depending on the graph.

    Breaking changes:

    - `tryUpdate` of an observable made with `createChildObservable` (and the other child factories) is called only on updates in which at least one of its parents emitted. It used to be called on every update of a root it descends from.
    - `UpdateToken` is an opaque object type instead of a symbol.
    - An observable's children are queued before its subscribers run. A node created during an update is updated by it when one of its parents emits after the node was created; it used to keep the value it was created with until the next update.
    - Nodes at the same depth are visited in the order their parents emitted rather than the order they were created.
    - At most 100 updates can be nested, one started inside another by a write from a subscriber or projection. A write that would open the 101st throws an error that names the loop; a loop that never converges used to run until the stack overflowed.

    `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the change reaches their users as well.

### Minor Changes

- 7f3e173: Add the `keepEqualParts` option of `createState`, `createReducer` and `createBooleanState`, and the `keepEqualParts()` operator. With `keepEqualParts: true`, an update is compared with the current state before it is written: every part deeply equal to the same part of the current state is kept as that part, and an update deeply equal to the whole state is not passed on at all, so a state written whole from a server's answer hands a new object only to the readers of what changed. `keepEqualParts: { key }` matches array items by key rather than by index. The `keepEqualParts()` operator does the same to a stream, for a source that is not yours to change; prefer the option, which keeps references where the value is written so that nothing downstream has anything to undo.

    `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the operator is exported from them as well.

### Patch Changes

- Updated dependencies [7f3e173]
- Updated dependencies [69956bd]
- Updated dependencies [7f3e173]
    - synstate@5.0.0
    - ts-data-forge@14.10.0

## 4.1.0

### Minor Changes

- ae4efdc: Add `empty()`, an observable that holds no value and is already completed, for the branch of a `switchMap` that should follow nothing. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so `empty` reaches their users as well.

### Patch Changes

- Updated dependencies [079cb28]
- Updated dependencies [ae4efdc]
    - ts-data-forge@14.9.0
    - synstate@4.1.0

## 4.0.0

### Major Changes

- 7fae955: `debounce` and `audit` now pass on the value their timer is holding when they complete, and drop it when they are disposed. Completing either used to discard that value, so the last value of a source that completes within the window was lost; `complete()`, and the completion of the source, now emit it first and then complete. `dispose()` releases the timer without emitting, because a disposed observable has no one left to tell. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the change reaches their users as well.
- c71a482: The observable types keep only the members meant for users — `id`, `kind`, `parents` (on child observables), `getSnapshot`, `isCompleted`, `updateToken`, `depth`, `subscribe`, `pipe`, `complete` and `dispose` — and can no longer be satisfied with an object literal. `addChild`, `deleteChild`, `addDescendant`, `deleteDescendant`, `tryUpdate`, `tryComplete`, `hasActiveChild`, `hasSubscriber` and `hasChild` leave them; they are still there at run time, for propagation, but code reading them no longer compiles. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the change reaches their users as well.
- ebcf3fd: Creating an observable costs several times less: every observable is now an instance of a class — `ObservableBaseClass` and, below it, one class for each creator and operator — whose methods live on the prototype, rather than a set of closures made for each observable, and the collections of children and subscribers are made when the first one arrives. Two things change for users. The methods read `this`, so they must be called on the observable (`obs$.subscribe(f)`, `source$.next(v)`); taking one off it (`const { subscribe } = obs$`, `const { next } = source$`) or passing it as a callback no longer works. This holds for `getSnapshot`, `subscribe`, `pipe`, `complete` and `dispose`, and for `next` of a source and `start` of a timer or counter. Observables no longer carry an `id`, and the `ObservableId` and `SubscriberId` types are removed; nothing in synstate needed them once creating an observable stopped issuing ids. `UpdateToken` stays a symbol, now one per update rather than one per observable as well. The check for circular dependencies at creation runs only outside production (`NODE_ENV` other than `production`). `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the change reaches their users as well.
- 77ce113: Completing an observable no longer completes the observables it is derived from, and `autoComplete` is removed. A child's `complete()` no longer calls `tryComplete` on its parents: an observable completes only when it is completed itself or when all of its parents have completed. An unused upstream with a teardown (`counter`, `timer`, `debounce`, `switchMap`, …) keeps running until its owner completes or disposes it, so `counter(1000).pipe(take(3))` no longer stops the counter; complete the counter yourself once nothing needs it. `complete()` and `dispose()` now behave the same with respect to parents. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the change reaches their users as well.
- 047effb: Make `Object.is` the default `equals` of `createState`, `createReducer` and `createBooleanState`.

    An update whose next state is `Object.is`-equal to the current one is no longer passed on: no subscriber, and nothing derived from the state, is told of it, and the current state is kept. Pass `equals: () => false` to pass on every update as before.

    `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` pass `equals` through, so the change reaches their users too: the signal, the components using the hook and the subscribers of `state` are not told of such an update.

- 2c32c75: `take(n)` now completes in the same update as its `n`th emission, after passing that value on to its subscribers and to everything derived from it. Before, it completed only when the `n + 1`th value arrived, so `counter(1000).pipe(take(3))` stayed open for another tick after emitting three values, and over a source that emits exactly `n` times it stayed open until that source completed. The initial value is still passed on and not counted. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the change reaches their users as well.

### Minor Changes

- 3d8fa18: The factories every built-in observable is made by are exported for writing custom creators and operators: `createRootObservable`, `createSyncChildObservable`, `createInitializedSyncChildObservable` and `createAsyncChildObservable`, with their config and tools types. A custom operator tells whether a parent emitted in the update now propagating by comparing the parent's `updateToken` with the token its `tryUpdate` receives, as the built-in ones do. A guide, "Custom Operators and Creators", shows how. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the factories reach their users as well.
- b6a174d: Add `isObservable(value)`, which tells an observable made by synstate from any other value. Every observable now carries a symbol key that marks it, so a plain object that happens to have a `subscribe` method is not taken for one. The marker is the same symbol the public observable types were already branded with, so an object literal still cannot pass for an observable. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so `isObservable` reaches their users as well.

### Patch Changes

- Updated dependencies [7fae955]
- Updated dependencies [3d8fa18]
- Updated dependencies [b6a174d]
- Updated dependencies [fa08e31]
- Updated dependencies [c71a482]
- Updated dependencies [f89dc57]
- Updated dependencies [2148f2d]
- Updated dependencies [9d29eef]
- Updated dependencies [ebcf3fd]
- Updated dependencies [ebc71f8]
- Updated dependencies [77ce113]
- Updated dependencies [047effb]
- Updated dependencies [2c32c75]
    - synstate@4.0.0
    - ts-data-forge@14.8.0

## 3.4.0

### Patch Changes

- Updated dependencies [3294b9b]
- Updated dependencies [355ee36]
- Updated dependencies [3659166]
- Updated dependencies [37d8fcf]
- Updated dependencies [6fad4fe]
- Updated dependencies [93fca29]
- Updated dependencies [63f9924]
- Updated dependencies [fa894b6]
    - synstate@3.4.0

## 3.3.0

### Patch Changes

- Updated dependencies [16f5b5e]
    - synstate@3.3.0

## 3.2.1

### Patch Changes

- Updated dependencies [6fb237f]
    - synstate@3.2.1

## 3.2.0

### Patch Changes

- Updated dependencies [18c78df]
    - synstate@3.2.0

## 3.1.1

### Patch Changes

- 01e41a5: `useObservableValue` is declared with one one-argument signature where it had
  two that only refined the return type. Inference is unchanged: it still
  returns `A` for an initialized observable and `A | undefined` otherwise, and
  the two-argument form is untouched.
- synstate@3.1.0

## 3.1.0

### Minor Changes

- 4a4def4: Add an `equals` option to `createState`, `createReducer` and `createBooleanState`. When it says the next state equals the current one, the update is not passed on — no subscriber, and nothing derived from the state, is told of it — and the current state is kept, so `setState` and the like return it. Without the option every update is passed on, as before; the next major makes `Object.is` the default.

### Patch Changes

- Updated dependencies [1dfef75]
- Updated dependencies [4a4def4]
    - synstate@3.1.0

## 3.0.6

### Patch Changes

- Updated dependencies [fd6454d]
    - synstate@3.0.6

## 3.0.5

### Patch Changes

- Updated dependencies [41f401e]
    - synstate@3.0.5

## 3.0.4

### Patch Changes

- Updated dependencies [90bf42e]
    - synstate@3.0.4

## 3.0.3

### Patch Changes

- Updated dependencies [6e23aed]
    - ts-data-forge@14.7.1
    - synstate@3.0.3

## 3.0.2

### Patch Changes

- Updated dependencies [9c21467]
- Updated dependencies [9c21467]
    - ts-data-forge@14.7.0
    - synstate@3.0.2

## 3.0.1

### Patch Changes

- 30de8fa: Build with the native TypeScript compiler and drop Rollup. Each module in `dist/` is emitted by `tsc` as written, then the type tests, the in-source tests, the identity casts and the comments are removed from it. The declarations are unchanged, every module exports the same names as before, and the JavaScript is smaller: 1437 KB across these packages before, 1041 KB after.

    Two things change in the published JavaScript. `export` declarations appear inline rather than in a trailing `export { ... }` list, and the line structure is the source's rather than a bundler's, so a stack trace or a source map lands where the code was written.

    `github-settings-as-code` was already compiled by `tsc`; what it gains here is the removal pass, so its `dist/` no longer carries `expectType(...)` calls.

- Updated dependencies [30de8fa]
    - synstate@3.0.1
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
- Updated dependencies [394ded1]
    - ts-data-forge@14.5.0
    - synstate@3.0.0

## 2.0.2

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

## 2.0.1

### Patch Changes

- Updated dependencies [3d6bca7]
    - synstate@2.0.1
    - ts-data-forge@14.2.1
    - ts-type-forge@9.2.1

## 2.0.0

### Major Changes

- 6f4805e: Upgrade to `ts-data-forge` 14 and `ts-type-forge` 9.

    Both are dependencies whose types appear in these packages' public
    signatures, so consumers that also depend on them directly have to upgrade in
    step.

    BREAKING CHANGE: requires `ts-data-forge` >= 14 and `ts-type-forge` >= 9.

### Patch Changes

- Updated dependencies [6f4805e]
    - synstate@2.0.0

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
