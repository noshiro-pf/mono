---
title: Introduction
description: What synstate-dom is, and the model it is built on.
---

synstate-dom is a UI library that binds [synstate](https://noshiro-pf.github.io/mono/synstate/) observables directly to the DOM. You write JSX and pass observables wherever values go. Unlike Solid, it needs no compiler, and there is no virtual DOM.

:::caution
synstate-dom is still at version 0.x, so its API may change in a minor release. The design lives in [`SPEC.md`](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-dom/SPEC.md) (in Japanese), and this site fills in as it catches up with the implementation.
:::

## Why synstate-dom

synstate-dom is the UI library for SynState. It is built to connect to SynState's runtime as directly as a UI can: the graph you build with SynState's operators ends in the DOM node bound to it, with no value converted into another library's model on the way and no component re-run to read it.

- **SynState's speed reaches the screen.** In [SynState's benchmark summary](/mono/synstate/guides/library-comparison/benchmark/#how-to-read-this-page), SynState stays within <!-- bench:summary/synstate-worst-over-fastest -->2.7<!-- /bench -->× of the fastest library in every scenario: <!-- bench:summary/synstate-alone-in-single-digits -->the only library measured in all of them whose worst case stays in single digits<!-- /bench -->. synstate-dom puts nothing between that graph and the page.
- **A simple API that is rarely slow.** synstate-dom keeps one way to write each thing rather than adding forms that only win a row of a benchmark: a transformed value is `source$.pipe(map(fn))` wherever it is bound. On the operations of js-framework-benchmark, its slowest operation takes <!-- benchmark:worst/synstate-dom -->1.56<!-- /benchmark -->× the fastest library's time: <!-- benchmark:placement/behind -->behind Solid, Preact and Preact + Signals<!-- /benchmark -->, and well ahead of React, whose slowest takes <!-- benchmark:worst/react -->3.79<!-- /benchmark -->×. See [Benchmark](/mono/synstate-dom/background/benchmark/#reading-the-results).

## The model

- **A component is called once.** It runs when it mounts, returns a description of the DOM, and is never called again. From then on, the only thing that changes is the DOM bound to the observables you gave it.
- **Updates go straight to the leaves.** When a state changes, synstate propagates the change through its graph in one synchronous, glitch-free pass, and synstate-dom writes it directly into each bound attribute, property or text node. Nothing is diffed.
- **Dependencies are values.** A component depends on the observables you pass it. So there is nothing to track while it runs, and no JSX expression has to be compiled into a lazy one, as Solid's compiler does. See [Without a compiler](/mono/synstate-dom/background/without-a-compiler/).
- **The types say what is reactive.** Anywhere that takes data accepts a `Bindable<T>`: an observable with an initial value or a `constant(...)`. A plain value is a type error, so you cannot pass a snapshot by mistake. See [Bindable values](/mono/synstate-dom/guides/bindable/).

    In Solid, a prop has the plain type `T` whether the caller passed a signal read or a fixed value. The types cannot tell a value that should update from one that should not, so they cannot reject the wrong one either. If you read a prop once in the component body, or destructure props, the updates silently stop, and only lint rules (`solid/reactivity` and `solid/no-destructure` of eslint-plugin-solid) will point it out. In synstate-dom, whether something updates comes down to whether it is a `Bindable`: you can see it in the signature, and `tsc` checks it.

    And since a prop holds the `Bindable` itself, not a value read from it, props need no special handling: you can destructure them, give them defaults, forward the rest, or compute from them in the component body. The price is that a value derived from props that should keep updating is built as a bindable (with `mapBindable` or `deriveBindable`) rather than written as an expression in JSX. See [Props are plain JavaScript](/mono/synstate-dom/guides/components/#props-are-plain-javascript).

- **Scopes clean up after you.** Each branch of `If` / `Match` and each row of `For` mounts in a scope. Any derivation or subscription created while it mounts belongs to that scope and is disposed with it. See [Lifecycle and scopes](/mono/synstate-dom/guides/lifecycle/).

## What it is not (yet)

- No server-side rendering or hydration.
- No context: pass what a subtree needs through props, or import the store.
- No re-running components, as Preact Signals or React do.

## Where to go next

- [Installation](/mono/synstate-dom/getting-started/installation/) sets up the JSX transform and renders a counter.
- [Benchmark](/mono/synstate-dom/background/benchmark/) compares synstate-dom with Solid, Preact + Signals, Preact, React and VanJS on the operations of js-framework-benchmark, and [Bundle size](/mono/synstate-dom/background/bundle-size/) compares how much each adds to the same applications.
