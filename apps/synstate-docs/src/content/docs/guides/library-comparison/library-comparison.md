---
title: Library Comparison
description: Compare SynState with other state management libraries — Zustand, Jotai, Valtio, Redux Toolkit, Solid and Preact Signals, and more.
sidebar:
    order: 5
---

This page provides an objective comparison of SynState with popular state management libraries. The goal is to help you understand the trade-offs and choose the right tool for your project.

| Library                                     | Core Paradigm          | Derived Values         | Async Operators Built-in   | Glitch-free             | React Compiler         | Vanilla (No React)                                      | Maintenance                                                                        |
| ------------------------------------------- | ---------------------- | ---------------------- | -------------------------- | ----------------------- | ---------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **SynState**                                | Observable (custom)    | Yes (operators)        | Yes                        | Yes (push-based)        | Fully compatible       | Yes                                                     | [Active](https://github.com/noshiro-pf/mono/tree/main/libs/synstate)               |
| **RxJS**                                    | Observable (ReactiveX) | Yes (operators)        | Yes                        | No                      | N/A                    | Yes                                                     | [Low activity](https://github.com/ReactiveX/rxjs) (last commit: 2025-02)           |
| **MobX**                                    | Proxy-based reactive   | Yes (`computed`)       | No                         | Yes (pull-based / lazy) | Incompatible (opt-out) | Yes                                                     | [Active](https://github.com/mobxjs/mobx)                                           |
| **Jotai**                                   | Atomic state           | Yes (derived atoms)    | Partial                    | Yes (pull-based / lazy) | Compatible             | Yes (vanilla store)                                     | [Active](https://github.com/pmndrs/jotai)                                          |
| **Redux**                                   | Flux / single store    | Yes (selectors)        | No (middleware)            | N/A (pull-based)        | Compatible             | Yes                                                     | [Active](https://github.com/reduxjs/redux-toolkit)                                 |
| **Solid** (`solid-js`)                      | Signals (fine-grained) | Yes (`createMemo`)     | Partial (`createResource`) | Yes (push-based)        | N/A (no React binding) | Yes (`createRoot`; see [below](#running-outside-react)) | [Active](https://github.com/solidjs/solid)                                         |
| **Preact Signals** (`@preact/signals-core`) | Signals                | Yes (`computed`)       | No                         | Yes (pull-based / lazy) | Not verified           | Yes (the `-core` package)                               | [Active](https://github.com/preactjs/signals)                                      |
| **Zustand**                                 | Flux-inspired store    | No (inline selectors)  | No                         | N/A (pull-based)        | Compatible             | Yes                                                     | [Active](https://github.com/pmndrs/zustand)                                        |
| **Valtio**                                  | Proxy-based mutable    | No (separate `derive`) | No                         | N/A (pull-based)        | Compatible             | Yes                                                     | [Active](https://github.com/pmndrs/valtio)                                         |
| **Recoil**                                  | Atomic state (React)   | Yes (selectors)        | Partial                    | Yes (pull-based / lazy) | Compatible             | No                                                      | [Abandoned](https://github.com/facebookexperimental/Recoil) (last commit: 2023-09) |
| **XState**                                  | Finite state machines  | Via context            | No                         | N/A                     | Compatible             | Yes                                                     | [Active](https://github.com/statelyai/xstate)                                      |
| **TanStack Query**                          | Server-state cache     | N/A                    | Yes (fetch)                | N/A                     | Compatible             | Yes                                                     | [Active](https://github.com/TanStack/query)                                        |

:::note[Push-based vs Pull-based Glitch-Free]
SynState and Solid achieve glitch-free propagation **push-based** — derived values are eagerly updated in dependency order, so subscribers always receive consistent values without needing to pull. SynState visits the nodes an update reaches in depth order; Solid marks every node below the write before it reruns any, and a memo whose upstream is still stale runs that first.

MobX, Jotai, Preact Signals and Recoil avoid glitches through **pull-based (lazy) evaluation** — derived values are not eagerly pushed; instead, they are recomputed on-demand when read by a subscriber or component, which naturally avoids seeing inconsistent intermediate states. See [How SynState Solved the Glitch](/mono/synstate/internals/how-synstate-solved-the-glitch/) for a detailed explanation.
:::

## Evaluation Models

"Glitch-free" says what a subscriber sees; it does not say when the work happens. The six libraries benchmarked with derived graphs schedule it in different ways, and that, more than raw speed, is what the [benchmark](/mono/synstate/guides/library-comparison/benchmark/) results reflect.

| Library        | Propagation                                               | When a derived value is computed                                                                                | Glitch-free | Where the benchmark finds its worst case                                                                           |
| -------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| **SynState**   | Push, in depth order from the root                        | On every update of its source, whether or not anything reads it                                                 | Yes         | Grows with the branches a `combine` holds (conditional fan-out)                                                    |
| RxJS           | Push, depth-first per subscription                        | On every emission it receives, separately for each subscription (cold)                                          | No          | One emission per path: $O(M^2)$ in the deep chain, $O(2^N)$ in cascaded diamonds                                   |
| MobX           | Push invalidation, pull recomputation                     | `computed`: when read, cached only while observed; `reaction`: when its dependencies change                     | Yes         | Stateful chains, which need `reaction`s and lose the laziness (deep chain)                                         |
| Jotai          | Push invalidation, pull recomputation                     | When read (`store.get`, a hook) or mounted by a subscription (`store.sub`, a component); not while neither      | Yes         | A fixed bookkeeping cost on every `store.set` (every scenario)                                                     |
| Solid          | Push, every node below the write marked before any reruns | Memo: on every change of a source its last run read, whether or not anything reads it; effect: after the memos  | Yes         | A fixed cost per write and per rerun: two queues, dependencies removed and registered again (small derived graphs) |
| Preact Signals | Push invalidation, pull recomputation                     | `computed`: when read after one of its sources got a newer version; `effect`: at the end of the outermost batch | Yes         | Small graphs, where RxJS's plain `subscribe` chain does less per update (derived chain)                            |

SynState's model is the simplest of these to state: `next` on a source runs one synchronous pass over everything derived from it, in depth order, and returns; afterwards every `getSnapshot()` in the graph is up to date and every subscriber has been called once ([How Observables Work](/mono/synstate/internals/how-observables-work/)). RxJS is push-based too but has no ordering step, which is where its glitches and its path-proportional cost come from. MobX and Jotai avoid glitches the other way, by recomputing on read: MobX's `ComputedValue` recomputes "only when it is being accessed" and resets when no longer observed ([source](https://unpkg.com/mobx@7.0.6/src/core/computedvalue.ts)), and Jotai's store recomputes only atoms that are mounted or read ([source](https://unpkg.com/jotai@3.0.1/dist/vanilla/internals.js)). That lets them skip work nobody reads, which SynState cannot, at the cost of the work happening when, and only if, something asks. Preact Signals recomputes on read as well, and a version number on every signal and `computed` decides whether a read has anything to recompute. Solid is push-based and eager like SynState, and its memos, like MobX's and Jotai's derivations, subscribe only to what their last run read.

### Running Outside React

Every benchmarked library has a vanilla API, so all of them run outside React, and Solid and Preact Signals run outside their own frameworks too. What differs is whether anything happens before a reader appears, and for the two signal libraries, what using them on their own takes.

- **SynState** registers a derived Observable with its root when it is created, so a pipeline written at module scope runs as soon as its source changes, subscribed or not. A search box's query, debounced and `switchMap`ped into `fromAbortablePromise(fetch(...))`, can live in a plain module, and a component, a test or a script that reads it gets the same value ([example](/mono/synstate/guides/declarative-state-management/#precise-control-over-async-behavior)). The same holds for a router kept as global state: its route, debounced and `switchMap`ped into a fetch, loads the page's data whether or not the view for it has mounted yet. The price is the eager evaluation the conditional fan-out benchmark measures, which a `switchMap` over the selected branch avoids.
- **RxJS** can be written at module scope as well, but its pipelines are cold: nothing runs until a subscription, and each subscription runs the pipeline again, so a `fetch` inside it is sent once per subscriber unless the pipeline is shared (`share`, `shareReplay`).
- **MobX** does not evaluate a `computed` until it is read, and does not cache it while unobserved. Work with side effects, such as fetching, goes into a `reaction` / `autorun` or an action (`flow`) that the application starts itself. A `reaction` runs eagerly, and its `delay` option throttles it; cancelling a fetch that a newer route has made stale is left to the effect.
- **Jotai** runs an atom's read function — an async atom's fetch included — when the atom is first read or mounted. In React that is a component rendering it (an async atom suspends that component); outside React nothing runs until code calls `store.get` or `store.sub`. Data loading written as atoms is therefore scheduled by whatever reads them, which in an application is usually React's rendering. Measured with jotai 3.0.1's vanilla store: an async atom derived from a route atom fetches nothing until `store.sub`; while subscribed it fetches on every route change and aborts the previous one through its `signal`, the equivalent of `switchMap`; once the last subscriber leaves, route changes fetch nothing. A debounce cannot be written inside the derivation and has to be built on the writing side.
- **Solid**'s reactive primitives (`createSignal`, `createMemo`, `createEffect`, `createRoot`) are in `solid-js` itself and need neither the DOM renderer (`solid-js/web`) nor JSX, so a module can hold a graph of signals and memos with no UI at all, and its memos run eagerly as SynState's derived values do. Three things set it apart when it is used that way. Computations belong to an owner: they are created inside `createRoot` (or a component), which is what disposes them, and outside one they are never cleaned up. Under Node, `import 'solid-js'` resolves to the server build, in which a memo is computed once and an effect never runs — right for server rendering, and silently inert in a script, a test runner or a server that wants reactivity; it takes the `browser` export condition or the client build's path (`solid-js/dist/solid.js`, as the benchmark does). And there is no official binding for React or another framework; the bridge is `observable()` / `from()`, or an effect of your own. Solid 2.0 publishes the reactive core on its own as `@solidjs/signals` (a release candidate when this was written, and not measured here). There, writes are batched until a microtask or an explicit `flush()`, so a memo read right after a write still returns the previous value.
- **Preact Signals**' core, `@preact/signals-core`, does not depend on Preact: `signal`, `computed`, `effect` and `batch` work the same in a browser, in Node and in a worker, and `@preact/signals` (Preact) and `@preact/signals-react` (React) are bindings on top of it. Of the libraries here it is the closest to a framework-independent signals library: there is no root or owner to create, `effect` returns its own disposer, and `signal.subscribe(fn)` passes the value to its callback. A `computed` is lazy, as MobX's is: it runs when read, and an unread one does nothing. Effects are eager and run at the end of the outermost batch; a write outside a batch is a batch of its own, so the effects it triggers have run by the time the write returns. As with MobX, there are no async operators: a fetch goes into an effect, and cancelling a stale one is that effect's cleanup.

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

- Every derived value is recomputed on every update of its source, even when nothing reads it; MobX and Jotai skip that work. What they skip is a node the graph need not hold, which `switchMap`, disposing a scope or `audit` leaves out — see the [benchmark summary](/mono/synstate/guides/library-comparison/benchmark/#how-to-read-this-page).
- Per-update overhead is above RxJS on small graphs.
- A smaller operator set than RxJS, though it covers what its model needs: every Observable is already shared, so the `share` / `shareReplay` family has nothing to do, and errors travel as `Result` values (`mapResultOk`, `unwrapResultOk`, …) rather than through `catchError`. Operators and creators of your own are written with [the factories the built-in ones are made by](/mono/synstate/guides/custom-operators-and-creators/).

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

### Solid

Solid is a UI framework built on fine-grained signals: `createSignal`, `createMemo` and `createEffect`, with compiled JSX that updates the DOM directly. The reactive primitives are part of `solid-js` and run without the renderer, and the benchmark measures them that way ([Running Outside React](#running-outside-react) says what it takes).

**Strengths:**

- Glitch-free push propagation: a write marks everything below it before rerunning any memo, so each memo runs once per update.
- Dynamic dependency tracking: a memo is subscribed only to what its last run read, so a write nothing observes costs almost nothing.
- `createMemo(fn, initialValue)` is given its previous value, so a stateful derivation (`scan`) is a memo like any other.
- A mature framework with a wide ecosystem.

**Trade-offs:**

- Using it independently of the framework is possible but not what the package is shaped for: computations need an owner (`createRoot`), Node resolves `solid-js` to the non-reactive server build, and there are no bindings for other frameworks.
- Higher per-update overhead than SynState: each write allocates its update queues, and each rerun removes the computation from every source and registers it again.
- No async operator chain; `createResource` covers fetching, together with Suspense.

**Best for:** Solid applications. Outside Solid, code that is prepared to manage roots and the build Node resolves.

### Preact Signals

Preact Signals is the Preact team's signals library — `signal`, `computed` and `effect` — published as a framework-independent core (`@preact/signals-core`) with bindings for Preact and React. The benchmark measures the core.

**Strengths:**

- Framework-independent as published: the core package has no dependency on Preact and needs no root or setup.
- Low per-update overhead: version numbers decide what reruns, and a run that reads what the last one read reuses its dependency links and allocates nothing.
- Glitch-free by lazy `computed`; a derived value nobody reads is not computed.
- A small API; `subscribe(fn)` passes the value to its callback.

**Trade-offs:**

- No async operators.
- A `computed` is not given its previous value, so a stateful chain (`scan`) is written as signals that an effect updates.
- Its React binding works through a Babel transform or the `useSignals` hook; compatibility with React Compiler is not verified here.

**Best for:** Projects that want small, fast, framework-independent signals and do not need async operators.

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

| Your requirement                                     | Recommended                                      |
| ---------------------------------------------------- | ------------------------------------------------ |
| Simple shared state (dark mode, user session)        | **SynState**, Zustand, Valtio, Jotai             |
| Complex async pipelines (debounce, switchMap, retry) | **SynState**, RxJS                               |
| Glitch-free derived values                           | **SynState**, MobX, Jotai, Solid, Preact Signals |
| Mutable-style API                                    | MobX, Valtio                                     |
| Atomic / fine-grained reactivity                     | **SynState**, Jotai, Solid, Preact Signals       |
| Strict unidirectional data flow                      | **SynState**, Redux                              |
| Formal state machines                                | XState                                           |
| Server-state caching                                 | TanStack Query                                   |
| Minimal bundle + simple API                          | **SynState**, Zustand, Valtio                    |
| Unified API from simple to complex                   | **SynState**                                     |

## Performance Comparison

The [Performance Benchmark](/mono/synstate/guides/library-comparison/benchmark/) measures propagation time on six graph shapes. No library is fastest on all of them: RxJS leads on small graphs, with SynState, Preact Signals and Zustand close behind in the single state; MobX, Solid and Preact Signals lead where work can be skipped; and SynState and Preact Signals where a deep graph is read in full, with Redux beside them in the deep chain. What the results support for SynState is a bounded worst case rather than the best time everywhere, and the page sets every library's worst case side by side; [How to Read This Page](/mono/synstate/guides/library-comparison/benchmark/#how-to-read-this-page) sums it up scenario by scenario.

Against Preact Signals, which is glitch-free and proportional to the graph as well, the results name no consistent winner: each is faster in some scenarios. The reason to choose SynState over it is not in the benchmark but in the API — `debounce`, `throttle`, `switchMap` and the other operators on the same glitch-free graph, where Preact Signals leaves timing and cancellation to code written inside an effect (see [Running Outside React](#running-outside-react)).
