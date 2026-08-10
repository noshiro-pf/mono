---
title: Library Comparison
description: Compare SynState with other state management libraries — Zustand, Jotai, Valtio, Redux Toolkit, and more.
sidebar:
    order: 5
---

This page provides an objective comparison of SynState with popular state management libraries. The goal is to help you understand the trade-offs and choose the right tool for your project.

| Library            | Core Paradigm          | Derived Values         | Async Operators Built-in | Glitch-free             | React Compiler         | Vanilla (No React)  | Maintenance                                                                        |
| ------------------ | ---------------------- | ---------------------- | ------------------------ | ----------------------- | ---------------------- | ------------------- | ---------------------------------------------------------------------------------- |
| **SynState**       | Observable (custom)    | Yes (operators)        | Yes                      | Yes (push-based)        | Fully compatible       | Yes                 | [Active](https://github.com/noshiro-pf/synstate)                                   |
| **RxJS**           | Observable (ReactiveX) | Yes (operators)        | Yes                      | No                      | N/A                    | Yes                 | [Low activity](https://github.com/ReactiveX/rxjs) (last commit: 2025-02)           |
| **MobX**           | Proxy-based reactive   | Yes (`computed`)       | No                       | N/A (pull-based / lazy) | Incompatible (opt-out) | Yes                 | [Active](https://github.com/mobxjs/mobx)                                           |
| **Jotai**          | Atomic state           | Yes (derived atoms)    | Partial                  | N/A (pull-based / lazy) | Compatible             | Yes (vanilla store) | [Active](https://github.com/pmndrs/jotai)                                          |
| **Redux**          | Flux / single store    | Yes (selectors)        | No (middleware)          | N/A (pull-based)        | Compatible             | Yes                 | [Active](https://github.com/reduxjs/redux-toolkit)                                 |
| **Zustand**        | Flux-inspired store    | No (inline selectors)  | No                       | N/A (pull-based)        | Compatible             | Yes                 | [Active](https://github.com/pmndrs/zustand)                                        |
| **Valtio**         | Proxy-based mutable    | No (separate `derive`) | No                       | N/A (pull-based)        | Compatible             | Yes                 | [Active](https://github.com/pmndrs/valtio)                                         |
| **Recoil**         | Atomic state (React)   | Yes (selectors)        | Partial                  | N/A (pull-based / lazy) | Compatible             | No                  | [Abandoned](https://github.com/facebookexperimental/Recoil) (last commit: 2023-09) |
| **XState**         | Finite state machines  | Via context            | No                       | N/A                     | Compatible             | Yes                 | [Active](https://github.com/statelyai/xstate)                                      |
| **TanStack Query** | Server-state cache     | N/A                    | Yes (fetch)              | N/A                     | Compatible             | Yes                 | [Active](https://github.com/TanStack/query)                                        |

:::note[Push-based vs Pull-based Glitch-Free]
SynState is the only library in this list that achieves glitch-free propagation through **push-based topological sorting** — derived values are eagerly updated in dependency order, so subscribers always receive consistent values without needing to pull.

MobX, Jotai, and Recoil avoid glitches through **pull-based (lazy) evaluation** — derived values are not eagerly pushed; instead, they are recomputed on-demand when read by a subscriber or component, which naturally avoids seeing inconsistent intermediate states. See [How SynState Solved the Glitch](/synstate/internals/how-synstate-solved-the-glitch/) for a detailed explanation.
:::

## Benchmarked Libraries

The following libraries are included in SynState's [performance benchmark](/synstate/guides/library-comparison/benchmark/). Each section highlights the library's characteristics and ideal use cases.

### SynState

SynState is built on a custom glitch-free Observable implementation. It provides a unified API that scales from simple shared state (`createState`) to complex asynchronous workflows with operators like `debounce`, `throttle`, and `switchMap`.

**Strengths:**

- Glitch-free derived value propagation — no inconsistent intermediate states.
- Rich operator set built in (no need for a separate stream library).
- Framework-agnostic core with dedicated React/Preact hooks packages.
- Type-safe throughout.

**Best for:** Projects that need both simple shared state and sophisticated async pipelines in a single, consistent API.

### RxJS

RxJS is the reference implementation of the ReactiveX Observable specification. It offers an extensive library of operators for composing asynchronous and event-based programs.

**Strengths:**

- Massive operator library (200+ operators).
- Well-established ecosystem and community.
- Excellent for complex event processing (WebSocket streams, retry logic, etc.).

**Trade-offs:**

- Suffers from the [glitch problem](/synstate/internals/how-synstate-solved-the-glitch/) when combining synchronous derived values.
- Reactive stream programming requires a paradigm shift from imperative thinking — developers must reason about asynchronous data flows over time, understand the distinction between Cold and Hot Observables, and choose carefully among similar operators (e.g. `switchMap` vs `mergeMap` vs `concatMap`).
- Not designed specifically for state management.

**Best for:** Applications heavily centered on asynchronous event processing where the glitch issue is acceptable.

### MobX

MobX uses transparent reactive programming via JavaScript proxies. Mutations to observable objects automatically trigger re-computation of `computed` values and re-rendering of observer components.

**Strengths:**

- Intuitive mutable-style API — mutate state directly and everything updates.
- Fine-grained reactivity with automatic dependency tracking.
- Avoids glitches via pull-based lazy evaluation (`computed` values are recomputed on-demand when read by a `reaction`).

**Trade-offs:**

- Implicit dependency tracking can make data flow harder to trace in large codebases.
- No built-in asynchronous operators (use `flow` or external solutions).
- Higher overhead per update compared to simpler store libraries.
- `observer()` HOC tracks observable access during rendering, making it incompatible with React Compiler (requires `"use no memo"` directive to opt out).

**Best for:** Teams that prefer mutable programming style with automatic reactivity and don't need complex async operators.

### Jotai

Jotai provides primitive atoms as the building block for state. Derived atoms compose naturally, and the `createStore` API enables framework-agnostic usage.

**Strengths:**

- Atomic model avoids unnecessary re-renders.
- Composable derived atoms with automatic dependency tracking.
- Small bundle size.

**Trade-offs:**

- No built-in asynchronous operator chain (async atoms exist but are limited).
- Higher per-update overhead due to store-level bookkeeping.
- `store.sub()` callback does not receive the current value (signature is `() => void`), requiring a separate `store.get(atom)` call to read the new value — less ergonomic for vanilla (non-React) usage. In contrast, SynState's `observable$.subscribe((value) => { ... })` passes the value directly to the callback.

**Best for:** React applications that benefit from fine-grained atomic state with simple derivations.

### Redux (Redux Toolkit)

Redux is a predictable state container based on the Flux architecture. Redux Toolkit simplifies boilerplate with `createSlice` and `configureStore`.

**Strengths:**

- Predictable unidirectional data flow.
- Excellent DevTools for time-travel debugging.
- Massive ecosystem (middleware, sagas, thunks).

**Trade-offs:**

- Verbose boilerplate even with Redux Toolkit.
- Selectors (via Reselect) are pull-based and require manual memoization.
- No built-in reactive propagation — async logic delegated to middleware.

**Best for:** Large teams that value strict unidirectional data flow, time-travel debugging, and a mature middleware ecosystem.

### Zustand

Zustand is a small, fast, flux-inspired store. It provides a minimal API with excellent TypeScript support and React integration.

**Strengths:**

- Extremely lightweight and fast for simple state.
- Minimal API surface — easy to learn.
- No providers needed in React.

**Trade-offs:**

- No built-in derived-value primitive — derivations are inline selectors.
- Cannot combine independent derived values (excluded from Diamond Dependency benchmark).
- No asynchronous operators.

**Best for:** Projects that need simple shared state with minimal overhead and don't require complex derivations.

### Valtio

Valtio uses JavaScript proxies to provide a mutable-style API where you write to a proxy object and subscribers are notified automatically.

**Strengths:**

- Extremely intuitive API — just mutate an object.
- Small bundle size.
- Automatic render optimization in React via `useSnapshot`.

**Trade-offs:**

- No built-in derived-value primitive in the vanilla API (`derive` is a separate utility).
- Cannot combine independent derived values (excluded from Diamond Dependency benchmark).
- Proxy-based change detection has edge cases with certain data structures.

**Best for:** Projects that want the simplest possible mutable API for shared state without complex derivations.

## Non-Benchmarked Libraries

The following libraries serve different primary purposes and are not included in the performance benchmark, but are worth considering depending on your requirements.

### Recoil

Recoil is an experimental atomic state management library by Meta, designed specifically for React.

**Why not benchmarked:** Recoil is no longer actively maintained (last npm release in 2023) and is tightly coupled to React — it has no framework-agnostic vanilla API, making a fair comparison impractical.

**Strengths:**

- Pioneered the atomic state model for React.
- Built-in async selectors.
- Concurrent Mode support.

**Considerations:** If you are starting a new project, Jotai is a maintained alternative that was inspired by Recoil's atomic model.

### XState

XState is a state machine and statechart library. It models application logic as finite state machines with explicit states, transitions, and side effects.

**Why not benchmarked:** XState solves a fundamentally different problem — modeling application logic as state machines — rather than providing a general-purpose reactive state container. A propagation-speed benchmark would not meaningfully represent XState's value.

**Strengths:**

- Formally verifiable logic via state machines and statecharts.
- Visual editor (Stately) for designing state machines.
- Excellent for complex UI flows (wizards, authentication, media players).

**Best for:** Applications with well-defined states and transitions where formal correctness matters more than raw propagation speed.

### TanStack Query

TanStack Query (formerly React Query) is a server-state management library focused on fetching, caching, and synchronizing server data.

**Why not benchmarked:** TanStack Query manages server-state (HTTP cache, refetching, pagination), not client-side reactive state. It is complementary to libraries like SynState rather than a direct alternative.

**Strengths:**

- Automatic caching, deduplication, and background refetching.
- Stale-while-revalidate strategy out of the box.
- Framework-agnostic (React, Vue, Solid, Svelte adapters).

**Best for:** Any application that fetches data from a server. Often used alongside a client-state library.

## Choosing the Right Library

| Your requirement                                     | Recommended                          |
| ---------------------------------------------------- | ------------------------------------ |
| Simple shared state (dark mode, user session)        | **SynState**, Zustand, Valtio, Jotai |
| Complex async pipelines (debounce, switchMap, retry) | **SynState**, RxJS                   |
| Glitch-free derived values                           | **SynState**, MobX, Jotai            |
| Mutable-style API                                    | MobX, Valtio                         |
| Atomic / fine-grained reactivity                     | **SynState**, Jotai                  |
| Strict unidirectional data flow                      | **SynState**, Redux                  |
| Formal state machines                                | XState                               |
| Server-state caching                                 | TanStack Query                       |
| Minimal bundle + simple API                          | **SynState**, Zustand, Valtio        |
| Unified API from simple to complex                   | **SynState**                         |

## Performance Comparison

For detailed benchmark results comparing propagation speed across libraries, see the [Performance Benchmark](/synstate/guides/library-comparison/benchmark/) page.
