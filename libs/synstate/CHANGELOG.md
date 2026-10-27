# synstate

## 6.0.0

### Major Changes

- ddbb770: `map` no longer passes on a result equal to the one it holds, so a derived value that did not change wakes nothing below it — what `skipIfNoChange()` after a `map` did, without the extra observable. The comparison is `Object.is`; `map(fn, { equals })` replaces it. The mapping function no longer receives an index either, so a `map` no longer counts its updates.

    Migrating:

    - A `map` that turns events into a value that can repeat — `click$.pipe(map(() => true))`, a request mapped to the id it is for, a `map` run for its side effect that returns nothing — now emits only when the value changes. Use `mapTo(value)`, which still emits on every event, or pass `{ equals: () => false }`.
    - `map((x, i) => ...)` becomes `.pipe(withIndex()).pipe(map(([i, x]) => ...))`. `withIndex` (alias `attachIndex`) still gives `-1` to a value the source already holds.
    - `.pipe(map(fn)).pipe(skipIfNoChange())` can drop the `skipIfNoChange()`.

    `mapTo` takes its value as a `const` type parameter, so `mapTo('reset')` is typed `'reset'` without `as const`. Where the wider type is wanted, widen the value: `mapTo(1 as number)`.

## 5.0.1

### Patch Changes

- 5e9b2c6: `switchMap` and `mergeMap` pass on the value an inner observable already holds when it is subscribed to (`just(x)`, a state) in the update that projected it, rather than in a nested update of its own. A node reading both the operator and its source, directly or through another branch (`combine([source$.pipe(map(f)), source$.pipe(switchMap(g))])`), no longer sees the new inner value beside the source's old one, nor emits twice for one update.

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
    - ts-data-forge@14.10.0

## 4.1.0

### Minor Changes

- ae4efdc: Add `empty()`, an observable that holds no value and is already completed, for the branch of a `switchMap` that should follow nothing. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so `empty` reaches their users as well.

### Patch Changes

- Updated dependencies [079cb28]
    - ts-std-forge@0.5.2
    - ts-data-forge@14.9.0

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
- fa08e31: `createSyncChildObservable`, `createInitializedSyncChildObservable` and `createAsyncChildObservable` take an `init` callback whose tools include `onComplete`, as `createRootObservable`'s do, and `init` may return `{ tryUpdate, canEmitNoMore, flush }` (`SyncChildObservableHooks` / `AsyncChildObservableHooks`) instead of `tryUpdate` alone. The state an operator needs lives inside `init`, next to its teardown and hooks; the config keeps only `parents`, `depth` and `initialValue`, and `AsyncChildObservableConfig` is gone. An operator that completes itself in `init` (a `takeUntil` whose notifier already holds a value) is no longer registered to its parents.
- 2148f2d: `createRootObservable`'s `init` receives an `onComplete` tool that registers a teardown from inside `init`, so a creator such as `fromEvent` no longer has to keep its listener outside `init` for the teardown to reach it. It replaces the `onComplete` field of `RootObservableConfig`, which is removed. Registered teardowns run once, in the order registered; one registered after the observable has completed runs at once.
- 9d29eef: Add a scope API for libraries built on synstate: `createScope(parent?)`, `scope.run(body)`, `scope.dispose()`, `getCurrentScope()`, `onScopeDispose(cleanup)` and `untracked(body)`. An observable created synchronously inside `scope.run` belongs to that scope, and disposing the scope disposes it without completing the shared observables it was derived from. Observables created outside every scope behave as before. `run` and `dispose` read the scope they are called on, so call them on it (`scope.dispose()`) rather than passing them on detached.

### Patch Changes

- ebc71f8: `switchMap` and `mergeMap` no longer complete an inner observable they did not create. Each projection now runs in a scope of its own, and switching away (`switchMap`) or completing disposes what the projection created there; an observable created outside the projection and only returned by it, such as one shared with other subscribers, is unsubscribed and keeps running.
- Updated dependencies [f89dc57]
    - ts-data-forge@14.8.0

## 3.4.0

### Minor Changes

- 355ee36: `counter(ms, { times: n })` completes right after its `n`-th value and clears its timers. Completion does not travel upstream, so `counter(ms).pipe(take(n))` leaves the counter running; `times` is the way to stop it.
- 3659166: `next` on a source with an initial value returns the value held after the call: the value passed, or, once the source is completed, the value it already holds. `dispatch` of `createReducer`, and `setState`, `updateState`, `resetState` and `toggle` of `createState` and `createBooleanState`, return what `next` returns, so after completion they give the state held instead of a value that was never applied.
- 93fca29: Warn (`console.warn`, once per observable) when a root observable is written to — `next`, `setState`, `dispatch` and the like — from a subscriber or a projection while another update is still propagating. The write still propagates immediately, as before; derive the value from its source (`map`, `combine`, …) instead. Writes from event handlers, timers and microtasks are unaffected, as is a root created during propagation emitting while it is created.

### Patch Changes

- 3294b9b: A child observable created from parents that have all completed now completes at creation. It keeps the value computed from the parents' final values, and is no longer registered to the completed parents.
- 37d8fcf: `fromSubscribable` now unsubscribes from the wrapped subscribable when the observable completes or is disposed, instead of keeping the subscription alive. It does not unsubscribe when the subscribable completed first. Like `timer` and `counter`, it is now also completed when a child completes and nothing else uses it.
- 6fad4fe: `takeUntil` and `skipUntil` now unsubscribe from their notifier. `takeUntil` releases it when the result completes for any reason (the notifier, the parent, a finished downstream, or `complete()`); `skipUntil` releases it on the notifier's first emission, or when the result completes before that. Both now complete, like other operators with a teardown, when their last downstream completes and nothing else subscribes to them.
- 63f9924: `withBufferedFrom` (and its alias `withBuffered`) now unsubscribes from the buffered observable and empties its buffer when the result completes or is disposed. Before, the subscription was kept and values kept piling up in a buffer nobody read. Like other operators that hold a resource (`debounce`, `switchMap`, ...), the result now also completes when a child of it completes and it has no subscriber or other active child left.
- fa894b6: `zip` completes once a completed source has no value left to pair, as its documentation says and as RxJS's `zip` does: at once if that source completes with nothing queued, otherwise right after the tuple that takes its last queued value. It used to wait until every source had completed.

## 3.3.0

### Minor Changes

- 16f5b5e: Completing a derived observable no longer completes an upstream observable that releases nothing by completing. A `source`, `createState` or `just`, and anything derived from them alone, now stays alive when the last of its children completes, so a state shared by several consumers is not ended by one of them cleaning up. An observable with a teardown of its own (`counter`, `timer`, `fromAbortablePromise`, `debounce`, `throttle`, `audit`, `switchMap`, `mergeMap`), or derived from one, still completes once nothing uses it; the new `autoComplete` flag says which. Adds `dispose()`, which completes an observable and takes it out of the graph without completing any of its parents.

## 3.2.1

### Patch Changes

- 6fb237f: A completed observable is now removed from its parents and from the propagation order of the observables that start updates, so it no longer computes on every later update of its root. Creating many derived observables under one root is also no longer quadratic.

## 3.2.0

### Minor Changes

- 18c78df: `counter(ms, { emitInitial: false })` skips the `0` that `counter` emits right after it starts, so the first value is `1`, one interval later (like RxJS `interval(ms)`; the default stays `timer(0, ms)`). Completing a counter now also clears its interval when no `0` was scheduled, and the pending `0` is cleared with `clearTimeout`.

## 3.1.0

### Minor Changes

- 4a4def4: Add an `equals` option to `createState`, `createReducer` and `createBooleanState`. When it says the next state equals the current one, the update is not passed on — no subscriber, and nothing derived from the state, is told of it — and the current state is kept, so `setState` and the like return it. Without the option every update is passed on, as before; the next major makes `Object.is` the default.

### Patch Changes

- 1dfef75: Remove the stray indentation from the `createBooleanState` JSDoc example, which
  the sample embedding carried over from the test wrapper around it.

## 3.0.6

### Patch Changes

- fd6454d: Make the four observable state flags (`isCompleted`, `updateToken`,
  `hasSubscriber`, `hasChild`) plain data properties kept in step by the base
  handle, instead of getters delegating to it. `updateToken` is read once per
  child per update, so the propagation path was paying an accessor call plus a
  closure call per step where a field read would do, and an object literal
  carrying accessors is far more expensive to create than one carrying data.

    Measured with `pnpm run benchmark` on one machine: the derived chain's 100,000
    updates 16.7 ms -> 13.6 ms, the diamond 36.7 ms -> 32.6 ms, the deep chain at
    K=1000, M=200 15.6 ms -> 11.2 ms, and the cascaded diamond at N=20 — dominated
    by graph construction — 587 ms -> 362 ms. No API change.

## 3.0.5

### Patch Changes

- 41f401e: Type `depth` as `0` on `RootObservable` and `InitializedRootObservable`, as it
  was meant to be. The conditional compared the whole `ObservableKind` union with
  `'root'` instead of the observable's own kind, so it always resolved to
  `number`. Child observables keep `number`, and nothing changes at runtime.

## 3.0.4

### Patch Changes

- 90bf42e: `TimerId` is `ReturnType<typeof setTimeout>` again.

    It became `NonNullable<Parameters<typeof clearTimeout>[0]>` only because the
    strict standard library resolved `ReturnType<typeof setTimeout>` to `unknown`,
    which `clearTimeout` would not accept. That is fixed in the library, so the type
    goes back to being defined by what produces the handle rather than by what
    consumes it — which is what it was for the whole of this package's history until
    then.

    Under `@types/node` this narrows the alias from
    `string | number | NodeJS.Timeout` to `NodeJS.Timeout`. Every value of this type
    comes out of `setTimeout` / `setInterval`, so nothing that stored a handle is
    affected; code that put a bare `number` into a `TimerId` on Node is.

## 3.0.3

### Patch Changes

- 6e23aed: Back every JSDoc `@example` with a type-checked sample file

    The `@example` blocks under `src/` are filled from real `.mts` files under
    `samples/`, which the package type-checks and — where the package runs its
    samples — executes as Vitest cases. Forty-four source files still carried
    `@example` blocks written by hand, so what they showed was compiled by
    nothing: the snippets are now sample files, and the ones that cannot be
    reached from `samples/` — a module-local helper, or a block that is not
    TypeScript at all — say what they do in prose instead.

    Documentation only; no runtime or type change. A few examples read slightly
    differently for it, because an illustration with nothing to assert became one
    with an assertion.

- Updated dependencies [6e23aed]
    - ts-data-forge@14.7.1
    - ts-std-forge@0.5.1

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
