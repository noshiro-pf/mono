---
title: Why SynState?
sidebar:
    order: 1
---

## Simple to Start, Powerful When You Need It

SynState is a state management library for web frontends. For most use cases, `createState`, `createReducer`, and simple combinators like `combine` and `map` are all you need — clean, minimal APIs that feel as intuitive as React's `useState` / `useReducer`, but for global state. For example, a [simple counter](/synstate/examples/react/#global-counter-state) can be implemented in just a few lines:

```tsx
import { createState } from 'synstate-react-hooks';

const [useCount, , { updateState }] = createState(0);

const Counter = () => {
    const count = useCount();
    return <button onClick={() => updateState((n) => n + 1)}>{count}</button>;
};
```

When your requirements grow more complex, SynState scales with you. You can describe everything from a simple [Dark Mode toggle](/synstate/examples/react/#boolean-state-dark-mode) to a [debounced search pipeline with auto-cancellation](/synstate/examples/advanced/#search-with-debounce) in a single, unified API.

## Why Observable-Based?

Real-world state management involves more than simple get/set. Filter inputs need debouncing, API calls need cancellation, and derived values must stay consistent when multiple sources change at once. These requirements demand a system that can express **asynchronous data flow** and **automatic dependency propagation** declaratively.

SynState is built on the Observable pattern — a model where state is represented as streams of values that can be composed, transformed, and combined. This gives you access to a rich set of operators (`debounce`, `throttle`, `switchMap`, `mergeMap`, etc.) without requiring a separate library like RxJS.

To see how this works in practice — and how it compares to imperative code — see [Declarative State Management](/synstate/guides/declarative-state-management/).

## High Performance, Glitch-Free

The Observable pattern is not new — RxJS has popularized it for years. However, RxJS has a fundamental correctness issue known as the **glitch problem**: when multiple derived values share a common source, `combineLatest` can emit inconsistent intermediate states where some inputs have updated but others have not. This problem worsens as the dependency graph grows more complex. For example, in "diamond" dependencies — where a single source fans out to multiple derived values that are then recombined — the redundant computations scale as $O(n^2)$ with the number of recombinations, and when such diamonds are chained in series, the cost grows exponentially — $O(D^n)$ where $D$ is the number of branches per stage.

SynState solves this with a **depth-ordered propagation** algorithm that guarantees every derived value is updated only after all of its ancestors have been updated — in a single $O(n)$ pass. No glitches, no redundant computations, no priority queues.

| Feature                     | RxJS                                                                             | SynState                                                                                 |
| :-------------------------- | :------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **Glitch-free**             | No — `combineLatest` emits intermediate states                                   | Yes — depth-ordered propagation guarantees consistency                                   |
| **Propagation cost**        | $O(n)$ for trees, up to $O(D^n)$ for chained diamonds ($D$ = branches per stage) | $O(n)$ in all cases                                                                      |
| **`InitializedObservable`** | Not available — values may be absent until first emission                        | Built-in — always holds a value, ideal for representing state                            |
| **Design focus**            | General-purpose asynchronous event processing                                    | State management first, with full async operator support (`debounce`, `switchMap`, etc.) |

For a detailed explanation, see [How SynState Solved the Glitch](/synstate/internals/how-synstate-solved-the-glitch/).

## Fully Compatible with React Compiler

All of SynState's reactive computation (`combine`, `map`, `filter`, etc.) happens **outside** React's rendering cycle. Components read values through `useSyncExternalStore` (a first-class React API) and have no implicit side effects during rendering — no proxy-based tracking, no hidden subscriptions triggered by property access. This means React Compiler can safely analyze and memoize these components, fully aligned with [React Compiler](https://react.dev/learn/react-compiler)'s automatic memoization.

MobX's `observer()` HOC tracks observable access during rendering, which conflicts with React Compiler's memoization and requires opting out via the `"use no memo"` directive. SynState requires no such workarounds.

## Use Cases

**Use SynState when you need:**

- ✅ A small piece of global state shared across components (e.g., dark mode toggle, user session).
- ✅ Complex asynchronous state management with operators like `debounce`, `throttle`, `switchMap`.
- ✅ Redux-like state with reducers (`createReducer`).
- ✅ A project where the scale of state management is uncertain — SynState's unified API covers everything from a single shared counter to a full debounced search pipeline, so you never have to switch libraries as requirements grow.
- ✅ Type-safe event emitters (`createEventEmitter`).

**Consider other solutions when:**

- You need per-instance state for dynamically created components — for example, form input values, accordion open/close state, or modal visibility, where multiple instances of the same component exist on screen and each requires its own independent state. Managing these with global state would require tracking instance creation and destruction in arrays, adding unnecessary complexity. React hooks (`useState` / `useReducer`) are the natural fit for component-local state like this.

## Next Steps

- [Declarative State Management](/synstate/guides/declarative-state-management/) — understand the reactive programming model with concrete examples.
- [React Integration](/synstate/guides/react-integration/) — use SynState with React.
- [Library Comparison](/synstate/guides/library-comparison/library-comparison/) — how SynState compares to RxJS, Jotai, MobX, and others.
- [Performance Benchmark](/synstate/guides/library-comparison/benchmark/) — quantitative throughput comparisons.
- [Interactive Demos](/synstate/guides/library-comparison/interactive-demo/) — see the differences in action.
