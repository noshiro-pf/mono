# SynState

<p align="center">
  <img src="https://github.com/noshiro-pf/mono/raw/main/libs/synstate/assets/synstate-logo.png" alt="SynState Logo" width="400" />
</p>

<p align="center">

[![npm version](https://img.shields.io/npm/v/synstate.svg)](https://www.npmjs.com/package/synstate)
[![npm downloads](https://img.shields.io/npm/dm/synstate.svg)](https://www.npmjs.com/package/synstate)
[![License](https://img.shields.io/npm/l/synstate.svg)](https://github.com/noshiro-pf/mono/blob/main/libs/synstate/LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/mono/graph/badge.svg?component=synstate)](https://codecov.io/gh/noshiro-pf/mono)

</p>

**SynState** is a glitch-free, type-safe state management library for
TypeScript and JavaScript: states, events and the values derived from them, in
one graph that every update brings up to date at once.

"SynState" is named after "Synchronized + State": no subscriber ever sees a
half-updated graph.

## Features

- **Simple state**: `createState`, `createReducer` and `createBooleanState`,
  like React's `useState` and `useReducer`, for state shared across an
  application.
- **Glitch-free**: an update recomputes what it reaches once each, in order, and
  runs the subscribers after every value is up to date, the values `debounce` or
  `switchMap` deliver later included.
- **Type-safe**: an observable that always holds a value is typed
  `InitializedObservable`, and the operators keep or drop that guarantee in
  their types.
- **Events**: `createValueEmitter` and `createEventEmitter`, with operators such
  as `debounce`, `throttle` and `audit`.
- **Owners for lifetimes**: everything created while an owner runs is disposed
  with it, subscriptions, timers and requests included; there is no completion
  travelling down the graph to manage.
- **Framework agnostic**, with [synstate-dom](../synstate-dom/README.md) as its
  own UI library.

## Documentation

- <https://noshiro-pf.github.io/mono/synstate/>

What changed from synstate 9, and how to move an application over, is on the
docs site's changes page. The design, and why, is in [DESIGN.md](./DESIGN.md).

## Installation

```bash
npm add synstate
```

Or with other package managers:

```bash
# Yarn
yarn add synstate

# pnpm
pnpm add synstate
```

## What is here

- `state` (with the options `equals` and `keepEqualParts`), `source`, `batch`,
  owners (`createOwner`, `onCleanup`, `untracked`).
- The sources `timer`, `counter`, `fromPromise`, `fromAbortablePromise`,
  `fromSubscribable`, `just` and `empty`.
- `pipe` with the operators `map`, `filter`, `scan`, `withInitialValue`,
  `dropInitialValue`, `skipIfNoChange`, `keepEqualParts`, `pairwise`, `take`,
  `skip`, `takeWhile`, `skipWhile`, `takeUntil`, `skipUntil`,
  `withCurrentValueFrom`, `withBufferedFrom`, `debounce`, `throttle`, `audit`,
  `switchMap` and `mergeMap`, and `derive`, `merge` and `zip`.
- The helpers `createState`, `createReducer`, `createBooleanState`,
  `createEventEmitter` and `createValueEmitter`.
- `createDerived` and `createSource`, for writing an operator or a source
  outside the package.
- `synstate/internal`: the node and effect classes, for synstate-dom only.

## License

This project is licensed under the [Apache License 2.0](https://github.com/noshiro-pf/mono/blob/main/libs/synstate/LICENSE).

## Repository

<https://github.com/noshiro-pf/mono/tree/main/libs/synstate>
