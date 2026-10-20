---
title: Library Comparison
description: Compare SynState with other state management libraries — Zustand, Jotai, Valtio, Redux Toolkit, and more.
sidebar:
    order: 5
---

This page provides an objective comparison of SynState with popular state management libraries. The goal is to help you understand the trade-offs and choose the right tool for your project.

| Library            | Core Paradigm          | Derived Values         | Async Operators Built-in | Glitch-free             | React Compiler         | Vanilla (No React)  | Maintenance                                                                        |
| ------------------ | ---------------------- | ---------------------- | ------------------------ | ----------------------- | ---------------------- | ------------------- | ---------------------------------------------------------------------------------- |
| **SynState**       | Observable (custom)    | Yes (operators)        | Yes                      | Yes (push-based)        | Fully compatible       | Yes                 | [Active](https://github.com/noshiro-pf/mono/tree/main/libs/synstate)               |
| **RxJS**           | Observable (ReactiveX) | Yes (operators)        | Yes                      | No                      | N/A                    | Yes                 | [Low activity](https://github.com/ReactiveX/rxjs) (last commit: 2025-02)           |
| **MobX**           | Proxy-based reactive   | Yes (`computed`)       | No                       | Yes (pull-based / lazy) | Incompatible (opt-out) | Yes                 | [Active](https://github.com/mobxjs/mobx)                                           |
| **Jotai**          | Atomic state           | Yes (derived atoms)    | Partial                  | Yes (pull-based / lazy) | Compatible             | Yes (vanilla store) | [Active](https://github.com/pmndrs/jotai)                                          |
| **Redux**          | Flux / single store    | Yes (selectors)        | No (middleware)          | N/A (pull-based)        | Compatible             | Yes                 | [Active](https://github.com/reduxjs/redux-toolkit)                                 |
| **Zustand**        | Flux-inspired store    | No (inline selectors)  | No                       | N/A (pull-based)        | Compatible             | Yes                 | [Active](https://github.com/pmndrs/zustand)                                        |
| **Valtio**         | Proxy-based mutable    | No (separate `derive`) | No                       | N/A (pull-based)        | Compatible             | Yes                 | [Active](https://github.com/pmndrs/valtio)                                         |
| **Recoil**         | Atomic state (React)   | Yes (selectors)        | Partial                  | Yes (pull-based / lazy) | Compatible             | No                  | [Abandoned](https://github.com/facebookexperimental/Recoil) (last commit: 2023-09) |
| **XState**         | Finite state machines  | Via context            | No                       | N/A                     | Compatible             | Yes                 | [Active](https://github.com/statelyai/xstate)                                      |
| **TanStack Query** | Server-state cache     | N/A                    | Yes (fetch)              | N/A                     | Compatible             | Yes                 | [Active](https://github.com/TanStack/query)                                        |

:::note[Push-based vs Pull-based Glitch-Free]
SynState is the only library in this list that achieves glitch-free propagation through **push-based topological sorting** — derived values are eagerly updated in dependency order, so subscribers always receive consistent values without needing to pull.

MobX, Jotai, and Recoil avoid glitches through **pull-based (lazy) evaluation** — derived values are not eagerly pushed; instead, they are recomputed on-demand when read by a subscriber or component, which naturally avoids seeing inconsistent intermediate states. See [How SynState Solved the Glitch](/mono/synstate/internals/how-synstate-solved-the-glitch/) for a detailed explanation.
:::

## Evaluation Models

"Glitch-free" says what a subscriber sees; it does not say when the work happens. The four libraries benchmarked with derived graphs schedule it in four different ways, and that, more than raw speed, is what the [benchmark](/mono/synstate/guides/library-comparison/benchmark/) results reflect.

| Library      | Propagation                           | When a derived value is computed                                                                           | Glitch-free | Where the benchmark finds its worst case                                                    |
| ------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| **SynState** | Push, in depth order from the root    | On every update of its source, whether or not anything reads it                                            | Yes         | Grows with the branches a `combine` holds (conditional fan-out); building path-heavy graphs |
| RxJS         | Push, depth-first per subscription    | On every emission it receives, separately for each subscription (cold)                                     | No          | One emission per path: $O(M^2)$ in the deep chain, $O(2^N)$ in cascaded diamonds            |
| MobX         | Push invalidation, pull recomputation | `computed`: when read, cached only while observed; `reaction`: when its dependencies change                | Yes         | Stateful chains, which need `reaction`s and lose the laziness (deep chain)                  |
| Jotai        | Push invalidation, pull recomputation | When read (`store.get`, a hook) or mounted by a subscription (`store.sub`, a component); not while neither | Yes         | A fixed bookkeeping cost on every `store.set` (every scenario)                              |

SynState's model is the simplest of the four to state: `next` on a source runs one synchronous pass over everything derived from it, in depth order, and returns; afterwards every `getSnapshot()` in the graph is up to date and every subscriber has been called once ([How Observables Work](/mono/synstate/internals/how-observables-work/)). RxJS is push-based too but has no ordering step, which is where its glitches and its path-proportional cost come from. MobX and Jotai avoid glitches the other way, by recomputing on read: MobX's `ComputedValue` recomputes "only when it is being accessed" and resets when no longer observed ([source](https://unpkg.com/mobx@7.0.6/src/core/computedvalue.ts)), and Jotai's store recomputes only atoms that are mounted or read ([source](https://unpkg.com/jotai@3.0.1/dist/vanilla/internals.js)). That lets them skip work nobody reads, which SynState cannot, at the cost of the work happening when, and only if, something asks.

### Running Outside React

Every benchmarked library has a vanilla API, so all of them run outside React. What differs is whether anything happens before a reader appears.

- **SynState** registers a derived Observable with its root when it is created, so a pipeline written at module scope runs as soon as its source changes, subscribed or not. A search box's query, debounced and `switchMap`ped into `fromAbortablePromise(fetch(...))`, can live in a plain module, and a component, a test or a script that reads it gets the same value ([example](/mono/synstate/guides/declarative-state-management/#precise-control-over-async-behavior)). The price is the eager evaluation the conditional fan-out benchmark measures.
- **RxJS** can be written at module scope as well, but its pipelines are cold: nothing runs until a subscription, and each subscription runs the pipeline again, so a `fetch` inside it is sent once per subscriber unless the pipeline is shared (`share`, `shareReplay`).
- **MobX** does not evaluate a `computed` until it is read, and does not cache it while unobserved. Work with side effects, such as fetching, goes into a `reaction` / `autorun` or an action (`flow`) that the application starts itself.
- **Jotai** runs an atom's read function — an async atom's fetch included — when the atom is first read or mounted. In React that is a component rendering it (an async atom suspends that component); outside React nothing runs until code calls `store.get` or `store.sub`. Data loading written as atoms is therefore scheduled by whatever reads them, which in an application is usually React's rendering.

## Benchmarked Libraries

The following libraries are included in SynState's [performance benchmark](/mono/synstate/guides/library-comparison/benchmark/). Each section highlights the library's characteristics and ideal use cases.

### SynState

SynState is built on a custom glitch-free Observable implementation. It provides a unified API that scales from simple shared state (`createState`) to complex asynchronous workflows with operators like `debounce`, `throttle`, and `switchMap`.

**Strengths:**

- Glitch-free derived value propagation — no inconsistent intermediate states.
- Rich operator set built in (no need for a separate stream library).
- Framework-agnostic core with dedicated React/Preact hooks packages.
- Type-safe throughout.
- A simple execution model: each `next` is one synchronous, depth-ordered pass, after which the whole graph is consistent.
- Pipelines run at module scope, independent of any component, and work the same outside React.
- Per-update cost proportional to the graph whatever its shape, including chained diamonds — see the [benchmark summary](/mono/synstate/guides/library-comparison/benchmark/#how-to-read-this-page).

**Trade-offs:**

- Every derived value is recomputed on every update of its source, even when nothing reads it; MobX and Jotai skip that work.
- Creating a node walks every path back to its root, so building a graph of many chained diamonds is expensive (updating it is not).
- Per-update overhead is above the simplest stores (Zustand, Valtio) and RxJS on small graphs.
- A smaller operator set than RxJS.

**Best for:** Projects that need both simple shared state and sophisticated async pipelines in a single, consistent API.

### RxJS

RxJS is the reference implementation of the ReactiveX Observable specification. It offers an extensive library of operators for composing asynchronous and event-based programs.

**Strengths:**

- Massive operator library (200+ operators).
- Well-established ecosystem and community.
- Excellent for complex event processing (WebSocket streams, retry logic, etc.).

**Trade-offs:**

- Suffers from the [glitch problem](/mono/synstate/internals/how-synstate-solved-the-glitch/) when combining synchronous derived values.
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

The [Performance Benchmark](/mono/synstate/guides/library-comparison/benchmark/) measures propagation time on five graph shapes. No library is fastest on all of them: the simplest stores and RxJS lead on small graphs, MobX and Jotai where work can be skipped, and SynState where a deep graph is read in full. What the results support for SynState is a bounded worst case among push-based libraries rather than the best time everywhere; [How to Read This Page](/mono/synstate/guides/library-comparison/benchmark/#how-to-read-this-page) sums it up scenario by scenario.
