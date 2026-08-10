---
title: Installation
description: Install SynState and its framework integrations for React, Preact, and Preact Signals via npm, yarn, or pnpm.
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

The API is identical to `synstate-react-hooks`. See [React Integration](/synstate/guides/react-integration/#react-v17-or-earlier) for details.

### Preact Hooks

If you are using Preact, install the companion hooks package:

```bash
npm add synstate-preact-hooks
```
