---
title: Introduction
description: What synstate-dom-next is, and the model it is built on.
---

synstate-dom-next is a UI library that binds [synstate-next](https://github.com/noshiro-pf/mono/tree/main/libs/synstate-next) observables directly to the DOM. You write JSX and pass observables wherever values go. Like Solid, a component runs once and updates write straight to the DOM; unlike Solid, it needs no compiler. There is no virtual DOM.

:::caution
synstate-dom-next and synstate-next are a from-scratch rebuild of synstate-dom and synstate, kept as private packages in the repository until they replace the current ones in their next major versions. They are not published, and their API may change until then. What changed from synstate-dom is listed in [Changes from synstate-dom](/mono/synstate-dom-next/background/changes-from-synstate-dom/).
:::

## Why synstate-dom-next

synstate-dom-next is the UI library for SynState's next generation. It connects to synstate-next's runtime as directly as a UI can: a binding is not a subscriber wrapped around a closure but a leaf of the graph itself, an effect that holds its DOM node in its own fields. The graph you build with synstate-next's operators ends in the node bound to it.

- **A simple API that is rarely slow.** There is one way to write each thing: a transformed value is `source$.pipe(map(fn))` wherever it is bound, a choice is `If`, `MatchOptional`, `MatchResult` or `Switch`, and a list is `For`. On the operations of js-framework-benchmark, synstate-dom-next takes <!-- benchmark:next-over-dom-min -->0.78<!-- /benchmark -->× to <!-- benchmark:next-over-dom-max -->1.00<!-- /benchmark -->× synstate-dom's time, and at most <!-- benchmark:next-over-solid-max -->1.31<!-- /benchmark -->× Solid's. See [Benchmark](/mono/synstate-dom-next/background/benchmark/).
- **Bindings run after the update has settled.** An update propagates through the whole graph before any binding runs. A binding never sees a half-updated graph, and a switch that drops a branch decides so before the branch's derivations could compute from a value that rules it out. See [How it works](/mono/synstate-dom-next/background/how-it-works/).

## The model

- **A component is called once.** It runs when it mounts, returns a description of the DOM, and is never called again. From then on, the only thing that changes is the DOM bound to the observables you gave it.
- **Updates go straight to the leaves.** When a state changes, synstate-next propagates the change through its graph in one glitch-free pass, visiting each node once, after all of its parents. Then each binding the update reached writes its attribute, property or text node. Nothing is diffed.
- **Dependencies are values.** A component depends on the observables you pass it. So there is nothing to track while it runs, and no JSX expression has to be compiled into a lazy one, as Solid's compiler does. See [Without a compiler](/mono/synstate-dom-next/background/without-a-compiler/).
- **The types say what is reactive.** Anywhere that takes data accepts a `Bindable<T>`: an observable that holds a value, or a `constant(...)`. A plain value is a type error, so you cannot pass a snapshot by mistake. See [Bindable values](/mono/synstate-dom-next/guides/bindable/).

    In Solid, a prop has the plain type `T` whether the caller passed a signal read or a fixed value, so the types cannot reject the wrong one. If you read a prop once in the component body, or destructure props, the updates silently stop, and only lint rules (`solid/reactivity` and `solid/no-destructure` of eslint-plugin-solid) point it out. Here, whether something updates comes down to whether it is a `Bindable`: you see it in the signature, and `tsc` checks it.

    Since a prop holds the `Bindable` itself, not a value read from it, props need no special handling: destructure them, give them defaults, forward the rest, or compute from them in the component body. The price is that a value derived from props that should keep updating is built as a bindable (with `mapBindable` or `deriveBindable`) rather than written as an expression in JSX. See [Props are plain JavaScript](/mono/synstate-dom-next/guides/components/#props-are-plain-javascript).

- **Owners clean up after you.** Everything created while an owner runs belongs to it: the derivations, the bindings, the subscriptions. `render` makes the root owner, and each branch of a switch and each row of `For` mounts in an owner of its own, disposed when the branch or the row goes. See [Lifecycle and owners](/mono/synstate-dom-next/guides/lifecycle/).

## What it is not (yet)

- No server-side rendering or hydration.
- No context: pass what a subtree needs through props, or import the store.
- No re-running components, as Preact Signals or React do.

## Where to go next

- [Installation](/mono/synstate-dom-next/getting-started/installation/) sets up the JSX transform and renders a counter.
- [How it works](/mono/synstate-dom-next/background/how-it-works/) follows an update from a write to the DOM, and says why the rebuild is faster than synstate-dom.
- [Benchmark](/mono/synstate-dom-next/background/benchmark/) compares synstate-dom-next with synstate-dom and Solid on the operations of js-framework-benchmark and three scenarios, and [Bundle size](/mono/synstate-dom-next/background/bundle-size/) compares what each adds to the same applications.
