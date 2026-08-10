---
title: インストール
description: SynState と React・Preact 向けフレームワーク連携パッケージを npm / yarn / pnpm でインストールする方法。
sidebar:
    order: 2
---

```bash
npm add synstate
```

または他のパッケージマネージャを使用する場合：

```bash
# Yarn
yarn add synstate

# pnpm
pnpm add synstate
```

### React Hooks

React を使用している場合は、コンパニオン hooks パッケージをインストールしてください：

```bash
npm add synstate-react-hooks
```

`synstate-react-hooks` は `synstate` のすべてのエクスポートに加えて、React 向けに拡張された `createState`、`createReducer`、`createBooleanState` API を含んでいるため、別途 `synstate` を追加する必要はありません。

### React Hooks（React 16.8–17）

React 16.8–17（`useSyncExternalStore` なし）の場合は、compat パッケージを使用してください：

```bash
npm add synstate-react-hooks-compat
```

API は `synstate-react-hooks` と同一です。詳細は [React 連携](/synstate/ja/guides/react-integration/#react-v17-以前)を参照してください。

### Preact Hooks

Preact を使用している場合は、コンパニオン hooks パッケージをインストールしてください：

```bash
npm add synstate-preact-hooks
```
