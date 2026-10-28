---
title: Introduction
description: What synstate-dom is, and the model it is built on.
---

synstate-dom is a UI library that binds [synstate](https://noshiro-pf.github.io/mono/synstate/) observables directly to the DOM. You write JSX and pass observables where values go. Unlike Solid, it needs no compiler, and there is no virtual DOM.

:::caution
synstate-dom is at version 0.x: its API may still change in a minor release. The design is recorded in [`SPEC.md`](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-dom/SPEC.md) (in Japanese), and this site follows the implementation as it catches up.
:::

## The model

- **A component is called once.** It runs when it is mounted and returns a description of the DOM. It is never called again: what changes later is only the DOM bound to the observables it was given.
- **Updates go to the leaves.** When a state changes, synstate propagates the change through its graph in one synchronous, glitch-free pass, and each bound attribute, property or text node is written to directly. Nothing is diffed.
- **Dependencies are values.** A component depends on what it was passed, an observable, so nothing has to be tracked while it runs, and nothing has to be compiled to make a JSX expression lazy, as Solid's compiler does. See [Without a compiler](/mono/synstate-dom/background/without-a-compiler/).
- **The types say what is reactive.** A slot that takes data accepts a `Bindable<T>`: an observable with an initial value, a `constant(...)` or a `view(...)`. A plain value is a type error, so a snapshot cannot be passed by mistake. See [Bindable values](/mono/synstate-dom/guides/bindable/).

    In Solid, a prop is typed as the plain `T` whether the caller passed a signal read or a fixed value, so the types cannot tell a value meant to update from one that is not, nor reject the wrong one. Reading a prop once in the component body, or destructuring props, silently stops the updates, and only lint rules (`solid/reactivity` and `solid/no-destructure` of eslint-plugin-solid) point it out. In synstate-dom, whether something updates is whether it is a `Bindable`: it shows in the signature, and `tsc` checks it.

- **Scopes clean up.** Each branch of `If` / `Match` and each row of `For` is mounted in a scope. Derivations and subscriptions created while mounting it belong to that scope and are disposed with it. See [Lifecycle and scopes](/mono/synstate-dom/guides/lifecycle/).

## What it is not (yet)

- No server-side rendering or hydration.
- No context: pass what a subtree needs through props, or import the store.
- No re-running of components, as Preact Signals or React do.

## Where to go next

- [Installation](/mono/synstate-dom/getting-started/installation/) sets up the JSX transform and renders a counter.
- [Benchmark](/mono/synstate-dom/background/benchmark/) compares synstate-dom with Solid, Preact + Signals, Preact, React and VanJS on the operations of js-framework-benchmark, and [Bundle size](/mono/synstate-dom/background/bundle-size/) on what each adds to the same applications.
