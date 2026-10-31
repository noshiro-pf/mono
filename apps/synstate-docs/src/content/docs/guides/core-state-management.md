---
title: 'createState in Depth'
description: Deep dive into createState — SynState's core API for creating reactive state with getters, setters, and reset functionality.
sidebar:
    order: 3
---

The [Quick Example](/mono/synstate/getting-started/introduction/#quick-example) showed that `createState` returns a 3-element tuple. This page covers the third element in detail, along with key design differences from React's `useState`.

## The Third Element

```ts
const [
    state,
    setState,
    { updateState, resetState, getSnapshot, initialState },
] = createState(0);
```

| Function       | Type                              | Description                                         |
| :------------- | :-------------------------------- | :-------------------------------------------------- |
| `setState`     | `(v: S) => S`                     | Set the state to a new value                        |
| `updateState`  | `(updateFn: (prev: S) => S) => S` | Update the state using a function of previous value |
| `resetState`   | `() => S`                         | Reset the state to its initial value                |
| `getSnapshot`  | `() => S`                         | Read the current value synchronously                |
| `initialState` | `S`                               | The initial value passed to `createState`           |

## Synchronous State Updates

Unlike React's `useState` setter, which schedules asynchronous re-renders, `setState`, `updateState`, and `resetState` in SynState execute **synchronously** and return the updated state value. You can also call `getSnapshot()` immediately after a state update to retrieve the latest value.

```ts
const [
    state,
    setState,
    { updateState, resetState, getSnapshot, initialState },
] = createState(0);

// setState returns the new state value synchronously
const newValue = setState(42);
console.log(newValue); // 42

// updateState also returns the new state value
const updated = updateState((prev) => prev + 1);
console.log(updated); // 43

// getSnapshot() reflects the latest state immediately
console.log(getSnapshot()); // 43

// resetState returns the initial state value
const reset = resetState();
console.log(reset); // 0
```

## Do Not Write to State While an Update Propagates

Because updates are synchronous, a `setState` (or `updateState`, `resetState`, `dispatch`, `next`) called from a subscriber or from a projection such as `map` runs while the update that triggered it is still propagating. The write still propagates immediately, but other subscribers can see an intermediate state, and writing back to the state being propagated can recurse without end. SynState logs a `console.warn` the first time each state is written to this way.

```ts
const [a$, setA] = createState(0);

const [b$, setB] = createState(0);

// ❌ Writes to b$ while a$ is propagating
a$.subscribe((a) => {
    setB(a * 2);
});

setA(1); // console.warn: synstate: an observable was written to ...
```

Derive the value from its source instead. The derived observable is part of the graph, so it is updated without glitches and shows up in the debugger:

```ts
const [a$, setA] = createState(0);

// ✅ b$ is derived from a$
const b$ = a$.pipe(map((a) => a * 2));

setA(1);
```

If a slow side effect or an `await` stands between the source and the value, make that part of the graph too, with `fromPromise`, `switchMap` and similar operators. Writes from event handlers, timers and `queueMicrotask` callbacks run outside propagation and are not affected.

The `synstate/no-write-during-propagation` rule of [`eslint-plugin-synstate`](/mono/synstate/getting-started/installation/#eslint-plugin) reports a write from a `subscribe` callback, or from an operator inside `pipe`, where it is written, before it runs. It recognizes the functions whether they are imported from `synstate` or from the hooks and Preact Signals packages that re-export it, and treats a `useObservableEffect` callback as a subscriber too.

## Design Choice: Separate `setState` and `updateState`

In React's `useState`, the setter function accepts both a direct value and an updater function (overloaded):

```ts
// React useState — single setter handles both forms
setCount(5); // direct value
setCount((prev) => prev + 1); // updater function
```

SynState intentionally separates these into two distinct functions — `setState` for setting a value directly and `updateState` for updating based on the previous state:

```ts
// SynState — explicit, separate functions
setState(5); // direct value
updateState((prev) => prev + 1); // updater function
```

This avoids the ambiguity of overloaded signatures and makes the intent of each call explicit. There is no runtime guessing about whether the argument is a value or a function.

## `createReducer` — Redux-Style State

For state that transitions through well-defined actions, `createReducer` provides a familiar Redux-like pattern. Instead of `setState` / `updateState`, you `dispatch` typed actions:

```ts
type Action = Readonly<{ type: 'increment' } | { type: 'decrement' }>;

const [state, dispatch] = createReducer((s: number, action: Action) => {
    switch (action.type) {
        case 'increment':
            return s + 1;
        case 'decrement':
            return s - 1;
    }
}, 0);

dispatch({ type: 'increment' }); // state is now 1
```

Like `createState`, `dispatch` executes synchronously and returns the new state. The returned `state` is an `InitializedObservable` that you can subscribe to or derive from with operators.

See the [API reference for `createReducer`](/mono/synstate/reference/create-reducer/) for a full example.

## `createBooleanState` — Toggle State

For boolean flags (modals, drawers, dark mode, etc.), `createBooleanState` provides convenient named methods so you don't need to write `() => setState(true)` wrappers every time:

```ts
const [isOpen$, { setTrue: open, setFalse: close, toggle }] =
    createBooleanState(false);

open(); // isOpen$ emits true
close(); // isOpen$ emits false
toggle(); // isOpen$ emits true
```

The returned methods (`setTrue`, `setFalse`, `toggle`) have stable references and can be passed directly as event handler callbacks.

See the [API reference for `createBooleanState`](/mono/synstate/reference/create-boolean-state/) for a full example with React integration.
