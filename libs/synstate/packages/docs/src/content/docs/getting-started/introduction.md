---
title: Introduction
description: Learn what SynState is — a lightweight, type-safe state management library for TypeScript/JavaScript built on an Observable pattern.
sidebar:
    order: 1
---

<p align="center">
  <img src="/synstate/synstate-logo.png" alt="SynState Logo" width="400" />
</p>

**SynState** is a lightweight, high-performance state management library for TypeScript/JavaScript. Simple global state that scales to complex async pipelines — with built-in `debounce`, `switchMap`, and more. Fully compatible with React Compiler.

"SynState" is named after "Synchronized + State." Derived values are always kept in sync through glitch-free propagation — no inconsistent intermediate states. (Details: [How SynState Solved the Glitch](/synstate/internals/how-synstate-solved-the-glitch/))

## Features

- 🎯 **Simple State Management**: Easy-to-use `createState` and `createReducer` similar to React `useState`/`useReducer`, but for global state.
- ⚡ **High Performance**: Glitch-free $O(n)$ propagation — up to 30× faster than Jotai and 16× faster than Redux. See [benchmarks](/synstate/guides/library-comparison/benchmark/).
- 🚀 **Lightweight**: <!-- bundle-size:synstate -->~4.5 kB min+gzip<!-- /bundle-size:synstate --> with only one external runtime dependency ([ts-data-forge](https://www.npmjs.com/package/ts-data-forge)).
- 🔧 **Built-in Async Operators**: `debounce`, `throttle`, `switchMap`, and more — handle complex async flows in a unified, declarative API without external libraries.
- ⚛️ **React-Optimized**: Fully compatible with [React Compiler](https://react.dev/learn/react-compiler). `synstate-react-hooks` lets you add global state to any component in just a few lines.
- 🌐 **Framework Agnostic**: Core library works as-is with vanilla JavaScript, Vue, Svelte, or any framework. For React and Preact, hooks wrappers (`synstate-react-hooks` / `synstate-preact-hooks`) are available. For Preact, a [Preact Signals integration](/synstate/preact-signals/demo/) (`synstate-preact-signals`) is also provided for fine-grained DOM updates without component re-renders.

## Quick Example

With a single call to `createState`, you can add global state to your application:

```tsx
import { createState } from 'synstate';

// Create a reactive state
const [state, setState] = createState(0);

// Subscribe to changes
state.subscribe((count) => {
    console.log(count); // 0, 1
});

// Update state
setState(1);
```

`createState` creates a reactive state (InitializedObservable) and a setter function. Subscribers are called immediately with the initial value, and again whenever the state is updated.

`createState` also returns a third element with additional utilities:

```ts
const [
    state,
    setState,
    { updateState, resetState, getSnapshot, initialState },
] = createState(0);

updateState((prev) => prev + 2); // update using a function of the previous value
getSnapshot(); // read current value synchronously (2)
initialState; // the initial value passed to createState (0)

resetState(); // reset to initial value (0)
getSnapshot(); // read current value synchronously (0)
```

## Deriving Values with `pipe`

SynState's power comes from composing Observables. Use `pipe` to derive new values and `combine` to merge multiple sources:

```tsx
import {
    combine,
    createState,
    type InitializedObservable,
    map,
} from 'synstate';

const [count, setCount] = createState<number>(0);

// Read the current value
console.log(count.getSnapshot().value); // 0

// Derive new Observables using pipe
const doubled: InitializedObservable<number> = count.pipe(map((n) => n * 2));

// Combine multiple Observables
const combined: InitializedObservable<string> = combine([count, doubled]).pipe(
    map(([c, d]) => `(${c}, ${d})`),
);

// Subscribe to changes
count.subscribe((value) => {
    console.log('count:', value); // 0, 1, 2, 3
});

doubled.subscribe((value) => {
    console.log('doubled:', value); // 0, 2, 4, 6
});

combined.subscribe((value) => {
    console.log(value); // "(0, 0)", "(1, 2)", "(2, 4)", "(3, 6)"
});

// Update state
setCount(1);
setCount(2);
setCount(3);
```

For a deeper understanding of how this declarative model works — and why it is better than managing state imperatively — see [Declarative State Management](/synstate/guides/declarative-state-management/).

## Using with React

`createState` must be called at **module scope** (outside of components). SynState provides `synstate-react-hooks`, a companion package that bridges Observables and React:

```tsx
import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

const [useUserState, setUserState] = createState({
    name: '',
    email: '',
});

const UserProfile = (): React.JSX.Element => {
    const user = useUserState();

    return (
        <div>
            <p>{`Name: ${user.name}`}</p>
            <button
                onClick={() => {
                    setUserState({
                        name: 'Alice',
                        email: 'alice@example.com',
                    });
                }}
            >
                {'Set User'}
            </button>
        </div>
    );
};
```

For more details, see [React Integration](/synstate/guides/react-integration/).

## Next Steps

- [Installation](/synstate/getting-started/installation/) — Install SynState and optional companion packages.
- [Why SynState?](/synstate/guides/why-synstate/) — Design philosophy, glitch-free guarantees, and use cases.
- [Declarative State Management](/synstate/guides/declarative-state-management/) — Understand the reactive programming model with concrete examples.
- [React Integration](/synstate/guides/react-integration/) — Use SynState with React.
