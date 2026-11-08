---
title: Library comparison
description: synstate-next beside RxJS, MobX, Jotai, Redux Toolkit, Solid, Preact Signals, Zustand, Valtio and others — what each computes when, and what each leaves to you.
---

synstate-next is a state library with operators: derived values, timing and requests are nodes of one glitch-free graph. This page sets it beside the libraries a project would weigh it against, by what each one computes and when, rather than by taste.

| Library                                     | Core paradigm          | Derived values         | Async operators built in   | Glitch-free derived values | Runs without a UI framework                    | Maintenance                                                                         |
| ------------------------------------------- | ---------------------- | ---------------------- | -------------------------- | -------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| **synstate-next**                           | Observable graph       | Yes (operators)        | Yes                        | Yes (push, depth order)    | Yes                                            | [Active](https://github.com/noshiro-pf/mono/tree/main/libs/synstate-next)           |
| **RxJS**                                    | Observable (ReactiveX) | Yes (operators)        | Yes                        | No                         | Yes                                            | [Active](https://github.com/ReactiveX/rxjs) (9.0 in beta as of 2026-10)             |
| **MobX**                                    | Proxy-based reactive   | Yes (`computed`)       | No                         | Yes (pull, lazy)           | Yes                                            | [Active](https://github.com/mobxjs/mobx)                                            |
| **Jotai**                                   | Atomic state           | Yes (derived atoms)    | Partial                    | Yes (pull, lazy)           | Yes (vanilla store)                            | [Active](https://github.com/pmndrs/jotai)                                           |
| **Redux**                                   | Flux, single store     | Yes (selectors)        | No (middleware)            | Not applicable (pull)      | Yes                                            | [Active](https://github.com/reduxjs/redux-toolkit)                                  |
| **Solid** (`solid-js`)                      | Signals (fine-grained) | Yes (`createMemo`)     | Partial (`createResource`) | Yes (push)                 | Yes (`createRoot`; see [below](#outside-a-ui)) | [Active](https://github.com/solidjs/solid)                                          |
| **Preact Signals** (`@preact/signals-core`) | Signals                | Yes (`computed`)       | No                         | Yes (pull, lazy)           | Yes (the `-core` package)                      | [Active](https://github.com/preactjs/signals)                                       |
| **Zustand**                                 | Flux-inspired store    | No (inline selectors)  | No                         | Not applicable (pull)      | Yes                                            | [Active](https://github.com/pmndrs/zustand)                                         |
| **Valtio**                                  | Proxy-based mutable    | No (separate `derive`) | No                         | Not applicable (pull)      | Yes                                            | [Active](https://github.com/pmndrs/valtio)                                          |
| **Recoil**                                  | Atomic state (React)   | Yes (selectors)        | Partial                    | Yes (pull, lazy)           | No                                             | [Abandoned](https://github.com/facebookexperimental/Recoil) (last release: 2023-03) |
| **XState**                                  | Finite state machines  | Through context        | No                         | Not applicable             | Yes                                            | [Active](https://github.com/statelyai/xstate)                                       |
| **TanStack Query**                          | Server-state cache     | Not applicable         | Yes (fetch)                | Not applicable             | Yes                                            | [Active](https://github.com/TanStack/query)                                         |

:::note[Push and pull]
synstate-next and Solid are glitch-free by **push**: an update computes the derived values it reaches, each once and after everything it reads, so a subscriber is handed values that agree. synstate-next visits the nodes an update reaches in depth order ([How an update propagates](/mono/synstate-next/internals/how-an-update-propagates/)); Solid marks every node below the write before it reruns any, and a memo whose upstream is still stale runs that first.

MobX, Jotai, Preact Signals and Recoil are glitch-free by **pull**: a derived value is recomputed when something reads it, which never sees an intermediate state. Either way, the guarantee covers derived values. A step written as an effect that writes a value is outside it ([Evaluation models](#evaluation-models)).
:::

## Evaluation models

"Glitch-free" says what a reader sees, not when the work happens. The libraries with derived graphs schedule it differently:

| Library        | Propagation                                               | When a derived value is computed                                                                                | Derived values glitch-free | A request step glitch-free                           | Every write reaches the next step                                                                                         |
| -------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| synstate-next  | Push, in depth order; effects after the derived values    | On every update of its source, whether or not anything reads it                                                 | Yes                        | Yes: `switchMap` is a node of the graph              | From `source` and the emitters; `createState` drops an equal value and passes on the value it holds when its round starts |
| RxJS           | Push, depth-first per subscription                        | On every emission it receives, separately for each subscription (cold)                                          | No                         | No                                                   | Yes                                                                                                                       |
| MobX           | Push invalidation, pull recomputation                     | `computed`: when read, cached only while observed; `reaction`: when its dependencies change                     | Yes                        | Depends on the order the `reaction`s were created in | No: an equal value is dropped, an action delivers its last                                                                |
| Jotai          | Push invalidation, pull recomputation                     | When read (`store.get`, a hook) or mounted by a subscription (`store.sub`, a component); not while neither      | Yes                        | Yes: an async atom is a node of the graph            | No: an equal value is dropped                                                                                             |
| Solid          | Push, every node below the write marked before any reruns | Memo: on every change of a source its last run read, whether or not anything reads it; effect: after the memos  | Yes                        | Yes: `createResource` is a node of the graph         | No: an equal value is dropped, a `batch` delivers its last                                                                |
| Preact Signals | Push invalidation, pull recomputation                     | `computed`: when read after one of its sources got a newer version; `effect`: at the end of the outermost batch | Yes                        | Depends on the order the effects were created in     | No: an equal value is dropped, a `batch` delivers its last                                                                |

The last three columns ask different things. The first two are about glitches: the first about derived values read from the graph, the second about a step that starts a request, as in a search box with a query, the request it starts, and a view that reads both. Where the library's own async primitive is a node of the graph, the view runs once per query with a consistent pair; where the step is an effect or a `reaction` that writes a value, a view created before it runs first, sees the new query beside the old result, and runs again. The third is not about a glitch but about whether an operator that counts or pairs events gets every write. [Operators on signals](/mono/synstate-next/comparison/operators-on-signals/) runs the second and the third with Preact Signals.

synstate-next's model is short to state. A write starts an update. The update first computes every derived value it reaches, shallowest first, each once, and only then runs the effects (subscribers, and the bindings of synstate-dom-next) against a graph that has settled. A write made while the derived values are computed waits for the round's effects; a write made by an effect starts the next round. When a write made outside an update and outside a `batch` returns, every `.value` in the graph is current and every subscriber has run ([How an update propagates](/mono/synstate-next/internals/how-an-update-propagates/)).

RxJS is push-based too but has no ordering step, which is where its glitches and its path-proportional cost come from. MobX and Jotai avoid glitches the other way, by recomputing on read: MobX's `ComputedValue` recomputes "only when it is being accessed" and resets when no longer observed ([source](https://unpkg.com/mobx@7.0.6/src/core/computedvalue.ts)), and Jotai's store recomputes only atoms that are mounted or read ([source](https://unpkg.com/jotai@3.0.1/dist/vanilla/internals.js)). That lets them skip work nobody reads, at the cost of the work happening when, and only if, something asks; synstate-next skips work only where the graph leaves the node out (a `switchMap` to the selected branch, a disposed owner). Preact Signals recomputes on read as well, and a version number on every signal and `computed` decides whether a read has anything to recompute. Solid is push-based and eager like synstate-next, and its memos, like MobX's and Jotai's derivations, subscribe only to what their last run read.

### Outside a UI

Every library here has a vanilla API, so all of them run without a UI framework, and Solid and Preact Signals run outside their own frameworks too. What differs is whether anything happens before a reader appears, and what owns the work.

- **synstate-next** registers a derived observable with its parents when it is created and computes it on every update of its source, so a pipeline written at module scope runs as soon as its source changes, subscribed or not. A search box's query, debounced and `switchMap`ped into `fromAbortablePromise`, can live in a plain module, and a component, a test or a script that reads it gets the same value ([example](/mono/synstate-next/guides/declarative-state/)). What a pipeline creates belongs to the current owner, and disposing the owner disposes it all: requests are aborted, timers cleared and subscriptions removed ([Owners and lifetime](/mono/synstate-next/guides/owners-and-lifetime/)). At module scope, outside every owner, it lives as long as the page, which is what a module-level pipeline wants.
- **RxJS** can be written at module scope as well, but its pipelines are cold: nothing runs until a subscription, and each subscription runs the pipeline again, so a `fetch` inside it is sent once per subscriber unless the pipeline is shared (`share`, `shareReplay`).
- **MobX** does not evaluate a `computed` until it is read, and does not cache it while unobserved. Work with side effects, such as fetching, goes into a `reaction` / `autorun` or an action (`flow`) that the application starts itself. A `reaction` runs eagerly, and its `delay` option throttles it; cancelling a fetch that a newer value has made stale is left to the effect.
- **Jotai** runs an atom's read function, an async atom's fetch included, when the atom is first read or mounted. In React that is a component rendering it (an async atom suspends that component); outside React nothing runs until code calls `store.get` or `store.sub`. Data loading written as atoms is therefore scheduled by whatever reads them, which in an application is usually React's rendering. Measured with jotai 3.0.1's vanilla store: an async atom derived from a route atom fetches nothing until `store.sub`; while subscribed it fetches on every route change and aborts the previous one through its `signal`, the equivalent of `switchMap`; once the last subscriber leaves, route changes fetch nothing. A debounce cannot be written inside the derivation and has to be built on the writing side.
- **Solid**'s reactive primitives (`createSignal`, `createMemo`, `createEffect`, `createRoot`) are in `solid-js` itself and need neither the DOM renderer nor JSX. Computations belong to an owner, as synstate-next's do, and outside one they are never cleaned up. Under Node, `import 'solid-js'` resolves to the server build, in which a memo is computed once and an effect never runs; it takes the `browser` export condition or the client build's path (`solid-js/dist/solid.js`). There is no official binding for another framework; the bridge is `observable()` / `from()`, or an effect of your own. Solid 2.0 publishes the reactive core on its own as `@solidjs/signals` (a release candidate when this was written), where writes are batched until a microtask or an explicit `flush()`, so a memo read right after a write still returns the previous value.
- **Preact Signals**' core, `@preact/signals-core`, does not depend on Preact: `signal`, `computed`, `effect` and `batch` work the same in a browser, in Node and in a worker. There is no root or owner to create, `effect` returns its own disposer, and `signal.subscribe(fn)` passes the value to its callback. A `computed` is lazy: it runs when read, and an unread one does nothing. Effects are eager and run at the end of the outermost batch. There are no async operators: a fetch goes into an effect, and cancelling a stale one is that effect's cleanup.

## Libraries in detail

### synstate-next

A state library built around one scheduler: every update visits the nodes it reaches in depth order, computes the derived values before any effect runs, and leaves a graph that is consistent for every reader. It scales from a shared state (`createState`) to async workflows (`debounce`, `throttle`, `switchMap`, `fromAbortablePromise`) with one API.

**Strengths:**

- Glitch-free for every reader: derived values are computed in depth order, each once, and effects run after them, against a graph that has settled.
- Async and stateful steps (`switchMap`, `debounce`, `scan`) are nodes of the same graph, so a request step is as glitch-free as a `map`, and an emitter's every emission is an event.
- An update's cost follows the part of the graph it changes: a node that computes the value it holds passes nothing on, and what is below it is not visited ([Deriving values](/mono/synstate-next/guides/deriving-values/)).
- One lifetime for everything: disposing an owner aborts its requests, clears its timers and removes its subscriptions. There is no completion to propagate ([Why there is no completion](/mono/synstate-next/internals/why-no-completion/)).
- Types follow the graph: `pipe` computes whether its result always holds a value (`InitializedObservable`) from each operator's kind.
- Pipelines run at module scope, independent of any component, and the same in a test or a script.

**Trade-offs:**

- Every derived value is recomputed on every update of its source, even when nothing reads it; MobX, Jotai and Preact Signals skip that work. What they skip is a node the graph need not hold, which `switchMap` to the selected branch or disposing an owner leaves out.
- A smaller operator set than RxJS, though it covers what its model needs: every observable is already shared, so the `share` / `shareReplay` family has nothing to do, and errors travel as `Result` values rather than through `catchError`. Operators and sources of your own are written with `createDerived` and `createSource` ([Custom operators and sources](/mono/synstate-next/guides/custom-operators-and-sources/)).
- No React or Preact bindings yet; the UI layer is [synstate-dom-next](/mono/synstate-dom-next/), which binds observables to the DOM directly.

**Best for:** Projects that need both shared state and async pipelines in one consistent model, with a lifetime that cleans up after itself.

### RxJS

RxJS is the reference implementation of the ReactiveX Observable specification, with an extensive library of operators for asynchronous and event-based programs.

**Strengths:**

- A very large operator library (200+ operators).
- A well-established ecosystem and community.
- Strong for event processing (WebSocket streams, retry logic).

**Trade-offs:**

- Combining synchronous derived values glitches: a node reached by two paths emits once per path ([How an update propagates](/mono/synstate-next/internals/how-an-update-propagates/)).
- Streams require a shift from imperative thinking: cold and hot observables, and a careful choice among similar operators (`switchMap`, `mergeMap`, `concatMap`, `exhaustMap`).
- Not designed for state: there is no current value outside `BehaviorSubject`, and a pipeline runs once per subscriber unless shared.

**Best for:** Applications centered on asynchronous event processing where glitches between derived values do not matter.

### MobX

MobX uses transparent reactive programming through JavaScript proxies. Mutating an observable object recomputes the `computed` values and re-renders the `observer` components that read it.

**Strengths:**

- A mutable-style API: mutate state directly and everything updates.
- Fine-grained reactivity with automatic dependency tracking.
- Glitch-free by lazy `computed` values.

**Trade-offs:**

- Implicit dependency tracking can make the data flow hard to trace in a large codebase.
- No async operators (`flow`, or code of your own).
- Each run of a `computed` or a `reaction` tracks what it reads again.
- `observer()` tracks observable access during rendering, which makes it incompatible with React Compiler (it needs `"use no memo"` to opt out).

**Best for:** Teams that prefer a mutable style with automatic reactivity and do not need async operators.

### Jotai

Jotai builds state from primitive atoms. Derived atoms compose naturally, and `createStore` allows use outside React.

**Strengths:**

- The atomic model avoids unnecessary re-renders.
- Composable derived atoms with automatic dependency tracking.
- A small bundle.

**Trade-offs:**

- No async operator chain (async atoms exist, with the limits [above](#outside-a-ui)).
- Every `store.set` goes through store-level bookkeeping.
- `store.sub()`'s callback does not receive the value (`() => void`), so reading it takes a separate `store.get(atom)`; synstate-next's `subscribe((value) => …)` passes it.

**Best for:** React applications that benefit from fine-grained atomic state with simple derivations.

### Redux (Redux Toolkit)

Redux is a predictable state container on the Flux architecture. Redux Toolkit reduces boilerplate with `createSlice` and `configureStore`.

**Strengths:**

- Predictable unidirectional data flow.
- DevTools with time-travel debugging.
- A large ecosystem (middleware, sagas, thunks).

**Trade-offs:**

- Verbose even with Redux Toolkit.
- Selectors (Reselect) are pull-based and memoized by hand.
- No reactive propagation; async logic goes to middleware.

**Best for:** Large teams that value strict unidirectional data flow, time-travel debugging and a mature middleware ecosystem.

### Solid

Solid is a UI framework built on fine-grained signals (`createSignal`, `createMemo`, `createEffect`) with compiled JSX that updates the DOM directly. Its reactive primitives run without the renderer ([Outside a UI](#outside-a-ui) says what it takes).

**Strengths:**

- Glitch-free push propagation: a write marks everything below it before rerunning any memo, so each memo runs once per update.
- Dynamic dependency tracking: a memo is subscribed only to what its last run read, so a write nothing observes costs almost nothing.
- `createMemo(fn, initialValue)` is given its previous value, so a stateful derivation (`scan`) is a memo like any other.
- A mature framework with a wide ecosystem.

**Trade-offs:**

- Using it apart from the framework is possible but not what the package is shaped for: computations need an owner, Node resolves `solid-js` to the non-reactive server build, and there are no bindings for other frameworks.
- Each write allocates its update queues, and each rerun removes the computation from every source and registers it again.
- No async operator chain; `createResource` covers fetching, together with Suspense.

**Best for:** Solid applications. Outside Solid, code that is prepared to manage roots and the build Node resolves.

### Preact Signals

Preact Signals is the Preact team's signals library (`signal`, `computed`, `effect`), published as a framework-independent core (`@preact/signals-core`) with bindings for Preact and React.

**Strengths:**

- Framework-independent as published: the core has no dependency on Preact and needs no root or setup.
- Low overhead per update: version numbers decide what reruns, and a run that reads what the last one read reuses its dependency links and allocates nothing.
- Glitch-free by lazy `computed`; a derived value nobody reads is not computed.
- A small API; `subscribe(fn)` passes the value to its callback.

**Trade-offs:**

- No async operators.
- A `computed` is not given its previous value, so a stateful chain (`scan`) is written as signals that an effect updates, which is outside the glitch-free guarantee ([Operators on signals](/mono/synstate-next/comparison/operators-on-signals/)).
- Its React binding works through a Babel transform or the `useSignals` hook; compatibility with React Compiler is not verified here.

**Best for:** Projects that want small, fast, framework-independent signals and do not need async operators.

### Zustand

Zustand is a small, flux-inspired store with a minimal API, good TypeScript support and React integration.

**Strengths:**

- Lightweight and fast for simple state.
- A minimal API that is easy to learn.
- No providers in React.

**Trade-offs:**

- No derived-value primitive: derivations are inline selectors.
- Independent derived values cannot be combined.
- No async operators.

**Best for:** Simple shared state with minimal overhead and no complex derivations.

### Valtio

Valtio uses JavaScript proxies for a mutable-style API: write to a proxy object and subscribers are notified.

**Strengths:**

- An intuitive API: mutate an object.
- A small bundle.
- Render optimization in React through `useSnapshot`.

**Trade-offs:**

- No derived-value primitive in the vanilla API (`derive` is a separate utility).
- Independent derived values cannot be combined.
- Proxy-based change detection has edge cases with some data structures.

**Best for:** The simplest mutable API for shared state, without complex derivations.

## Other libraries

These serve different purposes, but are worth weighing depending on the requirements.

### Recoil

Recoil is an experimental atomic state library by Meta, designed for React. It is no longer maintained (last npm release in 2023) and has no API outside React. It pioneered the atomic model for React, with async selectors and Concurrent Mode support. For a new project, Jotai is a maintained alternative inspired by it.

### XState

XState is a state machine and statechart library: it models application logic as finite state machines with explicit states, transitions and side effects, with a visual editor (Stately). It solves a different problem from a reactive state container, and suits flows with well-defined states (wizards, authentication, media players) where formal correctness matters more than propagation.

### TanStack Query

TanStack Query manages server state: fetching, caching, deduplication, background refetching and stale-while-revalidate, with adapters for React, Vue, Solid and Svelte. It is complementary to a client-state library such as synstate-next rather than an alternative: a request step written with `switchMap` and `fromAbortablePromise` is a value in the graph, not a cache.

## Choosing a library

| Requirement                                         | Candidates                                        |
| --------------------------------------------------- | ------------------------------------------------- |
| Simple shared state (dark mode, user session)       | Zustand, Valtio, Jotai                            |
| Async pipelines (debounce, switchMap, retry)        | **synstate-next**, RxJS                           |
| Async operators on glitch-free derived values       | **synstate-next**                                 |
| Glitch-free derived values                          | synstate-next, MobX, Jotai, Solid, Preact Signals |
| One lifetime that aborts requests and clears timers | **synstate-next**, Solid                          |
| A mutable-style API                                 | MobX, Valtio                                      |
| Atomic, fine-grained reactivity                     | Jotai, Solid, Preact Signals                      |
| Strict unidirectional data flow                     | Redux                                             |
| Formal state machines                               | XState                                            |
| Server-state caching                                | TanStack Query                                    |
| One API from simple state to complex async logic    | **synstate-next**                                 |

[Async logic compared](/mono/synstate-next/comparison/async-logic/) writes one search box with each library that has derived values, to the same test suite.
