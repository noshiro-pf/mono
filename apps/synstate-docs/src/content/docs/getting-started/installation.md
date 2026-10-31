---
title: Installation
description: Install SynState, its framework integrations for React, Preact, and Preact Signals, and its ESLint plugin via npm, yarn, or pnpm.
sidebar:
    order: 2
---

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

### React Hooks

If you are using React, install the companion hooks package:

```bash
npm add synstate-react-hooks
```

`synstate-react-hooks` includes all exports from `synstate` plus the `createState`, `createReducer`, and `createBooleanState` APIs extended for React, so you don't need to add `synstate` along with it.

### React Hooks (React 16.8–17)

For React 16.8–17 (without `useSyncExternalStore`), use the compat package instead:

```bash
npm add synstate-react-hooks-compat
```

The API is identical to `synstate-react-hooks`. See [React Integration](/mono/synstate/guides/react-integration/#react-v17-or-earlier) for details.

### Preact Hooks

If you are using Preact, install the companion hooks package:

```bash
npm add synstate-preact-hooks
```

### Preact Signals

To render with [Preact Signals](https://preactjs.com/guide/v10/signals/) instead of hooks, install the bridge package together with its peer dependencies, `preact` and `@preact/signals`:

```bash
npm add synstate-preact-signals preact @preact/signals
```

It converts between Observables and signals (`toSignal`, `fromSignal`), and its `createState`, `createReducer` and `createBooleanState` return a `ReadonlySignal` instead of a hook. Like the hooks packages, it re-exports the functions of `synstate`. See the [Preact Signals demo](/mono/synstate/preact-signals/demo/).

### synstate-dom (no framework)

[synstate-dom](/mono/synstate-dom/) is a compiler-free UI library built on SynState that binds Observables directly to the DOM, with no virtual DOM and no framework. Its [installation](/mono/synstate-dom/getting-started/installation/) and API are on its own documentation site.

### ESLint plugin

`eslint-plugin-synstate` reports mistakes that the types cannot catch, such as a write to a state from a subscriber (`synstate/no-write-during-propagation`, see [A write from a subscriber](/mono/synstate/internals/tracing-an-update/#a-write-from-a-subscriber-an-anti-pattern)). It needs ESLint 9 or later, with a flat config:

```bash
npm add -D eslint-plugin-synstate
```

Its `recommended` preset registers the plugin and turns on every rule. The rules need no type information; when your config already lints with it (`parserOptions.projectService`), `no-write-during-propagation` also follows setters imported from other files:

```ts
// eslint.config.mts
import { eslintPluginSynstate } from 'eslint-plugin-synstate';

export default [eslintPluginSynstate.configs.recommended];
```

The rules and how to configure them one by one are in the [plugin's README](https://github.com/noshiro-pf/mono/tree/main/libs/eslint-plugin-synstate#readme).
