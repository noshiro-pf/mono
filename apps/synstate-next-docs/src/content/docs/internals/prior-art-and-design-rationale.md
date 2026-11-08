---
title: Prior art and design rationale
description: Where synstate-next's ideas come from — static scheduling, height-ordered propagation, stabilization numbers, owners — and why it keeps a static graph.
---

<!-- cspell:ignore Krishnamurthi Czaplicki Chong Maier Bainomugisha stabilizations ESOP PLDI -->

synstate-next keeps synstate's central idea and changes how it is carried out. This page puts both in context.

## The core idea

> The graph is static: a node's parents are fixed when it is created, so its depth, its place in the order of an update, is computed once. An update then needs one bucket per depth rather than a priority queue, and visits each node it reaches once, after all of its parents.

None of this is new. Static scheduling, topological order for glitch avoidance, and the observation that a static graph lets the order be computed once have all been described before, the earliest in 1987.

## Prior art in the literature

- **Static scheduling of dataflow graphs.** Lee and Messerschmitt's _Static Scheduling of Synchronous Data Flow Programs_ (1987) schedules a dataflow graph whose rates are known ahead of time once, at compile time, "so the run-time overhead evaporates". A static graph of observables is the same situation.
- **Topological order against glitches.** FrTime (Cooper and Krishnamurthi, 2006) gives each node a height greater than its dependencies' and propagates through a priority queue in height order; since its graphs are dynamic, it recomputes heights when the graph changes. Elm's original FRP (Czaplicki and Chong, 2013) restricted its signal graph to be fixed at start-up. Scala.React (Maier and Odersky, 2012) propagates in topological order in two phases.
- **Surveys.** Bainomugisha et al.'s _A Survey on Reactive Programming_ (2013) separates static from dynamic dependency graphs and names "updating values in topological order" as the standard technique for glitch freedom.

## What the rebuild adds, and where it comes from

| synstate-next                        | What it replaces in synstate                 | Precedent                                                                                       |
| :----------------------------------- | :------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| An update is an integer epoch        | An update token object per write             | Jane Street's Incremental numbers its stabilizations and records on each node when it changed   |
| Effects run after the drain          | Subscribers called during propagation        | The effect queues of Solid and Preact Signals, which run effects after the update               |
| Writes during the drain are deferred | Nested updates with bucket sets of their own | The same libraries' batching of writes made while an update runs                                |
| Owners are the only lifetime         | Scopes plus completion and reference counts  | Solid's owner tree (`createRoot`, `getOwner`, `onCleanup`)                                      |
| `settled` is asked where it is used  | Completion pushed down the graph             | None in particular: it is the question completion answered, asked only where the answer is used |

## Why the graph stays static

Most UI-oriented reactive libraries (Angular Signals, Preact Signals, Solid, MobX, Vue, Jotai) track dependencies while a computation runs, so the set of what a value depends on can change between runs. synstate-next keeps a static graph, for the reasons synstate did:

- **Conditional dependencies are values.** A `derive` over every branch that returns the active one computes from a write to an inactive branch and finds the same value: one call and one comparison, after which the cut-off stops the update. Where that is too much, `switchMap` follows only the branch selected, and replaces its inner observable when the selection changes.
- **Collections are one observable.** A list held in one state, with a derived observable per item (`map` to the item, cut off when it did not change), updates only what changed. synstate-dom-next's `For` keeps a state per row for the same reason.
- **Asynchronous data is a `switchMap`.** A request that depends on a value is projected from it, and disposing the projection aborts the request: the lifetime of the request is in the code.
- **The dependencies are in the code.** `derive([a, b], fn)` says what it reads, like the dependency array of React's `useMemo`, and no read inside `fn` can add a dependency by accident.

What a static graph costs is the subscription to branches a value is not reading right now. Dynamic tracking avoids that, and pays instead for keeping each dependency set up to date on every run.

## References

- Lee, E.A. & Messerschmitt, D.G. (1987). _Static Scheduling of Synchronous Data Flow Programs._ IEEE Transactions on Computers, C-36(1), 24–35.
- Bainomugisha, E. et al. (2013). _A Survey on Reactive Programming._ ACM Computing Surveys, 45(4), Article 52.
- Cooper, G.H. & Krishnamurthi, S. (2006). _Embedding Dynamic Dataflow in a Call-by-Value Language._ ESOP 2006.
- Czaplicki, E. & Chong, S. (2013). _Asynchronous Functional Reactive Programming for GUIs._ PLDI 2013.
- Maier, I. & Odersky, M. (2012). _Deprecating the Observer Pattern with Scala.React._ EPFL Technical Report.
- Jane Street. _Incremental_, a library for self-adjusting computations. https://github.com/janestreet/incremental
- Solid. _Reactivity: owners and roots._ https://docs.solidjs.com/
