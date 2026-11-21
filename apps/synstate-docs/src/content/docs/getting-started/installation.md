---
title: Installation
description: Install synstate, its UI library synstate-dom, its bindings for React, Preact, Preact Signals and routing, and its ESLint plugin.
---

## Install

```sh
npm install synstate
```

`fromPromise`, `fromAbortablePromise` and `fromSubscribable` emit a `Result` of [ts-std-forge](https://github.com/noshiro-pf/mono/tree/main/libs/ts-std-forge), which synstate depends on. Add ts-std-forge to your own dependencies once your code imports `Result` to read them.

## One copy per program

A graph cannot span two copies of synstate: combining an observable with one from another copy throws. Keep one version of the package in your lockfile, and declare it as a peer dependency in a library that builds on it, as synstate-dom does.

## A UI

- **[synstate-dom](/mono/synstate-dom/)** binds observables straight to the DOM, with the same scheduler: a binding sits at the end of synstate's graph. It is the UI library made for synstate.
- **[React and Preact](/mono/synstate/integrations/react-and-preact/)**: `synstate-react-hooks` (React 18 and later), `synstate-react-hooks-compat` (React 16.8 and 17) and `synstate-preact-hooks` give a state as a hook and read any observable from a component.
- **[Preact Signals](/mono/synstate/integrations/preact-signals/)**: `synstate-preact-signals` bridges observables and signals in both directions.
- **[Routing](/mono/synstate/integrations/router/)**: `synstate-router`, with its bindings `synstate-router-dom`, `synstate-router-react` and `synstate-router-preact`.
- Any other framework needs a few lines, which [Using it with a UI](/mono/synstate/guides/using-with-a-ui/) shows.

## The ESLint plugin

`eslint-plugin-synstate` reports the patterns that work against the graph: a write to a state from a subscriber, which starts a second update where a derived value would be part of the first; a throw inside an operator; a `map` to a constant, which emits only once unless it is given `{ equals: () => false }`; a `map` that returns its input; a `skipIfNoChange` after an operator that already drops equal values. Its `synstate-dom` preset adds rules for synstate-dom's JSX.

```sh
npm install --save-dev eslint-plugin-synstate
```
