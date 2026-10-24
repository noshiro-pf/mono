---
title: インストール
description: SynState と React・Preact 向けフレームワーク連携パッケージ、ESLint プラグインを npm / yarn / pnpm でインストールする方法。
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

API は `synstate-react-hooks` と同一です。詳細は [React 連携](/mono/synstate/ja/guides/react-integration/#react-v17-以前)を参照してください。

### Preact Hooks

Preact を使用している場合は、コンパニオン hooks パッケージをインストールしてください：

```bash
npm add synstate-preact-hooks
```

### ESLint プラグイン

`eslint-plugin-synstate` は、型では検出できない誤りを報告します。たとえば subscriber からの state への書き込みです（`synstate/no-write-during-propagation`、[subscriber からの書き込み](/mono/synstate/ja/internals/tracing-an-update/#subscriber-からの書き込み非推奨パターン)を参照）。ESLint 9 以降の flat config が必要です：

```bash
npm add -D eslint-plugin-synstate
```

`recommended` プリセットはプラグインを登録し、すべてのルールを有効にします：

```ts
// eslint.config.mts
import { eslintPluginSynstate } from 'eslint-plugin-synstate';

export default [eslintPluginSynstate.configs.recommended];
```

ルールの一覧と個別の設定方法は[プラグインの README](https://github.com/noshiro-pf/mono/tree/main/libs/eslint-plugin-synstate#readme) にあります。
