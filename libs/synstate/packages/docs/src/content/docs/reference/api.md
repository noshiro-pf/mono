---
prev: false
next: false
title: Index
sidebar:
    order: 1
---

## State Management

SynState provides simple, intuitive APIs for managing application state:

- [**`createState`**](../create-state/): Create state with `InitializedObservable` and setter.
- [**`createReducer`**](../create-reducer/): Create state by reducer and initial value.
- [**`createBooleanState`**](../create-boolean-state/): Specialized state for boolean values.

## Event System

Built-in event emitter for event-driven patterns:

- [**`createValueEmitter`**](../create-value-emitter/): Create type-safe event emitters.
- [**`createEventEmitter`**](../create-event-emitter/): Create event emitters without payload.

## Observable APIs

For complex scenarios, SynState provides observable-based APIs:

### Creation Functions

- [`source<T>()`](../source/): Create a new observable source (almost equivalent to RxJS `subject`).
- [`fromPromise(promise)`](../from-promise/): Create observable from promise.
- [`fromSubscribable()`](../from-subscribable/): Create observable from any subscribable object.
- [`counter(ms)`](../counter/): Emit values at intervals (almost equivalent to RxJS `interval`).
- [`timer(delay)`](../timer/): Emit after delay.

### Combination

- [`combine(observables)`](../combine/): Combine latest values from multiple sources (alias: `combineLatest`).
- [`merge(observables)`](../merge/): Merge multiple streams.
- [`zip(observables)`](../zip/): Pair values by index.

### Operators

#### map variants

- [`map(fn)`](../map/): Transform values.
- [`mapTo(value)`](../map-to/): Map all values to a constant.
- [`getKey(key)`](../get-key/): Extract property value from objects (alias: `pluck`).
- [`attachIndex()`](../attach-index/): Attach index to each value (alias: `withIndex`).

#### Result/Optional

- [`mapOptional(fn)`](../map-optional/): Map over Optional values.
- [`mapResultOk(fn)`](../map-result-ok/): Map over Result ok values.
- [`mapResultErr(fn)`](../map-result-err/): Map over Result error values.
- [`unwrapOptional()`](../unwrap-optional/): Unwrap Optional values to undefined.
- [`unwrapResultOk()`](../unwrap-result-ok/): Unwrap Result ok values to undefined.
- [`unwrapResultErr()`](../unwrap-result-err/): Unwrap Result error values to undefined.

#### Flat map

- [`mergeMap(fn)`](../merge-map/): Map to observables and merge all (runs in parallel) (alias: `flatMap`).
- [`switchMap(fn)`](../switch-map/): Map to observables and switch to latest (cancels previous).

#### Filtering

- [`filter(predicate)`](../filter/): Filter values.
- [`skipIfNoChange()`](../skip-if-no-change/): Skip duplicate values (alias: `distinctUntilChanged`).
- [`skip(n)`](../skip/): Skip first n emissions.
- [`take(n)`](../take/): Take first n emissions then complete.
- [`skipWhile(predicate)`](../skip-while/): Skip values while predicate is true.
- [`takeWhile(predicate)`](../take-while/): Emit values while predicate is true, then complete.
- [`skipUntil(notifier)`](../skip-until/): Skip values until notifier emits.
- [`takeUntil(notifier)`](../take-until/): Complete on notifier emission.

#### Time series processing

- [`audit(ms)`](../audit/): Emit the last value after specified time window (almost equivalent to RxJS `auditTime`).
- [`debounce(ms)`](../debounce/): Debounce emissions (almost equivalent to RxJS `debounceTime`).
- [`throttle(ms)`](../throttle/): Throttle emissions (almost equivalent to RxJS `throttleTime`).

#### Others

- [`pairwise()`](../pairwise/): Emit previous and current values as pairs.
- [`scan(reducer, seed)`](../scan/): Accumulate values.
- [`withBuffered(observable)`](../with-buffered/): Buffer values from observable and emit with parent (alias: `withBufferedFrom`).
- [`withCurrentValueFrom(observable)`](../with-current-value-from/): Sample current value from another observable (alias: `withLatestFrom`).
- [`withInitialValue(value)`](../with-initial-value/): Provide an initial value for uninitialized observable.

### Utilities

- `isChildObservable(obs)`: Check if observable is a child observable.
- `isManagerObservable(obs)`: Check if observable is a manager observable.
- `isRootObservable(obs)`: Check if observable is a root observable.

## Framework Integration

### React / Preact Hooks (`synstate-react-hooks` / `synstate-preact-hooks`)

Both packages share the same API surface. Use `synstate-react-hooks` for React 18+ and `synstate-preact-hooks` for Preact.

#### Hooks

- **`useObservableValue(observable$)`**: Subscribe to an observable and return its current value as component state. Uses `useSyncExternalStore` internally — the component re-renders when the observable emits.
- **`useObservableValue(observable$, fallback)`**: Same as above, with a fallback value for observables without an initial value.
- **`useObservableEffect(observable$, fn)`**: Run a side effect whenever the observable emits. Automatically unsubscribes on unmount.
- **`useValueAsObservable(value)`**: Convert a component prop/state value into a synstate observable. Useful for bridging React/Preact state into the observable graph.

#### State Wrappers

These re-export core `createState` / `createReducer` / `createBooleanState` but return a **hook** (`useCurrentValue`) as the first tuple element instead of the raw observable:

- **`createState(initialValue)`**: Returns `[useCurrentValue, setState, { state, updateState, resetState, getSnapshot }]`.
- **`createReducer(reducer, initialState)`**: Returns `[useCurrentValue, dispatch, { state, getSnapshot }]`.
- **`createBooleanState(initialValue)`**: Returns `[useCurrentValue, { state, setTrue, setFalse, toggle, setState, updateState, resetState, getSnapshot }]`.

### Preact Signals (`synstate-preact-signals`)

Bridges synstate observables with [Preact Signals](https://preactjs.com/guide/v10/signals/) for fine-grained DOM updates without component re-renders. See the [interactive demo](/synstate/preact-signals/demo/) to compare with the hooks approach.

#### Bridge Functions

- **`toSignal(observable$)`**: Convert an `Observable` (or `InitializedObservable`) into a Preact `ReadonlySignal`. The signal stays in sync with the observable. Can be embedded directly in JSX — only the affected text node updates, not the entire component.
- **`toSignal(observable$, fallback)`**: Same as above, with a fallback value for observables without an initial value.
- **`fromSignal(signal)`**: Convert a Preact `Signal` into a synstate `InitializedSourceObservable`. Returns `[observable, dispose]`. The observable mirrors the signal's value, enabling the full synstate operator chain (`map`, `debounce`, `switchMap`, etc.).

#### State Wrappers

Same as the hooks wrappers, but return a **`ReadonlySignal`** instead of a hook:

- **`createState(initialValue)`**: Returns `[signal, setState, { state, updateState, resetState, getSnapshot }]`.
- **`createReducer(reducer, initialState)`**: Returns `[signal, dispatch, { state, getSnapshot }]`.
- **`createBooleanState(initialValue)`**: Returns `[signal, { state, setTrue, setFalse, toggle, setState, updateState, resetState, getSnapshot }]`.
