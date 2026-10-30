---
title: Without a compiler
description: Why synstate-dom needs no compiler where Solid uses one, and what that costs.
---

<!-- cspell:ignore snabbdom Voby Leptos -->

Solid and synstate-dom share an execution model: a component runs once, and updates write to the DOM directly. Yet Solid ships a compiler and synstate-dom does not. The difference comes down to what marks a dependency.

In Solid, a dependency is a call that reads a signal, such as `count()`. For that call to run again inside an effect, the JSX expression around it has to stay unevaluated, so the compiler rewrites your JSX to keep it that way. In synstate-dom, a dependency is a value, the observable `count$`. You pass it instead of calling it, so there is nothing to keep unevaluated.

| What Solid's compiler does                                                                                                                                                                       | Why synstate-dom does not need it                                                                                                                                                              |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Makes expressions lazy.** `{count()}` becomes something like `insert(el, () => count())`, re-evaluated in an effect. Without the compiler (`solid-js/h`) you write `{() => count()}` yourself. | `count$` is already deferred when you pass it. If you pass a plain value by mistake, you get a type error rather than a compiler fix ([Bindable values](/mono/synstate-dom/guides/bindable/)). |
| **Turns props into getters.** `<Comp v={count()} />` becomes `get v() { return count() }`, which is why destructuring props loses reactivity.                                                    | A prop holds the observable itself, so there is no getter to lose, and destructuring is safe ([Props are plain JavaScript](/mono/synstate-dom/guides/components/#props-are-plain-javascript)). |
| **Makes the children of `<Show>` lazy**, so that only the chosen branch is evaluated.                                                                                                            | `jsx()` returns a description, not DOM, so you can write both branches of `If` and only the chosen one mounts ([Control flow](/mono/synstate-dom/guides/control-flow/)).                       |
| **Optimizes the static parts.** Static HTML is extracted into a `<template>` and cloned; attributes, properties and events are told apart at compile time.                                       | What is static is decided at run time: a `Constant` or a completed observable is written once and never subscribed to. A table tells attributes and properties apart.                          |

The Solid column is based on the README of [babel-plugin-jsx-dom-expressions](https://github.com/ryansolid/dom-expressions/blob/main/packages/babel-plugin-jsx-dom-expressions/README.md), the transform behind Solid's JSX, and those of [`solid-js/h`](https://github.com/solidjs/solid/blob/main/packages/solid/h/README.md) and [`solid-js/html`](https://github.com/solidjs/solid/blob/main/packages/solid/html/README.md).

## What it costs

- **No template cloning.** Every element gets its own `createElement` call, so creating many rows takes longer than in Solid. The [benchmark](/mono/synstate-dom/background/benchmark/) shows by how much.
- **More to write.** You cannot write an expression such as `count() * 2` in place; you write `view(count$, (n) => n * 2)` or `count$.pipe(map(...))` instead. Several inputs take `derive`, an element shown depending on an updating value takes `If`, and a fixed string becomes `constant('...')`. Writing that means learning these helpers and, beyond them, synstate's operators. In return, the types show you what is reactive, and props need no special handling ([Props are plain JavaScript](/mono/synstate-dom/guides/components/#props-are-plain-javascript)).

## Prior art

- **Solid** (`createRoot`, owners, `<For>`, `runWithOwner`): the closest execution model and use of scopes. It tracks dependencies automatically and accepts `T | Accessor<T>`.
- **Vue 3's `effectScope`**: the same `run` / `getCurrentScope` / `onScopeDispose` API, implemented the same way.
- **Cycle.js**: components called once and wired up, with explicit dependencies; its DOM output is a `Stream<VNode>` diffed by snabbdom.
- **VanJS, Voby, Sinuous, `solid-js/h`**: fine-grained updates without a compiler, but all of them accept plain values where synstate-dom requires a `Bindable`.
- **Leptos** (Rust): types props as `Signal<T>`, an idea close to `Bindable<T>`.
