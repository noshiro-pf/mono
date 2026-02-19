# SynState

<p align="center">
  <img src="./packages/synstate/assets/synstate-icon.png" alt="SynState Logo" width="400" />
</p>

<p align="center">

[![npm version](https://img.shields.io/npm/v/synstate.svg)](https://www.npmjs.com/package/synstate)
[![npm downloads](https://img.shields.io/npm/dm/synstate.svg)](https://www.npmjs.com/package/synstate)
[![License](https://img.shields.io/npm/l/synstate.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/synstate/branch/main/graph/badge.svg?token=********)](https://codecov.io/gh/noshiro-pf/synstate)

</p>

**SynState** is a lightweight, high-performance, type-safe state management library for TypeScript/JavaScript. Perfect for building reactive global state and event-driven systems in React, Vue, and other frameworks.

## Features

- 🎯 **Simple State Management**: Easy-to-use `createState` and `createReducer` for global state
- 📡 **Event System**: Built-in `createValueEmitter`, `createEventEmitter` for event-driven architecture
- 🔄 **Reactive Updates**: Automatic propagation of state changes to subscribers
- 🎨 **Type-Safe**: Full TypeScript support with precise type inference
- 🚀 **Lightweight**: Minimal bundle size with only one external runtime dependency ([ts-data-forge](https://www.npmjs.com/package/ts-data-forge))
- ⚡ **High Performance**: Optimized for fast state updates and minimal re-renders
- 🌐 **Framework Agnostic**: Works with React, Vue, Svelte, or vanilla JavaScript
- 🔧 **Flexible**: Simple state management with optional advanced Observable-based features (operators like `map`, `filter`, `debounceTime`, `throttleTime`, and combinators like `merge`, `combine`)

## Packages

- [synstate](packages/synstate/README.md) (Core Library)
- [synstate-react-hooks](packages/synstate-react-hooks/README.md)
- [synstate-preact-hooks](packages/synstate-preact-hooks/README.md)

## For developers

### Local Setup

```sh
gh repo clone noshiro-pf/synstate
git submodule update --init --recursive
pnpm i
pnpm ws:build
```

## License

This project is licensed under the [Apache License 2.0](./LICENSE).
