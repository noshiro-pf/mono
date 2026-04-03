---
title: 'createState in Depth'
description: Deep dive into createState — SynState's core API for creating reactive state with getters, setters, and reset functionality.
sidebar:
    order: 3
---

The [Quick Example](/synstate/getting-started/introduction/#quick-example) showed that `createState` returns a 3-element tuple. This page covers the third element in detail, along with key design differences from React's `useState`.

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

See the [API reference for `createReducer`](/synstate/reference/create-reducer/) for a full example.

## `createBooleanState` — Toggle State

For boolean flags (modals, drawers, dark mode, etc.), `createBooleanState` provides convenient named methods so you don't need to write `() => setState(true)` wrappers:

```ts
const [isOpen$, { setTrue: open, setFalse: close, toggle }] =
    createBooleanState(false);

open(); // isOpen$ emits true
close(); // isOpen$ emits false
toggle(); // isOpen$ emits true
```

The returned methods (`setTrue`, `setFalse`, `toggle`) have stable references and can be passed directly as event handler callbacks.

See the [API reference for `createBooleanState`](/synstate/reference/create-boolean-state/) for a full example with React integration.
