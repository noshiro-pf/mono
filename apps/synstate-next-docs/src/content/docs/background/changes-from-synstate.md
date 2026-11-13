---
title: Changes from synstate
description: Everything that behaves differently in synstate-next, and what to write instead.
---

synstate-next replaces synstate in its next major version. This page lists what a program written for synstate has to change. The reasons are in [How an update propagates](/mono/synstate-next/internals/how-an-update-propagates/) and [Why there is no completion](/mono/synstate-next/internals/why-no-completion/).

## Reading and subscribing

- **`getSnapshot()` returns an `Optional` as before**, the same object while the value is the same. An `InitializedObservable` has `.value`, which reads the value without building an `Optional`. There is no separate `hasValue`, as in synstate: `Optional.isSome(o.getSnapshot())` says whether an observable holds a value.
- **`subscribe` returns the function that stops the subscription**, not a `{ unsubscribe }` object.
- **`kind`, `depth` and `updateToken` are not public.** A node's depth still orders the update, but it is the library's own. `isCompleted` became `settled`; see the `complete` bullet below.

## Propagation and writes

- **Subscribers run once every value is up to date**, not during the update. A subscriber reads every other value of the graph up to date, unless a subscriber before it in the same update has written (next bullet).
- **A write made inside an operator such as `map` or `derive`, while an update is recomputing values, is deferred** until the update's subscribers and bindings have run, and then starts the next update. A write made by a subscriber or a binding is applied at once and propagates in the next update: a subscriber that runs after it in the same update reads the state's new value, and what derives from it still old. Updates never nest.
- **The setters return nothing**: `setState`, `updateState`, `resetState` of `createState`, `dispatch` of `createReducer`, and those of `createBooleanState`. A write made inside an operator such as `map` or `derive`, while an update is recomputing values, is applied only once the update's subscribers and bindings have run, so what it would return is not known yet; read the state with `getSnapshot`.
- **Circular dependencies are not detected**: a node's parents exist before it, so no cycle can be built through the API.

## Lifetime

- **`complete` is gone.** An observable ends by being disposed. `subscribe` takes one function; there is no `onComplete`. `settled` takes the place of `isCompleted`, and turns true sooner: a `take`, or a `takeWhile` with `inclusive`, is settled already when its subscriber receives its last value, where synstate completed after it. A subscriber reads it to tell the last value; where the end has no value of its own, send it as one ([Why there is no completion](/mono/synstate-next/internals/why-no-completion/#telling-the-last-value)).
- **A scope is an owner**: `createScope` is `createOwner`, `getCurrentScope` is `getOwner`, `onScopeDispose` is `onCleanup`. `createRootOwner` makes an owner with no parent, and `untracked` runs a function with no owner.
- **A source that is done is settled, not completed**: a `timer` that fired, a `fromPromise` that resolved, a `fromSubscribable` whose subscribable completed keeps its value and its subscribers until its owner disposes it.
- **A node made from a disposed one is settled at once**, and holds the value it computed from the last value of its parent.
- **`collectToArray` is gone**: it resolved on completion.
- **`timer` and `counter` start when they are created**; `startManually` and `start()` are gone. Create one inside the owner that should stop it.

## Operators

- **`take(n)` and `skip(n)` count the value the source holds at the start**, so `state(0).pipe(take(1))` holds `0` and passes nothing more. synstate counted only the values after it.
- **`takeUntil` and `skipUntil` react to the notifier's emissions after they were created.** A value the notifier already holds is not one. A value the source emits in the update the notifier emits in is dropped by `takeUntil` and passed by `skipUntil`.
- **`withBufferedFrom` buffers what the other observable emits after it was created**; synstate put the value it held into the first buffer.
- **`merge` starts from the value of the parent whose value was given last** (of those given in one update, the first parent's), so a merge of states calls a new subscriber at once; synstate's held nothing until a parent emitted. End a merge in `dropInitialValue()` to keep it an event stream. `withInitialValue` keeps a value its source already holds, so a `merge([…]).pipe(withInitialValue(x))` carried over from synstate starts from the merged value rather than `x`.
- **The predicates of `filter` and `skipWhile` receive the value alone**, not its index. A `scan` counts.
- **The operators that are one `map` are gone**: `mapTo` (a `map` with `equals: () => false` on an event), `pluck` and `getKey`, `attachIndex` and `withIndex` (a `scan`), `mapOptional`, `unwrapOptional`, `mapResultOk`, `mapResultErr`, `unwrapResultOk`, `unwrapResultErr`.
- **The aliases are gone**: `withLatestFrom` (`withCurrentValueFrom`), `withBuffered` (`withBufferedFrom`), `distinctUntilChanged` (`skipIfNoChange`), `flatMap` (`mergeMap`).
- **`combine` is gone.** `derive` computes one value from several observables; a `fn` that returns its arguments as a tuple, `derive([a, b], (x, y) => [x, y] as const)`, gives the tuple itself. Its alias `combineLatest` goes with it.

## Sources and helpers

- **`fromSubscribable` subscribes with an observer object** (`next`, `error`, `complete`), the form RxJS recommends and a TC39 `Observable` takes, not with three functions.
- **A state is also an object**: `state(initialValue)` has `.value`, `.set` and `.update`, and `createState` is the same as a tuple.
- **`source()` emits with `.emit`**, not `.next`.
- **`source(initialValue)` is gone**: `source()` takes no argument and holds no value until its first `emit`. A source that starts with a value is a state: `state(initialValue)` drops a write equal to the value it holds, and passes on the writes made before one update as one. Where every write has to arrive, as with synstate's initialized source, emit on a `source()` and read it through `withInitialValue(initialValue)`. synstate's `.next` returned the value written; `.set`, `.update` and `.emit` return nothing.
- **The functions of an observable, a state and a source are typed as methods**: `getSnapshot`, `subscribe`, `pipe`, `dispose`, `set`, `update` and `emit` declare their `this`, so TypeScript rejects one taken off its object (`const { set } = count`) or passed where the callee types a `this` of its own (`subscribe`, `onCleanup`, an event handler of synstate-dom-next). synstate's were methods too, typed as plain functions, and threw at the call. Wrap one to pass it: `(value) => { count.set(value); }`.

## Writing operators

- **One factory each**: an operator is a `createDerived` (synstate's `createSyncChildObservable`, `createAsyncChildObservable` and `createInitializedSyncChildObservable`), and a source a `createSource` (`createRootObservable`).
- **No update token**: `ctx.emitted(parent)` says which parent emitted in the update, `ctx.set` passes a value on in it, and `ctx.emit` in an update of its own.
- **`settled` replaces `canEmitNoMore`**, and `flush` is gone with completion.
- **The setup runs with the observable as its owner**: what it creates belongs to the observable, and its cleanups run newest first, before what it created is disposed. synstate ran them in the order registered.
- **`WithInitialValueOperator` is `ProvideInitialValueOperator`**, a verb like the other two operator types, `KeepInitialValueOperator` and `DropInitialValueOperator`.
- **The guards `isChildObservable`, `isManagerObservable` and `isRootObservable` are gone**: the kinds they told apart are not in the public types.

## Types

- **`ObservableValue` stays, and takes only an observable type**: `ObservableValue<Observable<number> | undefined>` is an error, where synstate dropped the `undefined`, and `ObservableValue<never>` is `unknown` rather than `never`.
- **Some types are renamed**: `Subscription` is `Unsubscribe`, the function `subscribe` returns; `Scope` is `Owner`; `Unwrap` is `ValuesOf`; `SourceObservable` is `Source`. The types for writing operators and sources (`RootObservableConfig`, `RootObservableTools`, `ChildObservableConfig`, `SyncChildObservableHooks`, `SyncChildObservableTools`, `AsyncChildObservableHooks`, `AsyncChildObservableTools`) are `SourceContext`, `DerivedContext` and `DerivedBehavior`.
- **Some types are gone**: `Subscriber`, with `onComplete`; `InitializedSourceObservable`, with `source(initialValue)`; the type of each kind of observable (`ObservableBase`, `ObservableKind`, `RootObservable`, `ChildObservable`, `ManagerObservable`, `TimerObservable`, `MapOperatorObservable` and the rest), since an observable is an `Observable` or an `InitializedObservable`; `Operator`, since an operator is typed by one of the three operator types; `UpdateToken` and `TimerId`; and the helpers `Wrap`, `WrapInitialized`, `NonEmptyUnknownList` and `TupleToQueueTuple`.

## One copy per program

Observables from two copies of the package cannot be combined: the graph throws for an observable from another copy.

## For synstate-dom users

The changes to the UI layer are in synstate-dom-next's [Changes from synstate-dom](/mono/synstate-dom-next/background/changes-from-synstate-dom/).
