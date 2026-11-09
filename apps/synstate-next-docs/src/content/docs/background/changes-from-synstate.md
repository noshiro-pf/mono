---
title: Changes from synstate
description: Everything that behaves differently in synstate-next, and what to write instead.
---

synstate-next replaces synstate in its next major version. This page lists what a program written for synstate has to change. The reasons are in [How an update propagates](/mono/synstate-next/internals/how-an-update-propagates/) and [Why there is no completion](/mono/synstate-next/internals/why-no-completion/).

## Reading and subscribing

- **`getSnapshot()` returns the value, or `undefined` when there is none**, not an `Optional`. `hasValue` says whether it holds one, and an `InitializedObservable` has `.value`.
- **`subscribe` returns the function that stops the subscription**, not a `{ unsubscribe }` object.
- **`kind`, `depth`, `isCompleted` and `updateToken` are not public.** A node's depth still orders the update, but it is the library's own.

## Propagation and writes

- **Subscribers run once every value is up to date**, not during the update. A subscriber reads every other value of the graph up to date, unless a subscriber before it in the same update has written (next bullet).
- **A write made inside an operator such as `map` or `derive`, while an update is recomputing values, is deferred** until the update's subscribers and bindings have run, and then starts the next update. A write made by a subscriber or a binding is applied at once and propagates in the next update: a subscriber that runs after it in the same update reads the state's new value, and what derives from it still old. Updates never nest.
- **The setters return nothing**: `setState`, `updateState`, `resetState` of `createState`, `dispatch` of `createReducer`, and those of `createBooleanState`. A write made inside an operator such as `map` or `derive`, while an update is recomputing values, is applied only once the update's subscribers and bindings have run, so what it would return is not known yet; read the state with `getSnapshot`.
- **Circular dependencies are not detected**: a node's parents exist before it, so no cycle can be built through the API.

## Lifetime

- **`complete` is gone.** An observable ends by being disposed. `subscribe` takes one function; there is no `onComplete`.
- **A scope is an owner**: `createScope` is `createOwner`, `getCurrentScope` is `getOwner`, `onScopeDispose` is `onCleanup`. `createRootOwner` makes an owner with no parent, and `untracked` runs a function with no owner.
- **A source that is done is settled, not completed**: a `timer` that fired, a `fromPromise` that resolved, a `fromSubscribable` whose subscribable completed keeps its value and its subscribers until its owner disposes it.
- **A node made from a disposed one is settled at once**, and holds the value it computed from the last value of its parent.
- **`collectToArray` is gone**: it resolved on completion.
- **`timer` and `counter` start when they are created**; `startManually` and `start()` are gone. Create one inside the owner that should stop it.

## Operators

- **`take(n)` and `skip(n)` count the value the source holds at the start**, so `state(0).pipe(take(1))` holds `0` and passes nothing more. synstate counted only the values after it.
- **`takeUntil` and `skipUntil` react to the notifier's emissions after they were created.** A value the notifier already holds is not one. A value the source emits in the update the notifier emits in is dropped by `takeUntil` and passed by `skipUntil`.
- **`withBufferedFrom` buffers what the other observable emits after it was created**; synstate put the value it held into the first buffer.
- **The predicates of `filter` and `skipWhile` receive the value alone**, not its index. A `scan` counts.
- **The operators that are one `map` are gone**: `mapTo` (a `map` with `equals: () => false` on an event), `pluck` and `getKey`, `attachIndex` and `withIndex` (a `scan`), `mapOptional`, `unwrapOptional`, `mapResultOk`, `mapResultErr`, `unwrapResultOk`, `unwrapResultErr`.
- **The aliases are gone**: `withLatestFrom` (`withCurrentValueFrom`), `withBuffered` (`withBufferedFrom`), `distinctUntilChanged` (`skipIfNoChange`), `flatMap` (`mergeMap`).
- **`combine` is gone.** `derive` computes one value from several observables; a `fn` that returns its arguments as a tuple, `derive([a, b], (x, y) => [x, y] as const)`, gives the tuple itself. Its alias `combineLatest` goes with it.

## Sources and helpers

- **`fromSubscribable` subscribes with an observer object** (`next`, `error`, `complete`), the form RxJS recommends and a TC39 `Observable` takes, not with three functions.
- **A state is also an object**: `state(initial)` has `.value`, `.set` and `.update`, and `source()` is an event with `.next`. `createState` and the emitters are the same as tuples.

## Writing operators

- **One factory each**: an operator is a `createDerived` (synstate's `createSyncChildObservable`, `createAsyncChildObservable` and `createInitializedSyncChildObservable`), and a source a `createSource` (`createRootObservable`).
- **No update token**: `ctx.emitted(parent)` says which parent emitted in the update, `ctx.set` passes a value on in it, and `ctx.emit` in an update of its own.
- **`settled` replaces `canEmitNoMore`**, and `flush` is gone with completion.
- **The setup runs with the observable as its owner**: what it creates belongs to the observable, and its cleanups run newest first, before what it created is disposed. synstate ran them in the order registered.
- **The guards `isChildObservable`, `isManagerObservable` and `isRootObservable` are gone**: the kinds they told apart are not in the public types.

## One copy per program

Observables from two copies of the package cannot be combined: the graph throws for an observable from another copy.

## For synstate-dom users

The changes to the UI layer are in synstate-dom-next's [Changes from synstate-dom](/mono/synstate-dom-next/background/changes-from-synstate-dom/).
