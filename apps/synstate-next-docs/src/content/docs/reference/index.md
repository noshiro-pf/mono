---
title: All APIs
description: Every public API of synstate-next, by what it is for, with a page for each.
---

Each page gives the API's description, taken from its JSDoc, and an example that runs as a test. An operator's page also says what `pipe` makes of its result, and most draw a marble diagram that a test checks against the operator itself.

<!-- reference:api-list -->

## State

- [`createState`](/mono/synstate-next/reference/state/create-state/): A state as a tuple of the observable, its setter and the rest, for code that passes them to different places.
- [`createReducer`](/mono/synstate-next/reference/state/create-reducer/): A state written only by `dispatch`, through `reducer`.
- [`createBooleanState`](/mono/synstate-next/reference/state/create-boolean-state/): A boolean state with `setTrue`, `setFalse` and `toggle`.
- [`state`](/mono/synstate-next/reference/state/state/): Creates a state holding `initial`.

## Events

- [`createValueEmitter`](/mono/synstate-next/reference/events/create-value-emitter/): An event source of `A`, and the function that emits a value on it.
- [`createEventEmitter`](/mono/synstate-next/reference/events/create-event-emitter/): An event source of `undefined`, and the function that emits it.
- [`source`](/mono/synstate-next/reference/events/source/): Creates an event source, holding no value until its first `next`.

## Sources

- [`just`](/mono/synstate-next/reference/sources/just/): Holds `value` and is settled: it never emits.
- [`empty`](/mono/synstate-next/reference/sources/empty/): Holds nothing and is settled: it never emits.
- [`fromPromise`](/mono/synstate-next/reference/sources/from-promise/): Emits the outcome of `promise` once, as `Result.ok(value)` or `Result.err(error)`, in an update of its own, and settles.
- [`fromAbortablePromise`](/mono/synstate-next/reference/sources/from-abortable-promise/): Calls `factory` with an `AbortSignal` and emits the outcome of the promise it returns, as `fromPromise` does.
- [`fromSubscribable`](/mono/synstate-next/reference/sources/from-subscribable/): Follows `subscribable`, emitting each of its values as `Result.ok(value)` and an error as `Result.err(error)`.
- [`timer`](/mono/synstate-next/reference/sources/timer/): Emits `0` once, `milliseconds` after it is created, and settles.
- [`counter`](/mono/synstate-next/reference/sources/counter/): Emits `0` in the task after it is created (or, with `emitInitial: false`, `1` one interval later), then the next integer every `milliseconds`.
- [`createSource`](/mono/synstate-next/reference/sources/create-source/): Creates a source that emits by itself, from another library or an event: a creator written outside the package.

## Combining

- [`combine`](/mono/synstate-next/reference/combining/combine/): The latest values of `parents` as a tuple, on every update that reaches it.
- [`derive`](/mono/synstate-next/reference/combining/derive/): Computes `fn` from the values of `parents`, once per update however many of them changed, and emits the result unless it equals the one held.
- [`merge`](/mono/synstate-next/reference/combining/merge/): Emits the value of whichever parent emitted in this update (the first of them, if several did).
- [`zip`](/mono/synstate-next/reference/combining/zip/): Emits the `n`-th values of all `parents` as a tuple, once each of them has emitted its `n`-th.

## Operators

- [`map`](/mono/synstate-next/reference/operators/map/): Maps each value with `fn`, and emits the result unless it equals the one held (`Object.is` unless `equals` says otherwise), so a result that did not change wakes nothing below.
- [`filter`](/mono/synstate-next/reference/operators/filter/): Passes on the values that satisfy `predicate`.
- [`scan`](/mono/synstate-next/reference/operators/scan/): Accumulates the values with `reducer`, starting from `seed`.
- [`pairwise`](/mono/synstate-next/reference/operators/pairwise/): Emits the previous and the current value of the source as a pair, on every value from the second on.
- [`take`](/mono/synstate-next/reference/operators/take/): Passes the first `count` values of the source, the one it holds at the start included, and then nothing, keeping the last value passed.
- [`skip`](/mono/synstate-next/reference/operators/skip/): Drops the first `count` values of the source, the one it holds at the start included, and passes the rest.
- [`takeWhile`](/mono/synstate-next/reference/operators/take-while/): Passes the values of the source while `predicate` holds for them; from the first value it fails for, passes nothing, keeping the last value passed.
- [`skipWhile`](/mono/synstate-next/reference/operators/skip-while/): Drops the values of the source while `predicate` holds for them; from the first value it fails for, passes every value.
- [`takeUntil`](/mono/synstate-next/reference/operators/take-until/): Follows the source until `notifier` emits, then passes nothing, keeping the last value passed.
- [`skipUntil`](/mono/synstate-next/reference/operators/skip-until/): Passes nothing until `notifier` emits, then every value of the source, the one it emits in the update the notifier emits in included.
- [`skipIfNoChange`](/mono/synstate-next/reference/operators/skip-if-no-change/): Drops a value equal to the one held (`Object.is` unless `equals` says otherwise).
- [`keepEqualParts`](/mono/synstate-next/reference/operators/keep-equal-parts/): Replaces the parts of each value that are deeply equal to the held value's with the held value's own, so that a part that did not change keeps its reference.
- [`withInitialValue`](/mono/synstate-next/reference/operators/with-initial-value/): Holds `initial` until the source emits, then follows the source.
- [`withCurrentValueFrom`](/mono/synstate-next/reference/operators/with-current-value-from/): Pairs each value of the source with the value `other` holds, settled for the same update.
- [`withBufferedFrom`](/mono/synstate-next/reference/operators/with-buffered-from/): Gives each value of the source the values `other` emitted since the previous one, in order: those emitted in the same update included, those it held before this node was created not.
- [`debounce`](/mono/synstate-next/reference/operators/debounce/): Emits the latest value once `milliseconds` have passed without another, in an update of its own.
- [`throttle`](/mono/synstate-next/reference/operators/throttle/): Passes a value at once, then drops the values of the next `milliseconds`.
- [`audit`](/mono/synstate-next/reference/operators/audit/): On a value, waits `milliseconds` and then emits the latest value, in an update of its own; the values in between start no wait of their own.
- [`switchMap`](/mono/synstate-next/reference/operators/switch-map/): Follows the observable that `project` returns for the latest value.
- [`mergeMap`](/mono/synstate-next/reference/operators/merge-map/): Follows every observable that `project` returns, emitting whatever any of them emits.
- [`createDerived`](/mono/synstate-next/reference/operators/create-derived/): Creates an observable that follows `parents`: an operator written outside the package.

## Updates and lifetime

- [`batch`](/mono/synstate-next/reference/lifetime/batch/): Runs `fn`, and propagates every write it makes in one update once it returns.
- [`createOwner`, `createRootOwner`, `getOwner`, `onCleanup`, `untracked`, `Owner`](/mono/synstate-next/reference/lifetime/owners/): The current owner, creating and disposing owners, and registering cleanups.
- [`isObservable`](/mono/synstate-next/reference/lifetime/is-observable/): Whether `value` is an observable of this copy of the package.

<!-- /reference -->
