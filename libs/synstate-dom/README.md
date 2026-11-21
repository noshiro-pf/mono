# synstate-dom

A compiler-free, fine-grained UI library that binds
[synstate](https://github.com/noshiro-pf/mono/tree/main/libs/synstate)
observables directly to the DOM.

It is the UI library for SynState: the graph you build with SynState's operators
ends in the DOM node bound to it, with nothing converted on the way and no
component re-run to read a value. A component is called once; what changes
afterwards is only the DOM bound to the observables it was given.

## Features

- **A binding is one effect.** Each text, attribute, property, class or style
  binding holds its target in its own fields, and runs once every value of the
  update is up to date.
- **Mounting is a batch.** A write made while mounting propagates once the nodes
  are in the document, so nothing waits for an element to be attached.
- **Owners for lifetimes.** A component runs in an owner of its own; a
  subscription, a listener or a timer made while it mounts is disposed with it.
- **`If`, `MatchOptional`, `MatchResult` and `Switch`** mount one branch at a
  time, kept while its key stays. **`For`** keeps one row per key, visits only
  the rows whose element changed, and moves as few rows as it can.
  **`selector(source).is(key)`** writes only the rows of the old and the new
  key.
- **Typed props.** Attributes and DOM properties are typed from `lib.dom.d.ts`;
  every prop that takes data takes a `Bindable` (an `InitializedObservable` or a
  `constant(…)`), never a plain value, so a snapshot cannot be passed where a
  live value is meant.
- **Controlled inputs.** A bound `checked`, `indeterminate` or `<select>`
  `value` is drawn as its bound value again after a `change` the application
  does not take.

## Documentation

- <https://noshiro-pf.github.io/mono/synstate-dom/>

What changed from synstate-dom 0.13, and how to move an application over, is on
the docs site's changes page.

## Installation

```bash
npm add synstate synstate-dom
```

Or with other package managers:

```bash
# Yarn
yarn add synstate synstate-dom

# pnpm
pnpm add synstate synstate-dom
```

Then set the JSX transform to this package in `tsconfig.json`:

```jsonc
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "synstate-dom",
    },
}
```

## What is here

- `render(App, container)`, which mounts `App` and returns the function that
  unmounts it.
- `constant`, the `Bindable` and `Constant` types, and the helpers
  `mapBindable`, `deriveBindable` and `toObservable` for a component that
  receives a `Bindable`.
- The components `If`, `MatchOptional`, `MatchResult`, `Switch`, `For` and
  `Portal`, and `selector`.
- `listenInScope` and `createAfterUpdate`, what a component, called once, does
  in place of an effect; `isImeKeyDown`, whether a key down belongs to an input
  method.
- The low-level API `mountable`, `mountChild` and `isChild`, for a component
  that makes its own nodes.

## License

This project is licensed under the [Apache License 2.0](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-dom/LICENSE).

## Repository

<https://github.com/noshiro-pf/mono/tree/main/libs/synstate-dom>
