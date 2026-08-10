---
title: はじめに
description: SynState の概要 — Observable パターンに基づく、TypeScript/JavaScript 向けの軽量・型安全な状態管理ライブラリ。
sidebar:
    order: 1
---

<p align="center">
  <img src="/synstate/synstate-logo.png" alt="SynState ロゴ" width="400" />
</p>

**SynState** は TypeScript/JavaScript 向けの軽量・高性能な状態管理ライブラリです。シンプルなグローバル状態から、`debounce` や `switchMap` を使った複雑な非同期パイプラインまで統一 API で記述できます。React Compiler と完全互換。

「SynState」は「Synchronized + State」に由来します。グリッチフリーな伝搬により、派生値は常に一貫した状態に保たれます — 不整合な中間状態は発生しません。（詳細： [SynState がグリッチを解決した方法](/synstate/ja/internals/how-synstate-solved-the-glitch/)）

## 特徴

- 🎯 **シンプルな状態管理**： React の `useState`/`useReducer` に似た使いやすい `createState` と `createReducer`（グローバル状態向け）。
- ⚡ **高パフォーマンス**： グリッチフリー $O(n)$ 伝搬 — Jotai の約30倍、Redux の約16倍高速。[ベンチマーク結果](/synstate/ja/guides/library-comparison/benchmark/)を参照。
- 🚀 **軽量**： <!-- bundle-size:synstate -->~4.4 kB min+gzip<!-- /bundle-size:synstate -->、外部ランタイム依存は [ts-data-forge](https://www.npmjs.com/package/ts-data-forge) のみ。
- 🔧 **非同期オペレーター内蔵**： `debounce`、`throttle`、`switchMap` など — 複雑な非同期処理を外部ライブラリなしに統一的な宣言的 API で記述。
- ⚛️ **React 最適化**： [React Compiler](https://react.dev/learn/react-compiler) と完全互換。`synstate-react-hooks` により数行でコンポーネントにグローバル状態を導入。
- 🌐 **フレームワーク非依存**： コアはバニラ JavaScript、Vue、Svelte など任意のフレームワークでそのまま動作。React / Preact 向けには hooks ラッパー（`synstate-react-hooks` / `synstate-preact-hooks`）、Preact 向けにはさらに [Preact Signals 連携](/synstate/ja/preact-signals/demo/)（`synstate-preact-signals`）も用意。

## 簡単な例

`createState` を1回呼ぶだけで、アプリケーションにグローバル状態を追加できます：

```tsx
import { createState } from 'synstate';

// リアクティブな状態を作成
const [state, setState] = createState(0);

// 変更を購読
state.subscribe((count) => {
    console.log(count); // 0, 1
});

// 状態を更新
setState(1);
```

`createState` はリアクティブな状態（InitializedObservable）とセッター関数を作成します。サブスクライバーは初期値で即座に呼び出され、状態が更新されるたびに再び呼び出されます。

`createState` は3番目の要素として追加のユーティリティも返します：

```ts
const [
    state,
    setState,
    { updateState, resetState, getSnapshot, initialState },
] = createState(0);

updateState((prev) => prev + 2); // 前の値を使って更新
getSnapshot(); // 現在の値を同期的に読み取り（2）
initialState; // createState に渡した初期値（0）

resetState(); // 初期値（0）にリセット
getSnapshot(); // 現在の値を同期的に読み取り（0）
```

## `pipe` で値を派生する

SynState の力は Observable の合成にあります。`pipe` で新しい値を派生し、`combine` で複数のソースを結合します：

```tsx
import {
    combine,
    createState,
    type InitializedObservable,
    map,
} from 'synstate';

const [count, setCount] = createState<number>(0);

// 現在の値を取得
console.log(count.getSnapshot().value); // 0

// pipe で新しい Observable を派生
const doubled: InitializedObservable<number> = count.pipe(map((n) => n * 2));

// 複数の Observable を結合
const combined: InitializedObservable<string> = combine([count, doubled]).pipe(
    map(([c, d]) => `(${c}, ${d})`),
);

// 変更を購読
count.subscribe((value) => {
    console.log('count:', value); // 0, 1, 2, 3
});

doubled.subscribe((value) => {
    console.log('doubled:', value); // 0, 2, 4, 6
});

combined.subscribe((value) => {
    console.log(value); // "(0, 0)", "(1, 2)", "(2, 4)", "(3, 6)"
});

// 状態を更新
setCount(1);
setCount(2);
setCount(3);
```

この宣言的なモデルがどのように機能するか、なぜ命令的に状態を管理するよりも優れているかについては、[宣言的な状態管理](/synstate/ja/guides/declarative-state-management/)を参照してください。

## React で使う

`createState` は**モジュールスコープ**（コンポーネントの外）で呼び出す必要があります。SynState は `synstate-react-hooks` というコンパニオンパッケージを提供しており、Observable と React を橋渡しします：

```tsx
import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

const [useUserState, setUserState] = createState({
    name: '',
    email: '',
});

const UserProfile = (): React.JSX.Element => {
    const user = useUserState();

    return (
        <div>
            <p>{`Name: ${user.name}`}</p>
            <button
                onClick={() => {
                    setUserState({
                        name: 'Alice',
                        email: 'alice@example.com',
                    });
                }}
            >
                {'Set User'}
            </button>
        </div>
    );
};
```

詳細は [React 連携](/synstate/ja/guides/react-integration/)を参照してください。

## 次のステップ

- [インストール](/synstate/ja/getting-started/installation/) — SynState とオプションのコンパニオンパッケージをインストール。
- [SynState の強み](/synstate/ja/guides/why-synstate/) — 設計思想、グリッチフリー保証、ユースケース。
- [宣言的な状態管理](/synstate/ja/guides/declarative-state-management/) — 具体的な例でリアクティブプログラミングモデルを理解する。
- [React 連携](/synstate/ja/guides/react-integration/) — SynState を React で使う。
