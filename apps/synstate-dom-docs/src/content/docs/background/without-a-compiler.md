---
title: Without a compiler
description: Why synstate-dom needs no compiler where Solid uses one, and what that costs.
---

<!-- cspell:ignore snabbdom Voby Leptos -->

Solid and synstate-dom share an execution model: a component runs once, and updates write to the DOM directly. Solid ships a compiler and synstate-dom does not. The difference comes from what marks a dependency.

In Solid, a dependency is a call that reads a signal, `count()`. A JSX expression has to stay unevaluated so that the call can run again inside an effect, and the compiler rewrites the JSX to keep it so. In synstate-dom a dependency is a value, the observable `count$`, which is passed rather than called, so there is nothing to keep unevaluated.

| What Solid's compiler does                                                                                                                                                                       | Why synstate-dom does not need it                                                                                                                                                                 |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Makes expressions lazy.** `{count()}` becomes something like `insert(el, () => count())`, re-evaluated in an effect. Without the compiler (`solid-js/h`) you write `{() => count()}` yourself. | `count$` is already deferred when it is passed. Passing a plain value by mistake is a type error rather than something a compiler fixes ([Bindable values](/mono/synstate-dom/guides/bindable/)). |
| **Turns props into getters.** `<Comp v={count()} />` becomes `get v() { return count() }`, which is why destructuring props loses reactivity.                                                    | A prop holds the observable itself, so there is no getter to lose, and destructuring is safe ([Components](/mono/synstate-dom/guides/components/)).                                               |
| **Makes the children of `<Show>` lazy**, so that only the chosen branch is evaluated.                                                                                                            | `jsx()` returns a description, not DOM, so writing both branches of `If` mounts only the chosen one ([Control flow](/mono/synstate-dom/guides/control-flow/)).                                    |
| **Optimizes the static parts.** Static HTML is extracted into a `<template>` and cloned; attributes, properties and events are told apart at compile time.                                       | What is static is decided at run time: a `Constant` or a completed observable is written once and not subscribed. Attributes and properties are told apart by a table.                            |

The Solid side was checked against the README of [babel-plugin-jsx-dom-expressions](https://github.com/ryansolid/dom-expressions/blob/main/packages/babel-plugin-jsx-dom-expressions/README.md), the transform behind Solid's JSX, and those of [`solid-js/h`](https://github.com/solidjs/solid/blob/main/packages/solid/h/README.md) and [`solid-js/html`](https://github.com/solidjs/solid/blob/main/packages/solid/html/README.md).

## What it costs

- **No template cloning.** Each element is made with its own `createElement`. Creating many rows takes longer than Solid does, and the [benchmark](/mono/synstate-dom/background/benchmark/) shows by how much.
- **More to write.** An expression such as `count() * 2` cannot be written in place; it is `view(count$, (n) => n * 2)` or `count$.pipe(map(...))`, and a fixed string is `constant('...')`. In return, what is reactive is visible in the types.

## Prior art

- **Solid** (`createRoot`, owners, `<For>`, `runWithOwner`): the closest execution model and use of scopes. It tracks dependencies automatically and accepts `T | Accessor<T>`.
- **Vue 3's `effectScope`**: the same `run` / `getCurrentScope` / `onScopeDispose` API, implemented the same way.
- **Cycle.js**: components called once and wired up, with explicit dependencies; its DOM output is a `Stream<VNode>` diffed by snabbdom.
- **VanJS, Voby, Sinuous, `solid-js/h`**: fine-grained updates without a compiler, but all of them accept plain values where synstate-dom requires a `Bindable`.
- **Leptos** (Rust): types props as `Signal<T>`, an idea close to `Bindable<T>`.
