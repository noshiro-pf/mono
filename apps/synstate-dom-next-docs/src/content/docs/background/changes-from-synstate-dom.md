---
title: Changes from synstate-dom
description: What a synstate-dom application changes when it moves to synstate-dom-next and synstate-next.
---

synstate-dom-next keeps synstate-dom's model and most of its API: components called once, `Bindable` props and attributes, `constant`, `If`, `MatchOptional`, `MatchResult`, `For`, `Portal`, `mapBindable`, `deriveBindable`, `toObservable`, `listenInScope` and `createAfterUpdate` are used the same way. This page lists what differs, in synstate-dom-next and in the synstate-next underneath it.

## In synstate-dom-next

- **Bindings run once every value of the update is up to date**, once per update, instead of as subscribers during the propagation. `If`, `Switch` and `For` mount and unmount outside any propagation.
- **A branch or a row that goes never computes from the value that rules it out.** The decision is taken in the update, before the branch's nodes are visited ([How it works](/mono/synstate-dom-next/background/how-it-works/#a-branch-component-decides-before-its-branch-computes)).
- **`For` rows read their new element one update later** than `items` changed, before anything is painted. Rows whose element did not change are not visited.
- **`Switch` is public**: the keyed branch component `If`, `MatchOptional` and `MatchResult` are written with.
- **An element's namespace follows where it is mounted**, not its tag: inside an `<svg>`, down to a `<foreignObject>`, `<a>` and `<title>` are SVG elements. synstate-dom makes them HTML wherever they are. Their props are still typed as HTML's.
- **A branch component bound to an observable is marked by a comment at each end**, where synstate-dom puts one after it. One given a constant mounts its branch with no comment.
- **Event handlers are `on…` properties** where the element has one, and a listener otherwise; neither is removed, since the element goes with its owner.
- **A failure stays local.** A `For` row's or a branch's cleanup that throws stops neither the update nor the other disposals; the exception is thrown once the rows and branches are in place. A row that throws while mounting takes out the rows its update made and keeps the others; a branch that throws leaves its branch component empty until the next value. A binding that throws does not stop the other bindings of its update.
- **A controlled `checked` or `indeterminate`** is restored in the next animation frame or a task after the `change`, whichever comes first, so it is restored in a hidden page too.
- **`subscribeInScope` is gone**: a `subscribe` made while an owner runs belongs to that owner already.
- **`inlineMap` is not rebuilt**; synstate-dom has removed it too.
- **The low-level API is smaller.** `mountable(mount)` takes a function that returns the nodes; `mountChild(child, parent?)` returns a child's nodes, mounted in an owner of its own and appended to `parent` in its namespace when given; `isChild` is kept. `toNodes`, `createMountable` and the types `Mountable` and `MountedNodes` are gone ([Low-level API](/mono/synstate-dom-next/guides/low-level/)).
- **`Optional` and `Result`** for `MatchOptional` and `MatchResult` come from ts-std-forge.

## In synstate-next

These are the changes an application written with synstate-dom meets first; synstate-next's [DESIGN.md](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-next/DESIGN.md#breaking-changes-against-synstate) lists them all.

- **A scope is an owner.** `createScope` is `createOwner`, `getCurrentScope` is `getOwner`, `onScopeDispose` is `onCleanup`.
- **Subscribers run once every value is up to date**, not during the update, and a write made during propagation waits for it to end. Updates never nest, so there is no warning about writing while another state propagates: the write is simply applied next.
- **`complete` is gone.** An observable ends by being disposed with its owner. A source that is done (a `timer` that fired, a `fromPromise` that resolved) keeps its value until its owner disposes it.
- **The setters of `createState` return nothing**; read the state with `getSnapshot`, or with `.value` on the observable.
- **`getSnapshot()` returns the value or `undefined`**, not an `Optional`, and **`subscribe` returns the function that stops it**, not a `{ unsubscribe }` object.
- **Operators that are one `map` are gone** (`mapTo`, `pluck`, `getKey`, `attachIndex`, `mapOptional`, `unwrapOptional`, `mapResultOk`, …), and so are the aliases (`combineLatest`, `distinctUntilChanged`, `withLatestFrom`, `flatMap`). `combine` is gone too: `derive([a, b], (x, y) => [x, y] as const)` gives the tuple.
- **`timer` and `counter` start when they are created.** Create one inside the owner that should stop it.
- **Observables from two copies of the package cannot be combined**, or bound.
